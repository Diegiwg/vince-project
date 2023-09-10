import { DEBUG } from "../Debug.js";
import {
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

            if (!ParseSchema(LoginSchema, data)) return;

            // Try find user on DB
            const user = findUserByEmail(data.email);
            if (!user) return;

            let { id, token, password } = user;

            // Check password
            if (!validateUserPassword(id, password)) return;

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
export function createAccount(io) {
    const { client } = io;

    client.on(
        "Event::CreateAccount",
        /** @param {import("../Models").CreateAccount} data */
        async (data) => {
            DEBUG("Event::CreateAccount");

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
