import { DEBUG } from "../modules/Debug.js";
import { RequestPageSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";

const UNPROTECTED_ROUTES = ["Login", "CreateAccount"];

/** @param {import("../modules/Models.js").io} io  */
export function requestPage(io) {
    const { client } = io;

    client.on(
        "Event::RequestPage",
        /** @param {import("../modules/Models.js").RequestPage} data */
        async (data) => {
            DEBUG("Event::RequestPage");

            if (!RequestPageSchema.safeParse(data).success) return;

            const { page } = data;

            if (UNPROTECTED_ROUTES.includes(page))
                return emitRenderPageEvent(client, page, data);

            const { id, token } = data;

            if (!id || !token || !(await $User.validateSession(id, token)))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, page, data);
        }
    );
}
