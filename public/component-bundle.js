import { LitElement, css, html, createRef, ref, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

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
            ? html` <span>LOCAL DATA</span>
                  <pre>
${JSON.stringify(this.data, undefined, 2)}
</pre>
                  <hr />`
            : html``;
    }
}

customElements.define("ex-local-data", LocalData);

export class ExPage extends LitElement {
    static properties = {
        content: {
            converter: (value) => {
                if (!value) return "";

                console.log("Converting page...");

                return document.createRange().createContextualFragment(value);
            },
        },
    };

    constructor() {
        super();
    }

    registerEventListener() {
        console.log("Registering events...");

        socket.on("disconnect", () => {
            console.log("Reloading...");

            setTimeout(() => {
                window.location.reload();
            });
        });

        ListenEvent("RenderPage", (payload) => {
            console.log("Rendering page...");

            const { content } = payload;
            delete payload.content;

            // Save all values in Data Manager
            Data.set(payload);

            // Change the title of the page to the current page
            document.title = `${Data.get().page} Page`;

            this.content = document
                .createRange()
                .createContextualFragment(content);
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
            window.Component("Page", () => {
                return this.shadowRoot;
            });
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("RenderPage");
        delete window.components["page"];
    }

    render() {
        return html`${this.content}`;
    }
}

customElements.define("ex-page", ExPage);

export class ExChat extends LitElement {
    static properties = {
        data: { type: [String] },
        messagesRef: {},
        messageInputRef: {},
    };

    static styles = css`
        :host {
            display: block;
            background-color: #363636;
            padding: 0;
            margin: 0;
            width: 600px;
        }

        #history {
            height: 250px;
            overflow-y: scroll;
            padding: 1rem;
            margin: 0;

            > p {
                margin: 0;
                padding: 0;
                color: #e9e9e9e1;
            }
        }

        #controls {
            display: flex;

            > input {
                width: 80%;
            }

            > button {
                width: 20%;
            }
        }
    `;

    constructor() {
        super();

        this.data = [];
        this.messagesRef = createRef();
        this.messageInputRef = createRef();
    }

    /** @param {KeyboardEvent | MouseEvent} event  */
    sendMessageCallback(event) {
        if (event.type === "keyup" && event.key !== "Enter") return;

        const value = this.messageInputRef.value.value;
        if (!value) return;

        EmitEvent("NewMessage", { room: Data.get().page, message: value });
        this.messageInputRef.value.value = "";
    }

    connectedCallback() {
        super.connectedCallback();

        ListenEvent("NewMessage", (payload) => {
            this.data = [...this.data, payload.message];

            setTimeout(() => {
                this.messagesRef.value.scrollTop =
                    this.messagesRef.value.scrollHeight;
            }, 1);
        });

        EmitEvent("RegisterRoom", {
            room: Data.get().page,
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("NewMessage");
    }

    render() {
        return html`
            <div role="log" aria-labelledby="Chat">
                <ul ${ref(this.messagesRef)} id="history">
                    ${repeat(this.data, (message) => {
                        return html`<p>${message}</p>`;
                    })}
                </ul>
                <div id="controls">
                    <input
                        ${ref(this.messageInputRef)}
                        @keyup=${this.sendMessageCallback}
                        type="text"
                        placeholder="Digite algo..."
                    />
                    <button @click="${this.sendMessageCallback}">Enviar</button>
                </div>
            </div>
        `;
    }
}

customElements.define("ex-chat", ExChat);

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
