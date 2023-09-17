import { safeParse } from "valibot";

import { DEBUG } from "../modules/Debug.js";
import { NewMessageSchema, SessionSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../Models").io} io */
export function newMessage(io) {
    const { client, server } = io;

    client.on(
        "Event::NewMessage",
        /** @param {import("../Models").NewMessage} data */
        async (data) => {
            DEBUG("Event::NewMessage");

            if (!safeParse(SessionSchema, data).success) {
                TOAST.INFO(client, null, "Sessão inválida.");
                return emitRenderPageEvent(client, "Login");
            }

            const { id, token } = data;

            if (!(await $User.validateSession(id, token))) {
                TOAST.INFO(client, null, "Sessão inválida.");
                return emitRenderPageEvent(client, "Login");
            }

            if (!safeParse(NewMessageSchema, data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            const { room, message } = data;

            const user_name = (await $User.findBySession(id, token)).name;

            server.to(room).emit("Event::NewMessage", {
                message: `${user_name}: ${message}`,
            });

            TOAST.SUCCESS(client, 1_000, "Mensagem enviada.");
        }
    );
}

/** @param {import("../Models").io} io */
export function registerRoom(io) {
    const { client } = io;

    client.on("Event::RegisterRoom", (data) => {
        DEBUG("Event::RegisterRoom");
        const { room } = data;
        if (!room) return;

        client.leaveAll();
        client.join(room);
    });
}
