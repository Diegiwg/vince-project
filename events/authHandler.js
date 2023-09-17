import { safeParse } from "valibot";

import { DEBUG } from "../modules/Logger.js";
import { CreateAccountSchema, LoginSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../modules/Functions.js").EventPayload} payload  */
export async function Login(payload) {
    const { client, data } = payload;

    DEBUG("Event::Login");

    if (!safeParse(LoginSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

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
    RenderPage(client, "Home", {
        id,
        token: await $User._generateNewSessionToken(id),
    });

    TOAST.SUCCESS(client, null, "Logado com sucesso.");
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export async function CreateAccount(payload) {
    const { client, data } = payload;

    DEBUG("Event::CreateAccount");

    if (!safeParse(CreateAccountSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const { name, email, password } = data;

    // Try create user on DB
    const user = await $User.create(name, email, password);
    if (!user) return TOAST.ERROR(client, null, "Erro ao criar conta.");

    RenderPage(client, "Home", {
        id: user.id,
        token: user.token,
    });
    TOAST.SUCCESS(client, null, "Conta criada com sucesso.");
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export function Logout(payload) {
    const { client } = payload;

    DEBUG("Event::Logout");
    RenderPage(client, "Login");
}
