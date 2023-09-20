import fs from "fs";
import { Server, Socket } from "socket.io";

import { ERROR, INFO, SUCCESS, WARN } from "./Logger.js";

// Version: 2.0.1

/** @type {{events: Set<string>, functions: Map<string, Function>, fila: [{server, client, data, target}]  }} */
const $DATA = {
    events: new Set(),
    functions: new Map(),
    fila: new Array(),
};

function executarPedido() {
    if ($DATA.fila.length === 0) return;

    const { server, client, data, target } = $DATA.fila.shift();

    $DATA.functions.get(target)({ server, client, data });
    executarPedido();
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
                delete data.target;

                if (!$DATA.functions.has(target)) return;

                $DATA.fila.push({ server, client, data, target });
                return executarPedido();
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
