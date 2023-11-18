import { database } from "./database.js";
import {
    EventCall,
    event_CreatePlayer,
    event_CreateRoom,
    event_Login,
} from "./events.js";

var e = null;
var p = null;

function test_CreateAccount(name, email, password) {
    e = EventCall({
        name,
        email,
        password,
    });
    event_CreatePlayer(e);
    if (e.res.error) throw new Error(e.res.error);
    console.log(e.res.success);
}

function test_LoginInAccount(email, password) {
    e = EventCall({ email, password });
    event_Login(e);
    if (e.res.error) throw new Error(e.res.error);
    console.log(e.res.success);

    p = e.res.data;
}

function test_CreateNewGameRoom(name) {
    e = EventCall({
        name,
    });
    event_CreateRoom(e);

    if (e.res.error) throw new Error(e.res.error);
    console.log(e.res.success);
}

// TEST //
(function () {
    // Crete Master Account and Make Login
    test_CreateAccount("Test", "test@test.test", "test");
    test_LoginInAccount("test@test.test", "test");

    // Create Player1 and Player2 Account
    test_CreateAccount("Player-1", "player1@player1.player1", "player1");
    test_CreateAccount("Player-2", "player2@player2.player2", "player2");

    // Create New Game Room
    test_CreateNewGameRoom("Test Room");
})();

// Dump Database State
console.log(JSON.stringify(database, null, 2));
