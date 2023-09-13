import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

export class ExButton extends LitElement {
    static properties = {
        componentId: { type: String },
        asTitle: { type: Boolean },

        innerButton: { state: true },
    };

    static styles = css`
        :host {
            display: flex;
        }

        /* Reset H1 */
        h1 {
            font-size: 1rem;
            margin: 0;
            padding: 0;
        }

        button {
            width: 10rem;
        }
    `;

    constructor() {
        super();

        this.componentId = null;
        this.asTitle = false;

        this.innerButton = createRef();
    }

    get() {
        return this.innerButton.value;
    }

    _htmlNormal() {
        return html`<button ${ref(this.innerButton)}><slot></slot></button>`;
    }

    _htmlTitle() {
        return html`<h1>
            <button ${ref(this.innerButton)}><slot></slot></button>
        </h1>`;
    }

    render() {
        return this.asTitle ? this._htmlTitle() : this._htmlNormal();
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.componentId) {
            window.Component(this.componentId, this);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.componentId) {
            window.RemoveComponent(this.componentId);
        }
    }
}

customElements.define("ex-button", ExButton);
