import { EmitServerEvent } from "../modules/Events.js";

/**
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 */
export function ping(payload) {
    const { client } = payload;

    EmitServerEvent(client, "command:ping", {});
}
