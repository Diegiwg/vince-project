import { DEBUG } from "../modules/Debug.js";
import { findUserBySession, validateUserSession } from "../modules/FakeDB.js";
import { NewMessageSchema } from "../modules/Models.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../Models").io} io */
export function newMessage(io) {
    const { client, server } = io;

    client.on(
        "Event::NewMessage",
        /** @param {import("../Models").NewMessage} data */
        (data) => {
            DEBUG("Event::NewMessage");

            if (!validateUserSession(client, data))
                return TOAST.INFO(client, null, "Sessão inválida.");

            if (!NewMessageSchema.safeParse(data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            const { room, message } = data;
            const user_name = findUserBySession(data.token).name;

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
