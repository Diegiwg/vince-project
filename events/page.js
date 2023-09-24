// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { safeParse } from "valibot";

import { CONFIG } from "../config.js";
import { $User } from "../modules/Database.js";
import { DEBUG } from "../modules/Logger.js";
import { RequestPageSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";

/**
 * Evento para exibir uma página.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<void>}
 */
export async function RequestPage(payload) {
    const { client, data } = payload;

    DEBUG("Event::RequestPage");

    const { page } = data;

    // Verifica se a solicitação é valida.
    if (!safeParse(RequestPageSchema, data).success) return;

    // Verifica se a pagina solicitada está na lista de desprotegidos, e se sim, já devolve a mesma.
    if (CONFIG.unprotectedRoutes.includes(page))
        return RenderPage(client, page, {});

    const { id, token } = data;

    // Verifica se o token fornecido é valido. Não sendo, manda o usuário para o login.
    if (!id || !token || !(await $User.validateSession(id, token)))
        return RenderPage(client, "Login");

    // Exibe a pagina solicitada.
    RenderPage(client, page, data);
}
