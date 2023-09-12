const socket = io();
const app = document.querySelector("app");

window.components = {};

// Utils Functions

window.ListenEvent = (event_name, callback) => {
    socket.on(event_name, callback);
    socket._callbacks["$" + "Event::" + event_name] = [callback];
};

window.EmitEvent = (event_name, custom_data) => {
    const payload = {
        ...custom_data,
        id: Object.keys(data).includes("id") ? data.id : "",
        token: Object.keys(data).includes("token") ? data.token : "",
    };

    socket.emit("Event::" + event_name, payload);
};

window.Component = function (key, node) {
    window.components[key] = node;
};

// Client

window.data = {};

setInterval(() => {
    localStorage.setItem("data", JSON.stringify(data));
}, 100);

const loaded = localStorage.getItem("data");
if (loaded) {
    data = JSON.parse(loaded);
}

window.first_page = setInterval(() => {
    EmitEvent("Init", data);
}, 1_000);

// Const Events Listeners

ListenEvent("disconnect", () => {
    console.log("Reloading...");

    setTimeout(() => {
        window.location.reload();
    }, 100);
});
