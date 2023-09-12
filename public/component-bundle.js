import { LitElement, html, css, createRef, ref } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class ExPage extends LitElement {
    static properties = {
        content: { type: String },
    };

    registerEventListener() {
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

    render() {
        return html`<div>${this.content}</div>`;
    }

    constructor() {
        super();

        this.registerEventListener();

        // Enable search elements in page by components.page
        setTimeout(() => {
            window.Component("page", this.shadowRoot);
        });
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

    registerEvents() {
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

    /** @param {HTMLElement} el */
    inputCallback(el) {
        try {
            this.messageInputRef = el;

            el.onkeyup = function (event) {
                if (event.key !== "Enter") return;

                const value = el.value;
                if (!value) return;

                EmitEvent("NewMessage", { room: data.page, message: value });
                el.value = "";
            };
        } catch {}
    }

    /** @param {HTMLElement} el */
    buttonCallback(el) {
        try {
            el.onclick = () => {
                const value = this.messageInputRef.value;
                if (!value) return;

                EmitEvent("NewMessage", { room: data.page, message: value });
                this.messageInputRef.value = "";
            };
        } catch {}
    }

    render() {
        return html`
            <ul ${ref(this.messagesRef)}>
                ${this.data.map((message) => {
                    return html` <p>${message}</p> `;
                })}
            </ul>
            <input
                ${ref(this.inputCallback)}
                type="text"
                placeholder="Digite algo..."
            />
            <button ${ref(this.buttonCallback)}>Enviar</button>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        this.registerEvents();
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("NewMessage");
    }

    constructor() {
        super();

        this.data = [];
        this.messagesRef = createRef();
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
