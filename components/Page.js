import { LitElement, html } from "lit";

import {
    Data,
    EmitEvent,
    ListenEvent,
    RemoveEvent,
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
        // Change the title of the page to the current page
        document.title = `${name}`;

        // Change the url of the page to the current page
        window.history.pushState({}, "", `#/${name}`);

        // Save
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

            // Save all values in Data Manager
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
            let l_page = new URLPattern(document.URL).hash.replace("/", "");
            if (l_page === "") l_page = Data.get().page;

            // The Initial Connection
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
