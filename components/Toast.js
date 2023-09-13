import { LitElement, css, html } from "lit";

export class ExToast extends LitElement {
    static properties = {
        _queue: { state: true },
        _current: { state: true },
    };

    static styles = css`
        #container {
            width: 100vw;
            display: flex;
            justify-content: center;
        }

        #toast {
            position: fixed;
            z-index: 2;
            max-width: 300px;

            bottom: 1rem;
            margin: 0 auto;

            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            color: white;
        }
        .SUCCESS {
            background-color: #00cc44;
        }

        .ERROR {
            background-color: #ff3300;
        }

        .WARN {
            background-color: #ffcc00;
            color: #2a2626;
        }

        .INFO {
            background-color: #17a2b8;
        }
    `;

    constructor() {
        super();

        /** @type {import('../modules/Models.js').Toast[]} */
        this._queue = [];

        /** @type {import('../modules/Models.js').Toast} */
        this._current = null;
    }

    /** @param {import('../modules/Models.js').Toast} data */
    add(data) {
        this._queue = [...this._queue, data];
        this._showHandler();
    }

    _showHandler() {
        if (this._queue.length === 0 || this._current) return;

        this._current = this._queue.shift();
        setTimeout(
            () => {
                this._current = null;
                this._showHandler();
            },
            this._current.time ? this._current.time : 3_000
        );
    }

    render() {
        return html`
            <div role="status" id="container">
                ${this._current
                    ? html` <div
                          id="toast"
                          tabindex="0"
                          class="${this._current.type}"
                      >
                          ${this._current.message}
                      </div>`
                    : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        ListenEvent("Toast", (payload) => {
            this.add({
                type: payload.type,
                message: payload.message,
                time: payload.time,
            });
        });

        setTimeout(() => {
            window.Component("Toast", this);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("Toast");
        delete window.components["Toast"];
    }
}

customElements.define("ex-toast", ExToast);
