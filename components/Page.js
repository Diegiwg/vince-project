import { LitElement, html } from "lit";

export class ExPage extends LitElement {
    static properties = {
        content: { type: String },
    };

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

    render() {
        return html`<div>${this.content}</div>`;
    }

    constructor() {
        super();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
            window.Component("page", this.shadowRoot);
        });
    }
}

customElements.define("ex-page", ExPage);
