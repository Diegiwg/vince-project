import fs from "fs";

export function genHash(str) {
    return Buffer.from(str).toString("base64");
}

export function compareHash(str, hash) {
    return genHash(str) == hash;
}

export function Player(obj) {
    if (!obj?.rooms) obj["rooms"] = [];

    // Password fake 'hashing' with base64
    if (obj?.password) obj["password"] = genHash(obj?.password);

    return {
        email: obj?.email,
        password: obj?.password,
        name: obj?.name,
        rooms: obj?.rooms,
    };
}

const Players = {
    id: 1,
    values: {},
    next_id: () => Players.id++,
    add: (obj) => {
        const id = Players.id;
        Players.next_id();
        Players.values[id] = obj;
        return id;
    },
    get: (id) => {
        return { id, ...Players?.values[id] };
    },
    remove: (id) => {
        delete Players.values[id];
    },
    update: (id, obj) => {
        Players.values[id] = obj;
    },
    query: (key, value) => {
        const arr = [];
        for (const id in Players.values) {
            const player = Players.values[id];
            if (player[key] == value) {
                arr.push({ id, ...player });
            }
        }
        return arr;
    },
};

export function Room(obj) {
    if (!obj?.players) obj["players"] = [];
    if (!obj?.messages) obj["messages"] = [];

    return {
        owner_id: obj?.owner_id,
        name: obj?.name,
        players: obj?.players,
        messages: obj?.messages,
    };
}

const Rooms = {
    id: 1,
    values: {},
    next_id: () => Rooms.id++,
    add: (obj) => {
        const id = Rooms.id;
        Rooms.next_id();
        Rooms.values[id] = obj;
        return id;
    },
    get: (id) => {
        return { id, ...Rooms?.values[id] };
    },
    remove: (id) => {
        delete Rooms.values[id];
    },
    update: (id, obj) => {
        Rooms.values[id] = obj;
    },
    query: (key, value) => {
        const arr = [];
        for (const id in Rooms.values) {
            const room = Rooms.values[id];
            if (room[key] == value) {
                arr.push({ id, ...room });
            }
        }
        return arr;
    },
};

export const database = {
    Players,
    Rooms,
};

export function save() {
    const json = JSON.stringify(database, null, 2);
    fs.writeFileSync("./database.json", json);
}

export function load() {
    if (!fs.existsSync("./database.json")) {
        save();
    }

    const data = fs.readFileSync("./database.json");
    const json = JSON.parse(data);
    if (!json) return;

    database.Players.id = json?.Players?.id;
    for (const id in json?.Players?.values) {
        const player = json?.Players?.values[id];
        database.Players.values[id] = Player(player);
    }

    database.Rooms.id = json?.Rooms?.id;
    for (const id in json?.Rooms?.values) {
        const room = json?.Rooms?.values[id];
        database.Rooms.values[id] = Room(room);
    }
}
