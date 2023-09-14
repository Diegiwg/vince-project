import { DEBUG } from "../modules/Debug.js";
import { RequestPageSchema, NewMessageSchema, SessionSchema, CreateAccountSchema, LoginSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";
import { createAccount, findUserByEmail } from "../modules/FakeDB.js";

const UNPROTECTED_ROUTES = ["Login", "CreateAccount"];

/** @param {import("../modules/Models.js").io} io  */
export function requestPage(io) {
    const { client } = io;

    client.on(
        "Event::RequestPage",
        /** @param {import("../modules/Models.js").RequestPage} data */
        async (data) => {
            DEBUG("Event::RequestPage");

            if (!RequestPageSchema.safeParse(data).success) return;

            const { page } = data;

            if (UNPROTECTED_ROUTES.includes(page))
                return emitRenderPageEvent(client, page, data);

            const { id, token } = data;

            if (!id || !token || !(await $User.validateSession(id, token)))
                return emitRenderPageEvent(client, "Login");

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
        async (data) => {
            DEBUG("Event::NewMessage");

            if (!SessionSchema.safeParse(data).success) {
                TOAST.INFO(client, null, "Sessão inválida.");
                return emitRenderPageEvent(client, "Login");
            }

            const { id, token } = data;

            if (!(await $User.validateSession(id, token))) {
                TOAST.INFO(client, null, "Sessão inválida.");
                return emitRenderPageEvent(client, "Login");
            }

            if (!NewMessageSchema.safeParse(data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            const { room, message } = data;

            const user_name = (await $User.findBySession(id, token)).name;

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
            const user = await $User.findByEmail(data.email);
            if (!user)
                return TOAST.ERROR(
                    client,
                    null,
                    "Não foi encontrado usuário com esse e-mail."
                );

            const { id } = user;

            // Check password
            if (!(await $User.validatePassword(id, data.password)))
                return TOAST.ERROR(client, null, "Senha incorreta.");

            // Generate New Session Token and Go to Home
            emitRenderPageEvent(client, "Home", {
                id,
                token: await $User._generateNewSessionToken(id),
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

    client.on("Event::Logout", () => {
        DEBUG("Event::Logout");
        emitRenderPageEvent(client, "Login");
    });
}




const initialized_clients = [];

/** @param {import("../modules/Models.js").io} io  */
export function inicialConnection(io) {
    const { client } = io;

    client.on(
        "Event::Init",
        /** @param {import("../modules/Models.js").Session} data */
        async (data) => {
            if (initialized_clients.includes(client.id)) return;

            DEBUG("Event::Init");
            initialized_clients.push(client.id);

            const { id, token } = data;

            if (!id || !token || !(await $User.validateSession(id, token)))
                return emitRenderPageEvent(client, "Login");

            return emitRenderPageEvent(client, "Home", data);
        }
    );
}