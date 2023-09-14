import { DEBUG } from "../modules/Debug.js";
import { CreateAccountSchema, LoginSchema } from "../modules/Models.js";
import { emitRenderPageEvent } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
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
export function createAccount(io) {
    const { client } = io;

    client.on(
        "Event::CreateAccount",
        /** @param {import("../modules/Models.js").CreateAccount} data */
        async (data) => {
            DEBUG("Event::CreateAccount");

            if (!CreateAccountSchema.safeParse(data).success)
                return TOAST.WARN(
                    client,
                    null,
                    "Os dados fornecidos estão inválidos."
                );

            const { name, email, password } = data;

            // Try create user on DB
            const user = await $User.create(name, email, password);
            if (!user) return TOAST.ERROR(client, null, "Erro ao criar conta.");

            emitRenderPageEvent(client, "Home", {
                id: user.id,
                token: user.token,
            });
            TOAST.SUCCESS(client, null, "Conta criada com sucesso.");
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
