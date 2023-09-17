import { Server, Socket } from "socket.io";
import { email, minValue, number, object, string } from "valibot";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {{ type: "SUCCESS" | "ERROR" | "INFO" | "WARN"; message: string; time: number }} Toast */

/** @typedef {import('valibot').Output<typeof UserSchema>} User */
export let UserSchema = object({
    id: number([minValue(1)]),
    name: string(),
    email: string([email()]),
    password: string(),
    token: string(),
});

/** @typedef {import('valibot').Output<typeof SessionSchema>} Session */
export let SessionSchema = object({
    id: number([minValue(1)]),
    token: string(),
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
