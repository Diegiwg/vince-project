import { LitElement, html } from "lit";

export class ExInput extends LitElement {
    static properties = {
        name: { type: String },
        type: { type: String },
        componentId: { type: String },
    };

    constructor() {
        super();

        this.name = null;
        this.type = null;
        this.componentId = null;
    }

    render() {
        return html`
            <label for="${this.name}"><slot></slot>:</label>
            <input type="${this.type}" name="${this.name}" />
        `;
    }
}
customElements.define("ex-input", ExInput);
