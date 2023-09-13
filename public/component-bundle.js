import { LitElement, html, css, createRef, ref, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

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

export class ExPage extends LitElement {
    static properties = {
        content: { type: String },
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
            const { content } = payload;
            delete payload.content;

            Data.set(payload);

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
        return html`<div>${this.content}</div>`;
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

        ul {
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

        div {
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
            <ul ${ref(this.messagesRef)}>
                ${repeat(this.data, (message) => {
                    return html`<p>${message}</p>`;
                })}
            </ul>
            <div>
                <input
                    ${ref(this.messageInputRef)}
                    @keyup=${this.sendMessageCallback}
                    type="text"
                    placeholder="Digite algo..."
                />
                <button @click="${this.sendMessageCallback}">Enviar</button>
            </div>
        `;
    }
}

customElements.define("ex-chat", ExChat);

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
