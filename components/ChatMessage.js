import { LitElement, html } from "lit";

export class ExChatMessage extends LitElement {
    static properties = {
        message: { type: String },
    };

    render() {
        return html`<p>${this.message}</p>`;
    }

    constructor() {
        super();
    }
}

customElements.define("ex-chat-message", ExChatMessage);
