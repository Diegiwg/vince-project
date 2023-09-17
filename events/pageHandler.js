import { safeParse } from "valibot";

import { CONFIG } from "../config.js";
import { DEBUG } from "../modules/Debug.js";
import { RequestPageSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";

/** @param {import("../modules/Models.js").io} io  */
export function requestPage(io) {
    const { client } = io;

    client.on(
        "Event::RequestPage",
        /** @param {import("../modules/Models.js").RequestPage} data */
        async (data) => {
            DEBUG("Event::RequestPage");

            if (!safeParse(RequestPageSchema, data).success) return;

            const { page } = data;

            if (CONFIG.unprotectedRoutes.includes(page))
                return emitRenderPageEvent(client, page, data);

            const { id, token } = data;

            if (!id || !token || !(await $User.validateSession(id, token)))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, page, data);
        }
    );
}
