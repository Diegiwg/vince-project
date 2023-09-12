import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

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
