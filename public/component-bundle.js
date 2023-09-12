import { LitElement, html, css, createRef, ref, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

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
            }, 100);
        });

        ListenEvent("RenderPage", (payload) => {
            const { content } = payload;
            delete payload.content;

            data = payload;

            this.content = document
                .createRange()
                .createContextualFragment(content);

            if (first_page) {
                clearInterval(first_page);
                first_page = null;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
            window.Component("page", this.shadowRoot);
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
        data: { type: Array },
        messagesRef: { type: HTMLUListElement },
        messageInputRef: { type: HTMLInputElement },
    };

    static styles = css`
        ul {
            height: 300px;
            overflow-y: scroll;

            padding: 0;
            margin: 0;
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

        EmitEvent("NewMessage", { room: data.page, message: value });
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
            room: data.page,
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
                    return html` <p>${message}</p> `;
                })}
            </ul>
            <input
                ${ref(this.messageInputRef)}
                @keyup=${this.sendMessageCallback}
                type="text"
                placeholder="Digite algo..."
            />
            <button @click="${this.sendMessageCallback}">Enviar</button>
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
