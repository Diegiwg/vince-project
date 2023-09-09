/** @param {import("../Models").io} io */
export function newMessage(io) {
    const { client, server } = io;

    client.on("Event::NewMessage", (data) => {
        const { room, message } = data;
        if (!room || !message) return;

        server.to(room).emit("Event::NewMessage", { message });
    });
}

/** @param {import("../Models").io} io */
export function registerRoom(io) {
    const { client } = io;

    client.on("Event::RegisterRoom", (data) => {
        const { room } = data;
        if (!room) return;

        client.leaveAll();
        client.join(room);
    });
}
