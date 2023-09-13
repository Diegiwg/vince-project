import { LitElement, html } from "lit";

export class ExPage extends LitElement {
    static properties = {
        content: { type: String },
    };

    constructor() {
        super();
    }

    registerEventListener() {
        console.log("Registering events...");

        socket.on("disconnect", () => {
            console.log("Reloading...");

            setTimeout(() => {
                window.location.reload();
            });
        });

        ListenEvent("RenderPage", (payload) => {
            const { content } = payload;
            delete payload.content;

            Data.set(payload);

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
            window.Component("Page", () => {
                return this.shadowRoot;
            });
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("RenderPage");
        delete window.components["page"];
    }

    render() {
        return html`<div>${this.content}</div>`;
    }
}

customElements.define("ex-page", ExPage);
