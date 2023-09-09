const socket = io();
const app = document.querySelector("app");

// Utils Functions

window.Component = (component, extra_selectors) => {
    if (!component) return;
    if (!extra_selectors) extra_selectors = "";

    return document.querySelector(`[c=${component}] ${extra_selectors}`);
};

window.ListenEvent = (event_name, callback) => {
    socket.on(event_name, callback);
    socket._callbacks["$" + event_name] = [callback];
};

window.EmitEvent = (event_name, data) => {
    socket.emit(event_name, data);
};

// Client

let data = {};

setInterval(() => {
    localStorage.setItem("data", JSON.stringify(data));
}, 100);

const loaded = localStorage.getItem("data");
if (loaded) {
    data = JSON.parse(loaded);
}

let first_page = setInterval(() => {
    EmitEvent("Event::Init", data);
}, 1_000);

// Const Events Listeners

ListenEvent("disconnect", () => {
    setTimeout(() => {
        window.location.reload();
    }, 100);
});

ListenEvent("Event::RenderPage", (payload) => {
    data = { ...data, ...payload };

    const html = document
        .createRange()
        .createContextualFragment(payload.content);
    app.replaceChildren(html);

    if (first_page) {
        clearInterval(first_page);
        first_page = null;
    }
});
