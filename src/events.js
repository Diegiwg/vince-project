import { Player, Room, compareHash, database, load, save } from "./database.js";

load();

/**
 * @typedef {Object} Req
 * @property {Object} body
 */

/**
 * @typedef {Object} Res
 * @property {String} error
 * @property {String} success
 * @property {Object} data
 */

/**
 * @typedef {Object} Payload
 * @property {Req} req
 * @property {Res} res
 */

/**
 * @param {Object} obj
 * @returns {Payload}
 */
export function EventCall(obj) {
    return {
        req: {
            body: obj,
        },
        res: {
            error: null,
            success: null,
            data: null,
        },
    };
}

/** @param {Payload} payload */
export function event_CreateRoom(payload) {
    const { req, res } = payload;

    const { name } = req.body;

    if (!name) {
        res.error = "Name is required";
        return;
    }

    const room = Room({ name });
    const room_id = database.Rooms.add(room);

    res.success = `Room ${name} created with id ${room_id}`;
}

export function event_Login(payload) {
    const { req, res } = payload;

    const { email, password } = req.body;
    if (!email || !password) {
        res.error = "Email and password are required";
        return;
    }

    const query = database.Players.query("email", email);
    if (query.length == 0) {
        res.error = "Player not found";
        return;
    }

    const player = query[0];
    if (!compareHash(password, player.password)) {
        res.error = "Wrong password";
        return;
    }
    // delete player.password;

    res.success = `Player ${player.name} logged in`;
    res.data = player;
}

/** @param {Payload} payload */
export function event_CreatePlayer(payload) {
    const { req, res } = payload;

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.error = "Name, email and password are required";
        return;
    }

    // Check if player already exists
    let query = database.Players.query("email", email);
    if (query.length > 0) {
        res.error = "Player already exists";
        return;
    }
    query = database.Players.query("name", name);
    if (query.length > 0) {
        res.error = "Player already exists";
        return;
    }

    const tempPlayer = Player({
        email,
        password: password,
        name,
    });
    const playerId = database.Players.add(tempPlayer);

    const player = database.Players.get(playerId);
    // delete player.password;

    res.success = `Player ${name} created with id ${player.id}`;
    res.data = player;
}

save();
