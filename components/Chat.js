/* eslint-disable indent */
import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

import {
    Data,
    EmitEvent,
    ListenEvent,
    RemoveEvent,
} from "../modules/Functions.js";

export class ExChat extends LitElement {
    static properties = {
        messages: { type: [String] },
        inputIndex: { type: Number },
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

            > pre {
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

        this.messages = [];
        this.inputIndex = -1;
    }

    messagesList = createRef();
    sendMessageInput = createRef();

    historyMessages = [];

    render() {
        return html`
            <div role="log" aria-labelledby="Chat">
                <ul ${ref(this.messagesList)} id="history">
                    ${repeat(this.messages, (message) => {
                        return html` <pre>${message}</pre> `;
                    })}
                </ul>
                <form id="controls" @submit=${this.sendMessageCallback}>
                    <input
                        ${ref(this.sendMessageInput)}
                        @keyup=${this.navigationInHistory}
                        index=${this.inputIndex}
                        type="text"
                        placeholder="Chat Esferas..."
                    />
                    <button>Enviar</button>
                </form>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        ListenEvent("NewMessage", (payload) => {
            this.messages = [...this.messages, payload.message];

            setTimeout(() => {
                this.messagesList.value.scrollTop =
                    this.messagesList.value.scrollHeight;
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

    /**
     * Envia uma mensagem para o servidor.
     * @param {SubmitEvent} event Evento.
     */
    sendMessageCallback(event) {
        event.preventDefault();

        const local_input = this.sendMessageInput.value;
        const local_value = local_input.value;
        if (!local_value) return;

        EmitEvent("NewMessage", {
            room: Data.get().page,
            message: local_value,
        });

        this.historyMessages.push(local_value);
        this.inputIndex = -1;
        local_input.value = "";
    }

    /**
     * Sistema de navegação de histórico de comandos.
     * @param {KeyboardEvent} event Evento de tecla pressionada.
     */
    navigationInHistory(event) {
        if (!event.key === "ArrowUp" || !event.key === "ArrowDown") return;

        const local_index = Number(this.inputIndex);
        const local_input = this.sendMessageInput.value;

        if (this.historyMessages.length === 0) return;

        if (event.key === "ArrowDown") {
            if (local_index === -1) return;

            if (this.historyMessages.length > local_index + 1) {
                this.inputIndex = local_index + 1;
                local_input.value = this.historyMessages[this.inputIndex];

                return;
            }

            this.inputIndex = -1;
            local_input.value = "";
        }

        if (event.key === "ArrowUp") {
            if (local_index === -1) {
                this.inputIndex = this.historyMessages.length - 1;
                local_input.value = this.historyMessages[this.inputIndex];
                return;
            }

            if (local_index > 0) {
                this.inputIndex = local_index - 1;
                local_input.value = this.historyMessages[this.inputIndex];
                return;
            }
        }
    }
}

customElements.define("ex-chat", ExChat);
