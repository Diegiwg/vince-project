window.socket = io();

// Utils Functions

window.ListenEvent = (event_name, callback) => {
    socket.on("Event::" + event_name, callback);
    socket._callbacks["$" + "Event::" + event_name] = [callback];
};

window.EmitEvent = (event_name, custom_data) => {
    const payload = {
        ...custom_data,
        id: Object.keys(Data.get()).includes("id") ? Data.get().id : "",
        token: Object.keys(Data.get()).includes("token")
            ? Data.get().token
            : "",
    };

    socket.emit("Event::" + event_name, payload);
};

window.RemoveEvent = (event_name) => {
    if (socket._callbacks["$" + "Event::" + event_name]) {
        delete socket._callbacks["$" + "Event::" + event_name];
    }
};

window.Component = function (key, node) {
    window[key] = node;
};
