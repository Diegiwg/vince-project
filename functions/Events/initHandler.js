import { DEBUG } from "../functions/Debug.js";
import { validateUserSession } from "../functions/FakeDB.js";
import { emitRenderPageEvent } from "../functions/Page.js";

/** @param {import("../functions/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../functions/Models.js").Session} data */
        (data) => {
            DEBUG("Event::Init");

            const { id, token } = data;

            if (!id || !token || !validateUserSession(data))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}
