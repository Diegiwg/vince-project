import { DEBUG } from "../functions/Debug.js";
import {
    createAccount,
    findUserByEmail,
    generateNewSessionToken,
    validateUserPassword,
    validateUserSession,
} from "../functions/FakeDB.js";
import {
    CreateAccountSchema,
    LoginSchema,
    SessionSchema,
} from "../functions/Models.js";
import { emitRenderPageEvent } from "../functions/Page.js";

/** @param {import("../functions/Models.js").io} io */
export function login(io) {
    const { client } = io;

    client.on(
        "Event::Login",
        /** @param {import("../functions/Models.js").Login} data  */
        async (data) => {
            DEBUG("Event::Login");

            if (!LoginSchema.safeParse(data).success) return;

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

/** @param {import("../functions/Models.js").io} io */
export function registerAccount(io) {
    const { client } = io;

    client.on(
        "Event::RegisterAccount",
        /** @param {import("../functions/Models.js").CreateAccount} data */
        async (data) => {
            DEBUG("Event::RegisterAccount");

            if (!CreateAccountSchema.safeParse(data).success) return;

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

/** @param {import("../functions/Models.js").io} io */
export function logout(io) {
    const { client } = io;

    client.on(
        "Event::Logout",
        /** @param {import("../functions/Models.js").Session} data */
        (data) => {
            DEBUG("Event::Logout");

            if (!SessionSchema.safeParse(data).success) return;
            if (!validateUserSession(data)) return;

            emitRenderPageEvent(client, "Login");
        }
    );
}
