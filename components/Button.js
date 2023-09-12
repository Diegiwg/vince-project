import { LitElement } from "lit";
import { ref } from "lit/directives/ref.js";

export class ExButton extends LitElement {
    static properties = {
        clickCount: { type: Number },
    };

    callback(el) {
        el.onclick = () => {
            this.clickCount++;
        };
    }

    render() {
        return html`<button ${ref(this.callback)}>${this.clickCount}</button>`;
    }

    constructor() {
        super();
        this.clickCount = 0;
    }
}

customElements.define("ex-button", ExButton);
