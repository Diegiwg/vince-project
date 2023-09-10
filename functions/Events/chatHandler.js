import { DEBUG } from "../Debug.js";
import { validateUserSession } from "../FakeDB.js";
import { NewMessageSchema, ParseSchema } from "../Models.js";

/** @param {import("../Models").io} io */
export function newMessage(io) {
    const { client, server } = io;

    client.on(
        "Event::NewMessage",
        /** @param {import("../Models").NewMessage} data */
        (data) => {
            DEBUG("Event::NewMessage");

            if (!validateUserSession(data)) return;
            if (!ParseSchema(NewMessageSchema, data)) return;

            const { room, message } = data;
            if (!room || !message) return;

            server.to(room).emit("Event::NewMessage", { message });
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
