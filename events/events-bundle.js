import { DEBUG } from "../modules/Debug.js";
import { createAccount, findUserByEmail, generateNewSessionToken, validateUserPassword, validateUserSession, findUserBySession } from "../modules/FakeDB.js";
import { CreateAccountSchema, LoginSchema, SessionSchema, NewMessageSchema, RequestPageSchema } from "../modules/Models.js";
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
            if (!validateUserSession(client, data)) return;

            emitRenderPageEvent(client, "Login");
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

            if (!validateUserSession(client, data)) return;
            if (!NewMessageSchema.safeParse(data).success) return;

            const { room, message } = data;
            const user_name = findUserBySession(data.token).name;

            server.to(room).emit("Event::NewMessage", {
                message: `${user_name}: ${message}`,
            });
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