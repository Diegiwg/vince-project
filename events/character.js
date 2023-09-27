// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { safeParse } from "valibot";

import { $Character, $User, DatabaseService } from "../modules/Database.js";
import { DEBUG } from "../modules/Logger.js";
import { CreateCharacterSchema } from "../modules/Models.js";
import { TOAST } from "../modules/Toast.js";

/**
 * Evento para criar um novo personagem.
 * @param {import("../modules/Functions.js").EventPayload} payload Objeto contendo os dados da solicitação.
 * @returns {Promise<void>}
 */
export async function CreateCharacter(payload) {
    DEBUG("Event::CreateCharacter");

    const { client, data } = payload;

    if (!safeParse(CreateCharacterSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const user = await $User.findBySession(data.id, data.token);
    if (!user) return TOAST.ERROR(client, null, "Sessão inválida.");

    DatabaseService.queue.add(async () => {
        const character = await $Character.create({
            user,
            character: {
                name: data.name,
                attributes: data.attributes,
                race: data.race,
                classe: data.classe,
            },
        });

        if (!character)
            return TOAST.ERROR(client, null, "Erro ao criar personagem.");

        TOAST.SUCCESS(client, null, "Personagem criado com sucesso.");
    });
}
