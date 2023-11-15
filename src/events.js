import { Room, database } from "./database.js";

export function EventCall(obj) {
    return {
        req: {
            body: obj,
        },
        res: {
            error: null,
            success: null,
        },
    };
}

export function event_create_room(payload) {
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
