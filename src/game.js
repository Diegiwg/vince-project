import fs from "fs";

import { save } from "./database.js";
import {
    EventCall,
    event_AddMessage,
    event_AddPlayerToRoom,
    event_CreatePlayer,
    event_CreateRoom,
    event_Login,
} from "./events.js";

var e = null;
var p = null;

// Reset the Log file
fs.writeFileSync("./log.txt", "");

function log(...msgs) {
    // Set ASCII color to yellow
    console.log("\x1b[33m%s\x1b[0m", ...msgs);

    // Reset color
    console.log("\x1b[0m");

    // Save to log file
    fs.appendFileSync("./log.txt", ` [LOG] ${msgs}\n`);
}

function chat(...msgs) {
    // Set ASCII color to green
    console.log("\x1b[32m%s\x1b[0m", ...msgs);

    // Reset color
    console.log("\x1b[0m");

    // Save to log file
    fs.appendFileSync("./log.txt", `[CHAT] ${msgs}\n`);
}

function test_CreateAccount(name, email, password) {
    e = EventCall({
        name,
        email,
        password,
    });
    event_CreatePlayer(e);
    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    return e.res.data;
}

function test_LoginInAccount(email, password) {
    e = EventCall({ email, password });
    event_Login(e);
    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    p = e.res.data;
}

function test_CreateNewGameRoom(name) {
    e = EventCall({
        name,
        owner_id: p.id,
    });
    event_CreateRoom(e);

    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    return e.res.data;
}

function test_AddPlayerToRoom(player_id, room_id) {
    e = EventCall({
        owner_id: p.id,
        player_id,
        room_id,
    });
    event_AddPlayerToRoom(e);

    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    return e.res.data;
}

function test_MasterSendMessage(room_id, message) {
    e = EventCall({
        author_id: p.id,
        room_id,
        message,
    });
    event_AddMessage(e);

    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    chat(e.res.data);
}

function test_PlayerSendMessage(room_id, message, player_id) {
    e = EventCall({
        author_id: player_id,
        room_id,
        message,
    });
    event_AddMessage(e);

    if (e.res.error) throw new Error(e.res.error);
    log(e.res.success);

    chat(e.res.data);
}

// TEST //
(function () {
    // Crete Master Account and Make Login
    test_CreateAccount("Test", "test@test.test", "test");
    test_LoginInAccount("test@test.test", "test");

    // Create Player1, Player2 and Player3 Accounts
    const player1 = test_CreateAccount(
        "Player-1",
        "player1@player1.player1",
        "player1"
    );
    const player2 = test_CreateAccount(
        "Player-2",
        "player2@player2.player2",
        "player2"
    );
    const player3 = test_CreateAccount(
        "Player-3",
        "player3@player3.player3",
        "player3"
    );

    // Create New Game Room
    const roomId = test_CreateNewGameRoom("Test Room");

    // Add player to Room
    test_AddPlayerToRoom(player1.id, roomId);
    test_AddPlayerToRoom(player2.id, roomId);

    // Fake Chat
    test_MasterSendMessage(
        roomId,
        "Oi, logo iremos começar a jogar, só esperando mais um dos jogadores!"
    );
    test_PlayerSendMessage(roomId, "Ahh beleza.", player1.id);
    test_PlayerSendMessage(roomId, "Quem será o outro jogador?", player2.id);

    // Add last Player to Room
    test_AddPlayerToRoom(player3.id, roomId);
})();

save();
