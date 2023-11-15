import { load, save } from "./database.js";
import { EventCall, event_create_room } from "./events.js";

load();

var e = EventCall({
    name: "Minha Primeira Sala",
});
event_create_room(e);

if (e.res.error) {
    console.error(e.error);
}

console.log(e.res.success);

save();
