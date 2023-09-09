import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "url";

import { DEBUG } from "./Debug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function dynamicRegisterEvents(io) {
    const events = fs.readdirSync(path.join(__dirname, "Events"));
    if (!events) return;

    for (let event of events) {
        const module = await import(`./Events/${event}`);

        for (let internal_event of Object.keys(module)) {
            DEBUG(`Registering ${internal_event} event...`);
            module[internal_event](io);
        }
    }
}

/** @param {Server} server  */
export function loadEventHandler(server) {
    server.on(
        "connection",
        /** @param {Socket} client */
        (client) => {
            dynamicRegisterEvents({ server, client });
        }
    );
}
