import { loadPage } from "../Page.js";

/** @param {import("../Models").io} io  */
export function renderPage(io) {
    const { client } = io;

    client.on("Event::RenderPage", async (data) => {
        const { page } = data;
        if (!page) return;

        client.emit("Event::RenderPage", {
            page,
            content: await loadPage(page, data),
        });
    });
}
