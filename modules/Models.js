import {
    array,
    email,
    minValue,
    number,
    object,
    optional,
    string,
} from "valibot";

/** @typedef {import('valibot').Output<typeof UserSchema>} User */
export let UserSchema = object({
    id: number([minValue(1)]),
    name: string(),
    email: string([email()]),
    password: string(),
    token: string(),

    characters: optional(array(object())),
});

/** @typedef {import('valibot').Output<typeof CharacterSchema>} Character */
export let CharacterSchema = object({
    id: number([minValue(1)]),
    name: string(),
    race: string(),
    classe: string(),
    hp: number(),
    sp: number(),
    mp: number(),
    experience: number(),
    strength: number(),
    agility: number(),
    vitality: number(),
    intelligence: number(),
    spirituality: number(),

    user: optional(UserSchema),
});

/** @typedef {import('valibot').Output<typeof SessionSchema>} Session */
export let SessionSchema = object({
    id: number([minValue(1)]),
    token: string([minValue(1)]),
});

/** @typedef {import('valibot').Output<typeof LoginSchema>} Login */
export let LoginSchema = object({
    email: string([email()]),
    password: string(),
});

/** @typedef {import('valibot').Output<typeof CreateAccountSchema>} CreateAccount */
export let CreateAccountSchema = object({
    name: string(),
    email: string([email()]),
    password: string(),
});

/** @typedef {import('valibot').Output<typeof NewMessageSchema>} NewMessage */
export let NewMessageSchema = object({
    room: string(),
    message: string(),
});

/** @typedef {import('valibot').Output<typeof RequestPageSchema>} RequestPage */
export let RequestPageSchema = object({
    page: string(),
});

/** @typedef {import('valibot').Output<typeof CreateCharacterSchema>} CreateCharacter */
export let CreateCharacterSchema = object({
    name: string(),
    race: string(),
    classe: string(),
    attributes: object({
        strength: number(),
        agility: number(),
        vitality: number(),
        intelligence: number(),
        spirituality: number(),
    }),
});
