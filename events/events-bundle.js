import { DEBUG } from "../modules/Debug.js";
import { RequestPageSchema, NewMessageSchema, CreateAccountSchema, LoginSchema, SessionSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { findUserBySession, validateUserSession, createAccount, findUserByEmail, generateNewSessionToken, validateUserPassword } from "../modules/FakeDB.js";
import { TOAST } from "../modules/Toast.js";

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

            const { page } = data;

            if (UNPROTECTED_ROUTES.includes(page))
                return emitRenderPageEvent(client, page, data);

            if (!validateUserSession(client, data)) return;

            return emitRenderPageEvent(client, page, data);
        }
    );
}





/** @param {import("../Models").io} io */
export function newMessage(io) {
    const { client, server } = io;

    client.on(
        "Event::NewMessage",
        /** @param {import("../Models").NewMessage} data */
        (data) => {
            DEBUG("Event::NewMessage");

            if (!validateUserSession(client, data))
                return TOAST.INFO(client, null, "Sessão inválida.");

            if (!NewMessageSchema.safeParse(data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            const { room, message } = data;
            const user_name = findUserBySession(data.token).name;

            server.to(room).emit("Event::NewMessage", {
                message: `${user_name}: ${message}`,
            });
            TOAST.SUCCESS(client, 1_000, "Mensagem enviada.");
        }
    );
}

/** @param {import("../Models").io} io */
export function registerRoom(io) {
    const { client } = io;

    client.on("Event::RegisterRoom", (data) => {
        DEBUG("Event::RegisterRoom");
        const { room } = data;
        if (!room) return;

        client.leaveAll();
        client.join(room);
    });
}






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




const initialized_clients = [];

/** @param {import("../modules/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../modules/Models.js").Session} data */
        (data) => {
            if (initialized_clients.includes(client.id)) return;

            DEBUG("Event::Init");
            initialized_clients.push(client.id);

            if (!validateUserSession(client, data)) return;

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}