import { safeParse } from "valibot";

import { EmitServerEvent } from "../modules/Events.js";
import { DEBUG } from "../modules/Logger.js";
import { CreateCharacterSchema } from "../modules/Models.js";
import { $Character, $Race, $User } from "../modules/Prisma.js";
import { TOAST } from "../modules/Toast.js";

/** @param {import('../modules/Functions.js').EventPayload} io */
export async function CreateCharacter(payload) {
    DEBUG("Event::CreateCharacter");

    const { client, data } = payload;

    if (!safeParse(CreateCharacterSchema, data).success)
        return TOAST.WARN(client, null, "Os dados fornecidos estão inválidos.");

    const l_user = await $User.findBySession(data.id, data.token);

    const l_character = await $Character.create({
        user: l_user,
        character: data,
        race_data: $Race._(),
    });

    EmitServerEvent(client, "UpdateData", l_character);
}
