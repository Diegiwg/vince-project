import { LitElement, html, css } from "lit";

export class ExToast extends LitElement {
    static properties = {
        _queue: { state: true },
        _current: { state: true },
    };

    static styles = css`
        section {
            width: 100vw;
            display: flex;
            justify-content: center;
        }

        div {
            position: fixed;
            z-index: 2;
            max-width: 300px;

            top: 1rem;
            margin: 0 auto;

            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            color: white;
        }
        .success {
            background-color: #00cc44;
        }

        .danger {
            background-color: #ff3300;
        }

        .warning {
            background-color: #ffcc00;
            color: black;
        }

        .info {
            background-color: #17a2b8;
        }
    `;

    constructor() {
        super();

        this._queue = [];
        this._current = null;
    }

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
            this._current.time ? this._current.time : 2_000
        );
    }

    render() {
        return html`
            <section>
                ${this._current
                    ? html` <div tabindex="0" class="${this._current.type}">
                          ${this._current.message}
                      </div>`
                    : ""}
            </section>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        setTimeout(() => {
            window.Component("Toast", this);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        delete window.components["Toast"];
    }
}

customElements.define("ex-toast", ExToast);
