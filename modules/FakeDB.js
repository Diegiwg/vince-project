// FakeDB for Testing //
import bcrypt from "bcrypt";
import fs from "fs";

import { DEBUG, ERROR } from "./Debug.js";
import { SessionSchema } from "./Models.js";
import { emitRenderPageEvent } from "./Page.js";

export let DB = {
    load: () => {
        if (!fs.existsSync("./modules/FakeDB.json"))
            ERROR("FakeDB.json not found!");

        const file = fs.readFileSync("./modules/FakeDB.json", "utf8");

        let content;
        try {
            content = JSON.parse(file);
        } catch {
            ERROR("Invalid data in FakeDB.json");
        }

        DB = { ...DB, ...content };
    },
    save: () => {
        fs.writeFileSync("./modules/FakeDB.json", JSON.stringify(DB));
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
export function validateUserSession(client, data) {
    const valid = SessionSchema.safeParse(data).success;

    // Go to login page
    if (!valid) {
        emitRenderPageEvent(client, "Login", {});
        return false;
    }

    const { id, token } = data;
    const user = DB.users.find((user) => user.id === id);

    if (!user || user.token !== token) {
        emitRenderPageEvent(client, "Login", {});
        return false;
    }

    return true;
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
