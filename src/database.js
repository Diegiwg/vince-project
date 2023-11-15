import fs from "fs";

export function Player(obj) {
    if (!obj?.rooms) obj["rooms"] = [];

    return {
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
        Players.values[Players.next_id()] = obj;
        return id;
    },
    get: (id) => Players?.values[id],
};

export function Room(obj) {
    return {
        name: obj?.name,
    };
}

const Rooms = {
    id: 1,
    values: {},
    next_id: () => Rooms.id++,
    add: (obj) => {
        const id = Rooms.id;
        Rooms.values[Rooms.next_id()] = obj;
        return id;
    },
    get: (id) => Rooms?.values[id],
};

export const database = {
    Players,
    Rooms,
};

export function save() {
    const json = JSON.stringify(database);
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
