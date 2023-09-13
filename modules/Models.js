import { Server, Socket } from "socket.io";
import { z } from "zod";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {z.infer<typeof UserSchema>} User */
export let UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    token: z.string(),
});

/** @typedef {z.infer<typeof SessionSchema>} Session */
export let SessionSchema = z.object({
    id: z.number(),
    token: z.string(),
});

/** @typedef {z.infer<typeof LoginSchema>} Login */
export let LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/** @typedef {z.infer<typeof CreateAccountSchema>} CreateAccount */
export let CreateAccountSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

/** @typedef {z.infer<typeof NewMessageSchema>} NewMessage */
export let NewMessageSchema = z.object({
    room: z.string(),
    message: z.string(),
});
