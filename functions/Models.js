import { Server, Socket } from "socket.io";
import { z } from "zod";

/** @typedef {z.infer<typeof UserSchema>} User */
export let UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    token: z.string(),
});

/** @typedef {z.infer<typeof LoginSchema>} Login */
export let LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/** @typedef {{client: Socket, server: Server}} io */
