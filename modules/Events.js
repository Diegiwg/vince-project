// Versão: 3.0.1
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import fs from "fs";
import { Server, Socket } from "socket.io";

import { INFO, SUCCESS } from "./Logger.js";
import { createQueue } from "./Queue.js";

const EventsService = {
    events: new Set(),
    functions: new Map(),
    queue: createQueue(50, 100, 1000),
};

/**
 * Função responsável por analisar e compilar os eventos para torna-los disponíveis.
 */
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

/**
 * Função responsável por registrar os eventos no Socket.
 * @param {Server} server Servidor do Socket.io
 */
export async function HandlerEvents(server) {
    server.on(
        "connection",
        /** @param {Socket} client Objeto que representa a conexão do cliente. */
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
 * Função responsável por emitir eventos para o cliente.
 * @param {import('socket.io').Socket|import('socket.io').Server} target Objeto que representa a conexão do cliente alvo.
 * @param {string} name Nome do evento a ser emitido.
 * @param {object} data Dados a serem enviados.
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
