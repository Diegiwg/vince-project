import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { safeParse } from "valibot";

import { SessionSchema } from "./Models.js";
import { createWorker } from "./Workers.js";

const prisma = new PrismaClient();

const MAX_WORK_OPERATIONS = 10;

export const DatabaseService = {
    /** @type {{clients: Set<number>, users: Map<number, import("./Models.js").User)>}} */
    sessions_cache: {
        clients: new Set(),
        users: new Map(),
    },

    queue: createWorker(MAX_WORK_OPERATIONS),
};

DatabaseService.queue.start();

export const $User = {
    findAll: async () => {
        return await prisma.user.findMany();
    },

    findById: async (id) => {
        return await prisma.user.findUnique({ where: { id } });
    },

    findByEmail: async (email) => {
        return await prisma.user.findUnique({ where: { email } });
    },

    findBySession: async (id, token) => {
        if (DatabaseService.sessions_cache.clients.has(id)) {
            const user = DatabaseService.sessions_cache.users.get(id);

            // Verifica se o token fornecido é igual ao token em cache.
            if (user.token === token) {
                return user;
            }
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
                token,
            },
        });

        if (user) {
            DatabaseService.sessions_cache.users.set(id, user);
            DatabaseService.sessions_cache.clients.add(id);
        }

        return user;
    },

    validateSession: async (id, token) => {
        return (await $User.findBySession(id, token)) ? true : false;
    },

    validatePassword: async (id, password) => {
        const _user = await $User.findById(id);
        if (!_user) return false;

        return bcrypt.compareSync(password, _user.password);
    },

    create: async (name, email, password) => {
        // const _user = await $User.findByEmail(email);
        // if (_user) return false;

        return await prisma.user.create({
            data: {
                name,
                email,
                password: bcrypt.hashSync(password, 10),
                token: $User._generateNewSessionToken(),
            },
        });
    },

    updateSessionToken: async (id, invalidate = false) => {
        const token = invalidate ? "" : $User._generateNewSessionToken();

        await prisma.user.update({
            where: {
                id,
            },
            data: {
                token,
            },
        });

        return token;
    },

    _generateNewSessionToken: () => {
        return bcrypt.genSaltSync(10);
    },
};

export const $Character = {
    /**
     * Função para criar um Personagem (vinculado a um Usuário)
     * @param {{user: import("./Models.js").User, character: import("./Models.js").CreateCharacter}} data
     */
    create: async (data) => {
        const { user, character } = data;

        const l_character = await prisma.character.create({
            data: {
                name: character.name,

                race: character.race,
                hp: character.hp,
                sp: character.sp,
                mp: character.mp,

                classe: character.classe,

                ...character.attributes,
                ...data.race_data,

                experience: 0,
                user_id: user.id,
            },
        });

        return l_character;
    },
};

export const $Race = {
    _: () => {
        return {
            hp: 1,
            sp: 1,
            mp: 1,
        };
    },
};

export const $Classe = {};
