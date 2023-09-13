import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

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
