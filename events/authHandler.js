import { safeParse } from "valibot";

import { DEBUG } from "../modules/Logger.js";
import { LoginSchema, CreateAccountSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { $User, DatabaseService } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import("../modules/Functions.js").EventPayload} payload  */
export async function Login(payload) {
    const { client, data } = payload;

    DEBUG("Event::Login");

    if (!safeParse(LoginSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    DatabaseService.queue.add(async () => {
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

        // Atualizar o token do Usuario
        const token = await $User.updateSessionToken(id);

        // Retorna a mensagem de sucesso e faz login
        TOAST.SUCCESS(client, null, "Logado com sucesso.");
        RenderPage(client, "Home", {
            id,
            token,
        });
    });
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export async function CreateAccount(payload) {
    const { client, data } = payload;

    DEBUG("Event::CreateAccount");

    if (!safeParse(CreateAccountSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const { name, email, password } = data;

    DatabaseService.queue.add(async () => {
        // Verifica se o email já está em uso
        const isNotUnique = await $User.findByEmail(email);
        if (isNotUnique) return TOAST.ERROR(client, null, "E-mail já em uso.");

        // Tenta criar o usuário
        const user = await $User.create(name, email, password);
        if (!user) return TOAST.ERROR(client, null, "Erro ao criar conta.");

        const { id, token } = user;

        // Retorna a mensagem de sucesso e faz login
        TOAST.SUCCESS(client, null, "Conta criada com sucesso.");
        RenderPage(client, "Home", {
            id,
            token,
        });
    });
}

/** @param {import("../modules/Functions.js").EventPayload} payload */
export function Logout(payload) {
    const { client } = payload;

    DEBUG("Event::Logout");

    // TODO: Verificar a necessidade de invalidar o token atual no banco de dados!

    TOAST.SUCCESS(client, null, "Deslogado com sucesso.");
    RenderPage(client, "Login");
}
