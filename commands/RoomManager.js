import { boolean, object, safeParse, string } from "valibot";

import { EmitEvent } from "../modules/Functions.js";
import { DEBUG } from "../modules/Logger.js";
import { SessionSchema } from "../modules/Models.js";
import { $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

const RoomService = {
    roomsName: new Set(),
    rooms: new Map(),
};

/**
 * @param {import('../modules/Functions.js').EventPayload} payload Dados da solicitação
 * @returns {Promise<void>}
 */
export async function CreateRoom(payload) {
    DEBUG("Command::CreateRoom");

    const { client, data } = payload;

    /*
    Estrutura de Dados para construir uma sala:
        name: String - Nome da sala
        public: Boolean - Se a sala é pública/privada
        password: String - Senha da sala (caso a sala seja privada)

        id: Number - ID do usuário que criou a sala (será o Mestre)
        token: String - Token do usuário que criou a sala.
    */

    // Validar se o usuário está logado
    if (
        !safeParse(SessionSchema, data).success ||
        !(await $User.validateSession(data.id, data.token))
    )
        return TOAST.INFO(client, null, "Sessão inválida.");

    // Validar se os dados da sala são validos
    const CreateRoomSchema = object({
        name: string(),
        public: boolean(),
        password: string(),
    });

    if (!safeParse(CreateRoomSchema, data).success)
        return TOAST.ERROR(client, null, "Dados inválidos.");

    // Verificar se a sala já existe
    if (RoomService.roomsName.has(data.name))
        return TOAST.ERROR(client, null, "Sala já existe.");

    // Criar sala
    RoomService.roomsName.add(data.name);
    RoomService.rooms.set(data.name, {
        name: data.name,
        public: data.public,
        password: data.password,
    });

    // Devolva para o cliente as informações da sala
    TOAST.SUCCESS(client, null, "Sala criada com sucesso.");
    EmitEvent(
        "command",
        `
        A sala ${data.name} foi criada.
        E agora está online!
    `
    );
}
