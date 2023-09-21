import { safeParse } from "valibot";

import { DEBUG } from "../modules/Logger.js";
import { LoginSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User, DatabaseService } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../modules/Functions.js").EventPayload} payload  */
export async function Login(payload) {
    const { client, data } = payload;

    DEBUG("Event::Login");

    if (!safeParse(LoginSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    // Procura o usuário
    const user = await $User.findByEmail(data.email);
    if (!user)
        return TOAST.ERROR(
            client,
            null,
            "Não foi encontrado usuário com esse e-mail."
        );

    const { id } = user;

    // Verifica se a senha está correta
    if (!(await $User.validatePassword(id, data.password)))
        return TOAST.ERROR(client, null, "Senha incorreta.");

    // Retorna a mensagem de sucesso e faz login
    TOAST.SUCCESS(client, null, "Logado com sucesso.");
    RenderPage(client, "Home", {
        id,
        token: await $User._generateNewSessionToken(id),
    });
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export async function CreateAccount(payload) {
    const { client, data } = payload;

    DEBUG("Event::CreateAccount");

    // if (!safeParse(CreateAccountSchema, data).success)
    //     return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const { name, email, password } = data;

    // Verifica se o email já está em uso
    // const isNotUnique = await $User.findByEmail(email);
    // if (isNotUnique) return TOAST.ERROR(client, null, "Email já em uso.");

    DatabaseService.queue.add(async () => {
        // Tenta criar o usuário
        const user = await $User.create(name, email, password);
        if (!user) return TOAST.ERROR(client, null, "Erro ao criar conta.");

        // Retorna a mensagem de sucesso e faz login
        TOAST.SUCCESS(client, null, "Conta criada com sucesso.");
        RenderPage(client, "Home", {
            id: user.id,
            token: "", // Testar se é essa função que está quebrando o prisma
        });
    });
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export function Logout(payload) {
    const { client } = payload;

    DEBUG("Event::Logout");

    TOAST.SUCCESS(client, null, "Deslogado com sucesso.");
    RenderPage(client, "Login");
}
