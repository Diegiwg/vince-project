import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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
        const isValid = SessionSchema.safeParse({ id, token }).success;
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
