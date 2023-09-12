window.socket = io();
window.components = {};

// Utils Functions

window.ListenEvent = (event_name, callback) => {
    socket.on("Event::" + event_name, callback);
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

window.RemoveEvent = (event_name) => {
    if (socket._callbacks["$" + "Event::" + event_name]) {
        delete socket._callbacks["$" + "Event::" + event_name];
    }
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
