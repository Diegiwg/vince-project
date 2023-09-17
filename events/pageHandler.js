import { safeParse } from "valibot";

import { CONFIG } from "../config.js";
import { DEBUG } from "../modules/Logger.js";
import { RequestPageSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";

/** @param {import("../modules/Functions.js").EventPayload} payload  */
export async function RequestPage(payload) {
    const { client, data } = payload;

    DEBUG("Event::RequestPage");

    if (!safeParse(RequestPageSchema, data).success) return;

    const { page } = data;

    if (CONFIG.unprotectedRoutes.includes(page))
        return RenderPage(client, page, data);

    const { id, token } = data;

    if (!id || !token || !(await $User.validateSession(id, token)))
        return RenderPage(client, "Login");

    return RenderPage(client, page, data);
}
