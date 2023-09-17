import fs from "fs";
import { Server, Socket } from "socket.io";

import { INFO, SUCCESS } from "./Logger.js";

// Version: 2.0.0

/** @type {{events: Set<string>, functions: Map<string, Function>}} */
const $DATA = {
    events: new Set(),
    functions: new Map(),
};

export async function EventsBundler() {
    if (!fs.existsSync("events")) return;

    const files = fs.readdirSync("events");
    if (!files) return;

    INFO("Bundling events...");

    for (const file of files) {
        if (!file.endsWith("Handler.js")) continue;

        const l_module = await import(`../events/${file}`);

        for (const event of Object.keys(l_module)) {
            $DATA.events.add(event);
            $DATA.functions.set(event, l_module[event]);
        }
    }

    SUCCESS("Events bundled!");
}

/** @param {Server} server  */
export async function HandlerEvents(server) {
    if ($DATA.events.size === 0) return;

    server.on(
        "connection",
        /** @param {Socket} client */
        (client) => {
            client.on("request", async (data) => {
                const { target } = data;

                if (!$DATA.functions.has(target)) return;

                await $DATA.functions.get(target)({ server, client, data });
            });
        }
    );
}
