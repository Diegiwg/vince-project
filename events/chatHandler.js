// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { safeParse } from "valibot";

import { EmitServerEvent } from "../modules/Events.js";
import { DEBUG } from "../modules/Logger.js";
import { NewMessageSchema, SessionSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/**
 * Evento para criar uma nova mensagem.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<void>}
 */
export async function NewMessage(payload) {
    DEBUG("Event::NewMessage");

    const { client, server, data } = payload;

    // Verifica se a solicitação é valida.
    if (!safeParse(SessionSchema, data).success) {
        TOAST.INFO(client, null, "Sessão inválida.");
        return RenderPage(client, "Login");
    }

    // Verifica se os dados fornecidos são validos.
    if (!safeParse(NewMessageSchema, data).success) {
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");
    }

    const { id, token, room, message } = data;

    // Verifica se o token fornecido é valido.
    if (!(await $User.validateSession(id, token))) {
        TOAST.INFO(client, null, "Sessão inválida.");
        return RenderPage(client, "Login");
    }

    const userName = (await $User.findBySession(id, token)).name;

    EmitServerEvent(server.to(room), "NewMessage", {
        message: `${userName}: ${message}`,
    });

    TOAST.SUCCESS(client, 1_000, "Mensagem enviada.");
}

/**
 * Evento para registrar uma nova sala.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 */
export function RegisterRoom(payload) {
    DEBUG("Event::RegisterRoom");

    const { client, data } = payload;

    const { room } = data;
    if (!room) return;

    client.leaveAll();
    client.join(room);
}
