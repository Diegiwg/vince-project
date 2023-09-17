import { LitElement, html } from "lit";

import { ListenEvent, RemoveEvent } from "../modules/Functions.js";

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

    registerEventListener() {
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

            // Change the title of the page to the current page
            document.title = `${Data.get().page} Page`;

            this.content = document
                .createRange()
                .createContextualFragment(content);
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
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
