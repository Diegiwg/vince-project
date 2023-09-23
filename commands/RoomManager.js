import { object, safeParse, string } from "valibot";

import { EmitServerEvent } from "../modules/Events.js";
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

    console.log(data);

    // Validar se o usuário está logado
    if (
        !safeParse(SessionSchema, data).success ||
        !(await $User.validateSession(data.id, data.token))
    )
        return TOAST.INFO(client, null, "Sessão inválida.");

    // Validar se os dados da sala são validos
    /** @typedef {import('valibot').Output<typeof CreateRoomSchema>} CreateRoom */
    const CreateRoomSchema = object({
        name: string(),
        public: string(),
        password: string(),
    });

    /** @type {CreateRoom} */
    const args = data.args;

    if (!safeParse(CreateRoomSchema, args).success)
        return TOAST.ERROR(client, null, "Dados inválidos.");

    // Verificar se a sala já existe
    if (RoomService.roomsName.has(args.name))
        return TOAST.ERROR(client, null, "Sala já existe.");

    // Criar sala
    RoomService.roomsName.add(args.name);
    RoomService.rooms.set(args.name, {
        name: args.name,
        public: args.public,
        password: args.password,
    });

    // Devolva para o cliente as informações da sala
    TOAST.SUCCESS(client, null, "Sala criada com sucesso.");
    EmitServerEvent(
        client,
        "command",
        `
        A sala ${data.name} foi criada.
        E agora está online!
    `
    );
}
