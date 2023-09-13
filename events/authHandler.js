import { DEBUG } from "../modules/Debug.js";
import {
    createAccount,
    findUserByEmail,
    generateNewSessionToken,
    validateUserPassword,
    validateUserSession,
} from "../modules/FakeDB.js";
import {
    CreateAccountSchema,
    LoginSchema,
    SessionSchema,
} from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";

/** @param {import("../modules/Models.js").io} io */
export function login(io) {
    const { client } = io;

    client.on(
        "Event::Login",
        /** @param {import("../modules/Models.js").Login} data  */
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

/** @param {import("../modules/Models.js").io} io */
export function creatingAccount(io) {
    const { client } = io;

    client.on(
        "Event::CreatingAccount",
        /** @param {import("../modules/Models.js").CreateAccount} data */
        async (data) => {
            DEBUG("Event::CreatingAccount");

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

/** @param {import("../modules/Models.js").io} io */
export function logout(io) {
    const { client } = io;

    client.on(
        "Event::Logout",
        /** @param {import("../modules/Models.js").Session} data */
        (data) => {
            DEBUG("Event::Logout");

            if (!SessionSchema.safeParse(data).success) return;
            if (!validateUserSession(data)) return;

            emitRenderPageEvent(client, "Login");
        }
    );
}
