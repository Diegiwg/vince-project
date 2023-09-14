import { DEBUG } from "../modules/Debug.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";

const initialized_clients = [];

/** @param {import("../modules/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../modules/Models.js").Session} data */
        async (data) => {
            if (initialized_clients.includes(client.id)) return;

            DEBUG("Event::Init");
            initialized_clients.push(client.id);

            const { id, token } = data;

            if (!id || !token || !(await $User.validateSession(id, token)))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}
