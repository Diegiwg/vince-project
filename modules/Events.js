import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "url";

import { DEBUG, INFO, SUCCESS } from "./Debug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let event_registered = false;
async function dynamicRegisterEvents(io) {
    if (!event_registered) INFO("Registering events...");

    const events = fs.readdirSync(path.join(__dirname, "../events"));
    if (!events) return;

    for (let event of events) {
        const module = await import(`../events/${event}`);

        for (let internal_event of Object.keys(module)) {
            if (!event_registered)
                DEBUG(`Registering ${internal_event} event...`);

            module[internal_event](io);
        }
    }

    if (!event_registered) SUCCESS("Events registered!");
    event_registered = true;
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
