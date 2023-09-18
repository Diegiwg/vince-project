import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { safeParse } from "valibot";

import { SessionSchema } from "./Models.js";

const prisma = new PrismaClient();

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
        return await prisma.user.findUnique({
            where: {
                id,
                token,
            },
        });
    },

    validateSession: async (id, token) => {
        const isValid = safeParse(SessionSchema, { id, token }).success;
        if (!isValid) return false;

        return await $User.findBySession(id, token);
    },

    validatePassword: async (id, password) => {
        const _user = await $User.findById(id);
        if (!_user) return false;

        return bcrypt.compareSync(password, _user.password);
    },

    create: async (name, email, password) => {
        const _user = await $User.findByEmail(email);
        if (_user) return false;

        return await prisma.user.create({
            data: {
                name,
                email,
                password: bcrypt.hashSync(password, 10),
            },
        });
    },

    _generateNewSessionToken: async (id) => {
        const _user = await $User.findById(id);
        _user.token = bcrypt.genSaltSync(10);

        await prisma.user.update({
            where: {
                id,
            },
            data: {
                token: _user.token,
            },
        });

        return _user.token;
    },
};

export const $Character = {
    /**
     * Função para criar um Personagem (vinculado a um Usuário)
     * @param {{user: import("./Models.js").User, character: import("./Models.js").CharacterBase}} data
     */
    create: async (data) => {
        const { user, character } = data;

        const l_character = await prisma.characterBase.create({
            data: {
                name: character.name,
                race: character.race,
                classe: character.classe,
                hp: character.hp,
                sp: character.sp,
                mp: character.mp,
                experience: 0,
                strength: character.strength,
                agility: character.agility,
                vitality: character.vitality,
                intelligence: character.intelligence,
                spirituality: character.spirituality,

                user_id: user.id,
            },
        });

        return l_character;
    },
};
