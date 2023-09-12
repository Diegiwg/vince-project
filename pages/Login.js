import { DB } from "../functions/FakeDB.js";

export function load() {
    return {
        users: DB.users.map((user) => ({ name: user.name, email: user.email })),
    };
}
