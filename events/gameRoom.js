import { safeParse } from "valibot";

import { $GameRoom, $User } from "../modules/Database.js";
import { DEBUG } from "../modules/Logger.js";
import { CreateGameRoomSchema } from "../modules/Models.js";
import { RenderPage } from "../modules/Page.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import('../modules/Functions.js').EventPayload} payload Dados da solicitação */
export async function CreateGameRoom(payload) {
    DEBUG("Event::CreateGameRoom");

    const { client, data } = payload;

    if (!(await $User.validateSession(data.id, data.token))) {
        TOAST.ERROR(client, null, "Sessão inválida.");
        return;
    }

    if (!safeParse(CreateGameRoomSchema, data).success) {
        TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");
        return;
    }

    const room = await $GameRoom.create({
        name: data.name,
        isPublic: data.isPublic,
        password: data.password,
        master: data.id,
    });

    if (!room) {
        TOAST.ERROR(client, null, "Erro ao criar sala.");
        return;
    }

    TOAST.SUCCESS(client, null, "Sala criada com sucesso.");
    RenderPage(client, "Home", {
        id: data.id,
        token: data.token,
    });
}
