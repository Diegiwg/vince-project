import { DEBUG } from "../functions/Debug.js";
import { validateUserSession } from "../functions/FakeDB.js";
import { emitRenderPageEvent } from "../functions/Page.js";

/** @param {import("../functions/Models.js").io} io */
export function requestToGoTestPage(io) {
    const { client } = io;

    client.on(
        "Event::RequestToGoTestPage",
        /** @param {import("../functions/Models.js").Session} data */
        (data) => {
            DEBUG("Event::RequestToGoTestPage");

            if (!validateUserSession(data)) return;

            emitRenderPageEvent(client, "Test", data);
        }
    );
}
