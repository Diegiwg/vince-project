import { validateUserSession } from "../Database.js";
import { loadPage } from "../Page.js";

async function loginPage(client) {
    client.emit("Event::RenderPage", {
        page: "Login",
        content: await loadPage("Login"),
    });
}
async function homePage(client) {
    client.emit("Event::RenderPage", {
        page: "Home",
        content: await loadPage("Home"),
    });
}

/** @param {import("../Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on("Event::Init", (data) => {
        const { id, token } = data;

        if (!id || !token || !validateUserSession(id, token))
            return loginPage(client);

        return homePage(client);
    });
}
