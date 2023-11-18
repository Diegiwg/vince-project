import { Player, Room, compareHash, database, save } from "./database.js";

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
export function event_AddPlayerToRoom(payload) {
    const { req, res } = payload;

    const { owner_id, player_id, room_id } = req.body;

    if (!owner_id || !player_id || !room_id) {
        res.error = "Owner id, player id and room id are required";
        return;
    }

    // Check if Owner is a Master of Room
    const room = database.Rooms.get(room_id);
    if (!room) {
        res.error = "Room not found";
        return;
    }
    if (!room.owner_id === owner_id) {
        res.error = "You are not the owner of this room";
        return;
    }

    // Check if Player exists
    const player = database.Players.get(player_id);
    if (!player) {
        res.error = "Player not found";
        return;
    }

    // Add Player to Room
    room.players.push(player_id);
    database.Rooms.update(room_id, room);

    // Add Room to Player
    player.rooms.push(room_id);
    database.Players.update(player_id, player);

    res.success = `Player ${player.name} added to room ${room.name}`;
}

/** @param {Payload} payload */
export function event_CreateRoom(payload) {
    const { req, res } = payload;

    const { owner_id, name } = req.body;

    if (!owner_id || !name) {
        res.error = "Owner id and name are required";
        return;
    }

    const room = Room({ owner_id, name });
    const room_id = database.Rooms.add(room);

    res.success = `Room ${name} created with id ${room_id}`;
    res.data = room_id;
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

/** @param {Payload} payload */
export function event_AddMessage(payload) {
    const { req, res } = payload;

    const { room_id, author_id, message } = req.body;
    if (!room_id || !author_id || !message) {
        res.error = "Room id, author id and message are required";
        return;
    }

    const room = database.Rooms.get(room_id);
    if (!room) {
        res.error = "Room not found";
        return;
    }

    const author = database.Players.get(author_id);
    if (!author) {
        res.error = "Author not found";
        return;
    }

    // Check if is a Owner of Room
    let isOwner = false;
    if (room.owner_id === author_id) {
        isOwner = true;
    }

    room.messages.push({ author_id, message });
    database.Rooms.update(room_id, room);

    res.success = `Message added to room ${room.name}`;
    res.data = isOwner
        ? `${author.name} (Master): ${message}`
        : `${author.name}: ${message}`;
}

save();
