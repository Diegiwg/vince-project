import { DEBUG } from "../modules/Debug.js";
import { validateUserSession } from "../modules/FakeDB.js";
import { emitRenderPageEvent } from "../modules/Page.js";

const initialized_clients = [];

/** @param {import("../modules/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../modules/Models.js").Session} data */
        (data) => {
            if (initialized_clients.includes(client.id)) return;

            DEBUG("Event::Init");
            initialized_clients.push(client.id);

            if (!validateUserSession(client, data)) return;

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}
