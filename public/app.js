/* eslint-disable no-undef */

/** @type {import('socket.io').Socket} */
var socket = io();
window.socket = socket;

window.litDisableBundleWarning = true;

// Utils Functions

/** @type {{events: Set<string>, functions: Map<string, Function>}} */
var ListenedEvents = {
    events: new Set(),
    functions: new Map(),
};
window.ListenedEvents = ListenedEvents;

var HandlerEvents = () => {
    socket.on("response", (payload) => {
        const { target, data } = payload;

        if (!ListenedEvents.events.has(target)) return console.table(payload);

        ListenedEvents.functions.get(target)(data);
    });
};

var ListenEvent = (event_name, callback) => {
    ListenedEvents.events.add(event_name);
    ListenedEvents.functions.set(event_name, callback);
};
window.ListenEvent = ListenEvent;

var RemoveEvent = (event_name) => {
    ListenedEvents.events.delete(event_name);
    ListenedEvents.functions.delete(event_name);
};
window.RemoveEvent = RemoveEvent;

var EmitEvent = (event_name, custom_data) => {
    const payload = {
        ...custom_data,

        target: event_name,
        id: Object.keys(Data.get()).includes("id") ? Data.get().id : "",
        token: Object.keys(Data.get()).includes("token")
            ? Data.get().token
            : "",
    };

    socket.emit("request", payload);
};
window.EmitEvent = EmitEvent;

var Component = function (key, node) {
    window[key] = node;
};
window.Component = Component;

var RemoveComponent = function (key) {
    delete window[key];
};
window.RemoveComponent = RemoveComponent;

HandlerEvents();
