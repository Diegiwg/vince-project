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
        // TODO: Essa função é bastante utilizada, talvez seja interessante criar um local em memoria, para salvar o socket.id do cliente, junto com o ID e TOKEN, e assim, sempre que o mesmo cliente mandar uma solicitação, podemos buscar nessa memoria, e caso exista, verificar se ainda se mantem o mesmo token, e caso não, invalido o usuario, e segue com a verificação normal. Essa banco em memoria pode ser invalidado periodicamente, sem precisar que a aplicação reinicie, ou pode ter uma função que automaticamente remove clientes antigos?

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
