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
    const batchSize = Math.ceil(EventsService.queue.length * 0.45);

    for (let i = 0; i < batchSize && i < EventsService.queue.length; i++) {
        const { server, client, data, target } = EventsService.queue[i];
        EventsService.functions.get(target)({ server, client, data });
    }

    EventsService.queue.splice(0, batchSize);
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
