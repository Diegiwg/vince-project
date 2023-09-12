import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";

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

    messageInputCallback(el) {
        el.onclick = () => {
            const value = this.messageInputRef.value.value;
            if (!value) return;

            EmitEvent("NewMessage", { room: data.page, message: value });
            this.messageInputRef.value.value = "";
        };
    }

    render() {
        return html`
            <hr />
            <ul ${ref(this.messagesRef)}>
                ${this.data.map((item) => {
                    return html`
                        <ex-chat-message message=${item}> </ex-chat-message>
                    `;
                })}
            </ul>
            <hr />
            <input
                ${ref(this.messageInputRef)}
                type="text"
                placeholder="Digite algo..."
            />
            <button ${ref(this.messageInputCallback)}>Enviar</button>
            <hr />
        `;
    }

    constructor() {
        super();

        this.data = [];
        this.messagesRef = createRef();
        this.messageInputRef = createRef();

        this.registerEvents();
    }
}

customElements.define("ex-chat", ExChat);
