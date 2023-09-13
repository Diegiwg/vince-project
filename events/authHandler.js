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
import { TOAST } from "../modules/Toast.js";

/** @param {import("../modules/Models.js").io} io */
export function login(io) {
    const { client } = io;

    client.on(
        "Event::Login",
        /** @param {import("../modules/Models.js").Login} data  */
        async (data) => {
            DEBUG("Event::Login");

            if (!LoginSchema.safeParse(data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            // Try find user on DB
            const user = findUserByEmail(data.email);
            if (!user)
                return TOAST.ERROR(
                    client,
                    null,
                    "Não foi encontrado usuário com esse e-mail."
                );

            let { id, token } = user;

            // Check password
            if (!validateUserPassword(id, data.password))
                return TOAST.ERROR(client, null, "Senha incorreta.");

            // Update the token
            token = generateNewSessionToken(id);

            emitRenderPageEvent(client, "Home", {
                id,
                token,
            });
            TOAST.SUCCESS(client, null, "Logado com sucesso.");
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
            if (!validateUserSession(client, data)) return;

            emitRenderPageEvent(client, "Login");
        }
    );
}
