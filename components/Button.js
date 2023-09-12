import { LitElement } from "lit";
import { ref } from "lit/directives/ref.js";

export class ExButton extends LitElement {
    static properties = {
        clickCount: { type: Number },
    };

    callback(el) {
        try {
            el.onclick = () => {
                this.clickCount++;
            };
        } catch {}
    }

    render() {
        return html`<button ${ref(this.callback)}>
            Clique em mim para aumentar o valor: <span>${this.clickCount}</span>
        </button>`;
    }

    constructor() {
        super();
        this.clickCount = 0;
    }
}

customElements.define("ex-button", ExButton);
