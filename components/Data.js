import { LitElement, css } from "lit";

export class ExData extends LitElement {
    static properties = {
        data: { state: true },
    };

    static styles = css`
        :host,
        pre {
            height: 10rem;
            overflow-y: scroll;
        }
    `;

    constructor() {
        super();
        this.data = {};
    }

    add(key, value) {
        this.data[key] = value;
        localStorage.setItem("data", JSON.stringify(this.data));
    }

    set(value) {
        this.data = value;
        localStorage.setItem("data", JSON.stringify(this.data));
    }

    get() {
        return this.data;
    }

    connectedCallback() {
        super.connectedCallback();

        Component("Data", this);

        // Search for saved data in local storage
        const saved = localStorage.getItem("data");
        if (saved) this.data = JSON.parse(saved);
    }
}

customElements.define("ex-data", ExData);
