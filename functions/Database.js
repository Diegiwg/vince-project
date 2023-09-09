// Using a FakeDB for Testing //
import { DB } from "./FakeDB.js";

/**
 *  @param {String} email
 *  @returns {import("./Models").User}
 */
export function findUserByEmail(email) {
    return DB.users.find((user) => user.email === email);
}

export function validateUserSession(id, token) {
    const user = DB.users.find((user) => user.id === id);
    return user && user.token === token;
}
