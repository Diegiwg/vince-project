import { DEBUG } from "../modules/Logger.js";
import { RenderPage } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";

const initialized_clients = new Set();

/** @param {import("../modules/Functions.js").EventPayload} payload  */
export async function Init(payload) {
    const { client, data } = payload;

    if (initialized_clients.has(client.id)) return;

    DEBUG("Event::Init");
    initialized_clients.add(client.id);

    const { id, token } = data;

    if (!id || !token || !(await $User.validateSession(id, token)))
        return RenderPage(client, "Login");

    return RenderPage(client, "Home", data);
}
