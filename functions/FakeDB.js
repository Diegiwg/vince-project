// FakeDB for Testing //
import bcrypt from "bcrypt";
import fs from "fs";

import { DEBUG } from "./Debug.js";
import { ParseSchema, SessionSchema } from "./Models.js";

export let DB = {
    load: () => {
        const file = fs.readFileSync("./functions/FakeDB.json", "utf8");
        const content = JSON.parse(file);
        DB = { ...DB, ...content };
    },
    save: () => {
        fs.writeFileSync("./functions/FakeDB.json", JSON.stringify(DB));
    },

    /** @type {import("./Models").User[]} */
    users: [],
};

DB.load();

/**
 *  @param {String} email
 *  @returns {import("./Models").User}
 */
export function findUserByEmail(email) {
    return DB.users.find((user) => user.email === email);
}

export function findUserBySession(token) {
    return DB.users.find((user) => user.token === token);
}

/** @param {import("./Models").Session data} */
export function validateUserSession(data) {
    const { id, token } = data;

    DEBUG("validateUserSession", data);

    if (!ParseSchema(SessionSchema, data)) return false;

    const user = DB.users.find((user) => user.id === id);
    return user && user.token === token;
}

export function generateNewSessionToken(id) {
    const user = DB.users.find((user) => user.id === id);
    user.token = bcrypt.genSaltSync(10);

    DB.save();

    return user.token;
}

export function validateUserPassword(id, password) {
    const user = DB.users.find((user) => user.id === id);
    return bcrypt.compareSync(password, user.password);
}

/** @param {import('./Models').CreateAccount} data  */
export function createAccount(data) {
    const { email, password } = data;

    // last user.id + 1
    const id = DB.users[DB.users.length - 1].id + 1;

    const user = DB.users.push({
        id,
        email,
        password,
        token: bcrypt.genSaltSync(10),
    });

    DB.save();

    return user;
}
