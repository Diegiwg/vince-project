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
});

let data = {};

setInterval(() => {
    localStorage.setItem("data", JSON.stringify(data));
}, 100);

const loaded = localStorage.getItem("data");
if (loaded) {
    data = JSON.parse(loaded);
}

if (!data.id || !data.token)
    EmitEvent("Event::RenderPage", {
        page: "Login",
    });
else
    EmitEvent("Event::RenderPage", {
        page: "Home",
    });
