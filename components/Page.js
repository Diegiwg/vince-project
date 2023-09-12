import { LitElement, html } from "lit";

export class ExPage extends LitElement {
    static properties = {
        content: { type: String },
    };

    constructor() {
        super();
    }

    registerEventListener() {
        ListenEvent("RenderPage", (payload) => {
            const { content } = payload;
            delete payload.content;

            data = payload;

            this.content = document
                .createRange()
                .createContextualFragment(content);

            if (first_page) {
                clearInterval(first_page);
                first_page = null;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
            window.Component("page", this.shadowRoot);
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
