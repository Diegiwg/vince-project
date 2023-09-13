import { DEBUG } from "../modules/Debug.js";
import { RequestPageSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";

const UNPROTECTED_ROUTES = ["Login", "CreateAccount"];

/** @param {import("../modules/Models.js").io} io  */
export function requestPage(io) {
    const { client } = io;

    client.on(
        "Event::RequestPage",
        /** @param {import("../modules/Models.js").RequestPage} data */
        (data) => {
            DEBUG("Event::RequestPage");

            if (!RequestPageSchema.safeParse(data).success) return;

            const { id, token, page } = data;

            if (UNPROTECTED_ROUTES.includes(page))
                return emitRenderPageEvent(client, page, data);

            if (!id || !token || !validateUserSession(data))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, page, data);
        }
    );
}
