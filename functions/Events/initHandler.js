import { DEBUG } from "../Debug.js";
import { validateUserSession } from "../FakeDB.js";
import { emitRenderPageEvent } from "../Page.js";

/** @param {import("../Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on("Event::Init", (data) => {
        DEBUG("Event::Init");
        const { id, token } = data;

        if (!id || !token || !validateUserSession(id, token))
            return emitRenderPageEvent(client, "Login");

        return emitRenderPageEvent(client, "Home", data);
    });
}
