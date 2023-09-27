// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import bcrypt from "bcryptjs";

import { prisma } from "./Prisma.js";
import { createQueue } from "./Queue.js";

const MAX_WORK_OPERATIONS = 10;

export const DatabaseService = {
    /** @type {{clients: Set<number>, users: Map<number, import("./Models.js").User>}} */
    sessionsCache: {
        clients: new Set(),
        users: new Map(),
    },

    emailInUse: new Set(),

    queue: createQueue(MAX_WORK_OPERATIONS),
};

export const $User = {
    findAll: async () => {
        return await prisma.user.findMany();
    },

    findById: async (id) => {
        return await prisma.user.findUnique({ where: { id } });
    },

    findByEmail: async (email) => {
        if (!DatabaseService.emailInUse.has(email)) return null;

        return await prisma.user.findUnique({ where: { email } });
    },

    findBySession: async (id, token) => {
        if (DatabaseService.sessionsCache.clients.has(id)) {
            const user = DatabaseService.sessionsCache.users.get(id);

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

        if (!user) return null;

        DatabaseService.sessionsCache.users.set(id, user);
        DatabaseService.sessionsCache.clients.add(id);

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
        // Valida se o email está em uso
        if (DatabaseService.emailInUse.has(email)) return null;

        // Salva o email na lista de emails em uso
        DatabaseService.emailInUse.add(email);

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

    _getAllEmailsInUse: async () => {
        const result = await prisma.user.findMany({
            select: {
                email: true,
            },
        });

        return result.map((user) => user.email);
    },
};

export const $Character = {
    /**
     * Função para criar um Personagem (vinculado a um Usuário)
     * @param {{user: import("./Models.js").User, character: import("./Models.js").CreateCharacter}} data Dados do Personagem
     * @returns {import("./Models.js").Character} Personagem
     */
    create: async (data) => {
        const { user, character } = data;

        return await prisma.character.create({
            data: {
                name: character.name,

                attributes: {
                    create: character.attributes,
                },

                user: {
                    connect: {
                        id: user.id,
                    },
                },

                race: {
                    connect: {
                        name: character.race,
                    },
                },

                classe: {
                    connect: {
                        name: character.classe,
                    },
                },
            },
        });
    },
};

export const $Race = {
    findAll: () => {
        return prisma.race.findMany({
            include: {
                classes: true,
            },
        });
    },

    create: () => {},
};

export const $Classe = {
    findAll: () => {
        return prisma.classe.findMany();
    },
};

export const $GameRoom = {
    listOnline: () => {},

    /**
     *
     * @param {{name: string, isPublic: boolean, password: string, master: number}} data Dados da sala.
     * @returns {object} Objeto que representa a sala criada.
     */
    create: async (data) => {
        const { name, isPublic, password, master } = data;

        const user = await $User.findById(master);
        if (!user) return null;

        const nameNotAvailable = await prisma.gameRoom.findUnique({
            where: {
                name,
            },
        });
        if (nameNotAvailable) return null;

        return await prisma.gameRoom.create({
            data: {
                name,
                isPublic,
                password,
                masterId: user.id,
            },
        });
    },

    delete: () => {},

    join: () => {},

    leave: () => {},
};

/**
 * Inicialização do banco de dados, dando start na sua fila, e construindo a lista de emails em uso (para otimizar buscas futuras).
 */
(async function () {
    for (const email of await $User._getAllEmailsInUse()) {
        DatabaseService.emailInUse.add(email);
    }

    DatabaseService.queue.start();

    console.log("Database ready!");
})();
