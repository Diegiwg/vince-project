import fs from "fs";
import { Server, Socket } from "socket.io";

import { INFO, SUCCESS } from "./Logger.js";
import { createWorker } from "./Workers.js";

// Version: 3.0.0

const EventsService = {
    events: new Set(),
    functions: new Map(),
    queue: createWorker(50, 100, 1000),
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
            EventsService.events.add(event);
            EventsService.functions.set(event, l_module[event]);
        }
    }

    SUCCESS("Events bundled!");
}

/** @param {Server} server  */
export async function HandlerEvents(server) {
    server.on(
        "connection",
        /** @param {Socket} client */
        (client) => {
            client.on("request", async (data) => {
                const { target } = data;
                delete data.target;

                if (!EventsService.functions.has(target)) return;

                EventsService.queue.add(() => {
                    EventsService.functions.get(target)({
                        server,
                        client,
                        data,
                    });
                });
            });
        }
    );
}

/**
 * @param {import('socket.io').Socket|import('socket.io').Server} target
 * @param {string} name
 * @param {Object} data
 */
export function EmitServerEvent(target, name, data) {
    if (!target) return;

    target.emit("response", {
        target: name,
        data,
    });
}

// Iniciar o Worker
EventsService.queue.start();
