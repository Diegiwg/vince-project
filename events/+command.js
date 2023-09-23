// Versão: 3.0.1
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import fs from "fs";

import { INFO, SUCCESS } from "../modules/Logger.js";

const CommandService = {
    actions: new Set(),
    functions: new Map(),
};

/**
 * Função responsável por analisar e compilar os comandos para torna-los disponíveis.
 */
export async function CommandsBundler() {
    if (!fs.existsSync("commands")) return;

    const files = fs.readdirSync("commands");
    if (!files) return;

    INFO("Bundling commands...");

    for (const file of files) {
        const commandsModule = await import(`../commands/${file}`);

        for (const command of Object.keys(commandsModule)) {
            CommandService.actions.add(command);
            CommandService.functions.set(command, commandsModule[command]);
        }
    }

    SUCCESS("Commands bundled!");
    INFO(CommandService.functions);
}

/**
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<void>}
 */
export async function command(payload) {
    if (!CommandService.actions.has(payload.data.name)) return;

    return await CommandService.functions.get(payload.data.name)(payload);
}
