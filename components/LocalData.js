import { LitElement, css, html } from "lit";

export class LocalData extends LitElement {
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

    _initLoop = null;
    _debug = null;

    constructor() {
        super();
        this.data = {};

        this._debug = window.DEBUG_MODE;
        delete window["DEBUG_MODE"];
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
        });
    }

    render() {
        return this._debug
            ? html` <span>LOCAL DATA:</span>
                  <pre>
${JSON.stringify(this.data, undefined, 2)}
</pre>
                  <hr />`
            : html``;
    }
}

customElements.define("ex-local-data", LocalData);
