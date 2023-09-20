import fs from "fs";
import { Server, Socket } from "socket.io";

import { INFO, SUCCESS } from "./Logger.js";

// Version: 3.0.0

/** @type {{events: Set<string>, functions: Map<string, Function>, queue: [{server, client, data, target}]  }} */
const EventsService = {
    events: new Set(),
    functions: new Map(),
    queue: new Array(),
};

function executeRequest() {
    if (EventsService.queue.length === 0) return;

    let batchSize = EventsService.queue.length * 0.45;
    let processedCount = 0;

    while (processedCount < batchSize && EventsService.queue.length > 0) {
        const { server, client, data, target } = EventsService.queue.shift();
        EventsService.functions.get(target)({ server, client, data });
        processedCount++;
    }
}

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
    if (EventsService.events.size === 0) return;

    server.on(
        "connection",
        /** @param {Socket} client */
        (client) => {
            client.on("request", async (data) => {
                const { target } = data;
                delete data.target;

                if (!EventsService.functions.has(target)) return;

                EventsService.queue.push({ server, client, data, target });
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

// Worker que vai monitorar se existe um evento na queue
setInterval(() => {
    executeRequest();
}, 100);
