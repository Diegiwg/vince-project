import { EmitServerEvent } from "../modules/Events.js";

import { DEBUG } from "../modules/Logger.js";

/**
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 */
export function ping(payload) {
    const { client } = payload;

    DEBUG("Event::ping");

    EmitServerEvent(client, "command", {
        name: "ping",
    });
}
