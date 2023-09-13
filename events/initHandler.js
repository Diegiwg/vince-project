import { DEBUG } from "../modules/Debug.js";
import { validateUserSession } from "../modules/FakeDB.js";
import { emitRenderPageEvent } from "../modules/Page.js";

/** @param {import("../modules/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../modules/Models.js").Session} data */
        (data) => {
            DEBUG("Event::Init");

            if (!validateUserSession(client, data)) return;

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}
