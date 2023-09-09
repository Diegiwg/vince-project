import bcrypt from "bcrypt";

import { findUserByEmail } from "../Database.js";
import { LoginSchema } from "../Models.js";
import { loadPage } from "../Page.js";

/** @param {import("../Models").io} io */
export function login(io) {
    const { client, server } = io;

    client.on(
        "Event::Login",
        /** @param {import("../Models").Login} data  */
        async (data) => {
            LoginSchema.parse(data);

            // Try find user on DB
            const user = findUserByEmail(data.email);
            if (!user) return;

            // Check password
            const validPassword = bcrypt.compareSync(
                data.password,
                user.password
            );
            if (!validPassword) return;

            server.emit("Event::RenderPage", {
                page: "Home",
                content: await loadPage("Home"),

                id: user.id,
                token: user.token,
            });
        }
    );
}
