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
        this.messageInputRef = el;

        el.onkeyup = function (event) {
            if (event.key !== "Enter") return;

            const value = el.value;
            if (!value) return;

            EmitEvent("NewMessage", { room: data.page, message: value });
            el.value = "";
        };
    }

    /** @param {HTMLElement} el */
    buttonCallback(el) {
        console.log(el);
        el.onclick = () => {
            const value = this.messageInputRef.value;
            if (!value) return;

            EmitEvent("NewMessage", { room: data.page, message: value });
            this.messageInputRef.value = "";
        };
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

    constructor() {
        super();

        this.data = [];
        this.messagesRef = createRef();

        this.registerEvents();
    }
}

customElements.define("ex-chat", ExChat);
