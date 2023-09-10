import { DEBUG } from "../Debug.js";
import {
    createAccount,
    findUserByEmail,
    generateNewSessionToken,
    validateUserPassword,
} from "../FakeDB.js";
import { LoginSchema, ParseSchema } from "../Models.js";
import { emitRenderPageEvent } from "../Page.js";

/** @param {import("../Models").io} io */
export function login(io) {
    const { client } = io;

    client.on(
        "Event::Login",
        /** @param {import("../Models").Login} data  */
        async (data) => {
            DEBUG("Event::Login");

            DEBUG(data);

            if (!ParseSchema(LoginSchema, data)) return;

            // Try find user on DB
            const user = findUserByEmail(data.email);
            if (!user) return;

            let { id, token } = user;

            // Check password
            if (!validateUserPassword(id, data.password)) return;

            // Update the token
            token = generateNewSessionToken(id);

            emitRenderPageEvent(client, "Home", {
                id,
                token,
            });
        }
    );
}

/** @param {import("../Models").io} io */
export function registerAccount(io) {
    const { client } = io;

    client.on(
        "Event::RegisterAccount",
        /** @param {import("../Models").CreateAccount} data */
        async (data) => {
            DEBUG("Event::RegisterAccount");

            if (!ParseSchema(CreateAccountSchema, data)) return;

            // Try find user on DB
            const emailInUse = findUserByEmail(data.email);
            if (emailInUse) return;

            // Try create user on DB
            const user = createAccount(data);

            emitRenderPageEvent(client, "Home", {
                id: user.id,
                token: user.token,
            });
        }
    );
}
