import { safeParse } from "valibot";

import { EmitServerEvent } from "../modules/Events.js";
import { DEBUG } from "../modules/Logger.js";
import { NewMessageSchema, SessionSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../modules/Functions.js").EventPayload} payload */
export async function NewMessage(payload) {
    DEBUG("Event::NewMessage");

    const { client, server, data } = payload;

    if (!safeParse(SessionSchema, data).success) {
        TOAST.INFO(client, null, "Sessão inválida.");
        return RenderPage(client, "Login");
    }

    const { id, token } = data;

    if (!(await $User.validateSession(id, token))) {
        TOAST.INFO(client, null, "Sessão inválida.");
        return RenderPage(client, "Login");
    }

    if (!safeParse(NewMessageSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const { room, message } = data;

    const user_name = (await $User.findBySession(id, token)).name;

    EmitServerEvent(server.to(room), "NewMessage", {
        message: `${user_name}: ${message}`,
    });

    TOAST.SUCCESS(client, 1_000, "Mensagem enviada.");
}

/** @param {import("../modules/Functions.js").EventPayload} io */
export function RegisterRoom(payload) {
    DEBUG("Event::RegisterRoom");

    const { client, data } = payload;

    const { room } = data;
    if (!room) return;

    client.leaveAll();
    client.join(room);
}
