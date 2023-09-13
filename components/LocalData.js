import { LitElement, html } from "lit";

export class LocalData extends LitElement {
    static properties = {
        data: { state: true },
    };

    _initLoop = null;

    constructor() {
        super();
        this.data = {};
    }

    set(value) {
        this.data = value;
        localStorage.setItem("data", JSON.stringify(this.data));

        // Delete the loop if it exists
        if (this._initLoop) clearInterval(this._initLoop);
    }

    get() {
        return this.data;
    }

    connectedCallback() {
        super.connectedCallback();

        window.Component("Data", this);

        // Search for saved data in local storage
        const saved = localStorage.getItem("data");
        if (saved) this.data = JSON.parse(saved);

        // Init the Communication with the server
        this._initLoop = setInterval(() => {
            EmitEvent("Init", this.data);
        }, 1_000);
    }

    render() {
        return html` <p>${JSON.stringify(this.data)}</p> `;
    }
}

customElements.define("ex-local-data", LocalData);
