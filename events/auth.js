// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { safeParse } from "valibot";

import { $User, DatabaseService } from "../modules/Database.js";
import { DEBUG } from "../modules/Logger.js";
import { CreateAccountSchema, LoginSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { TOAST } from "../modules/Toast.js";

/**
 * Evento para efetuar login.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<number>} ID da tarefa adicionada a fila.
 */
export async function Login(payload) {
    const { client, data } = payload;

    DEBUG("Event::Login");

    // Verifica se a solicitação é valida.
    if (!safeParse(LoginSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    // Procura o usuário.
    const user = await $User.findByEmail(data.email);
    if (!user)
        return TOAST.ERROR(
            client,
            null,
            "Não foi encontrado usuário com esse e-mail."
        );

    const { id } = user;

    // Verifica se a senha está fornecida está correta.
    if (!(await $User.validatePassword(id, data.password)))
        return TOAST.ERROR(client, null, "Senha incorreta.");

    return DatabaseService.queue.add(async () => {
        // Atualizar o token do usuário.
        const token = await $User.updateSessionToken(id);

        // Retorna a mensagem de sucesso e redireciona o usuário para a página inicial.
        TOAST.SUCCESS(client, null, "Logado com sucesso.");
        RenderPage(client, "Home", {
            id,
            token,
        });
    });
}

/**
 * Evento para criar uma nova conta.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<number>} ID da tarefa adicionada a fila.
 */
export async function CreateAccount(payload) {
    const { client, data } = payload;

    DEBUG("Event::CreateAccount");

    // Verifica se a solicitação é valida.
    if (!safeParse(CreateAccountSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const { name, email, password } = data;

    // Verifica se o email já está em uso
    const isNotUnique = await $User.findByEmail(email);
    if (isNotUnique) return TOAST.ERROR(client, null, "E-mail já em uso.");

    return DatabaseService.queue.add(async () => {
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

/**
 * Evento para efetuar logout.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 */
export function Logout(payload) {
    const { client, data } = payload;

    DEBUG("Event::Logout");

    $User.updateSessionToken(data.id, true);

    TOAST.SUCCESS(client, null, "Deslogado com sucesso.");
    RenderPage(client, "Login");
}
