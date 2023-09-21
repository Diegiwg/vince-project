import { LitElement, html } from "lit";

import {
    Component,
    Data,
    EmitEvent,
    ListenEvent,
    RemoveEvent,
    socket,
} from "../modules/Functions.js";

export class ExPage extends LitElement {
    static properties = {
        content: {
            converter: (value) => {
                if (!value) return;

                console.log("Converting page...");

                return document.createRange().createContextualFragment(value);
            },
        },
    };

    _setRoute(name) {
        document.title = `${name}`;
        window.history.pushState({}, "", `#/${name}`);
        Data.add("page", name);
    }

    _registerEventListener() {
        console.log("Registering events...");

        socket.on("disconnect", () => {
            console.log("Reloading...");

            setTimeout(() => {
                window.location.reload();
            });
        });

        ListenEvent("RenderPage", (payload) => {
            console.log("Rendering page...");

            const { content } = payload;
            delete payload.content;

            Data.set(payload);

            this._setRoute(payload.page);

            this.content = document
                .createRange()
                .createContextualFragment(content);
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this._registerEventListener();

        setTimeout(() => {
            // eslint-disable-next-line no-undef
            let l_page = new URLPattern(document.URL).hash.replace("/", "");
            if (l_page === "") l_page = "Home";

            EmitEvent("RequestPage", {
                page: l_page,
            });

            Component("Page", this.shadowRoot);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("RenderPage");
        delete window.components["page"];
    }

    render() {
        return html`${this.content}`;
    }
}

customElements.define("ex-page", ExPage);
