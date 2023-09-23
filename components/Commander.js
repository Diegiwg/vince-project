import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat.js";

import { EmitEvent, ListenEvent, RemoveEvent } from "../modules/Functions.js";

export class ExCommander extends LitElement {
    static properties = {
        messages: {
            type: Array,
        },
        index: {
            type: {
                Number,
            },
        },
    };

    static styles = css`
        ul {
            list-style: none;
            padding: 0;
            margin: 0;

            height: 40vh;
            overflow-y: scroll;

            > li {
                padding: 1rem;
            }
        }
    `;

    constructor() {
        super();

        this.messages = [];
        this.index = -1;
    }

    inputNode = createRef();
    /** @type {Array<string>} */
    inputHistory = [];

    parserMessage(message) {
        console.log(message);

        if (typeof message !== "string") message = JSON.stringify(message);

        this.messages = [message, this.messages];
    }

    /**
     * Função para analisar um comando.
     * @param {string} string String a ser analisada
     * @returns {object} Objeto contendo o nome do comando e os argumentos.
     */
    parserCommand(string) {
        if (!string.startsWith("/")) return null;

        // Extrair o nome do comando.
        const name = string.matchAll(/\/([\w-]+)?/g)?.next().value[1];

        if (!name) return null;

        const args = {};
        Array.from(string.matchAll(/([\w]*)?=([\w\d]*)?/g)).map((pair) => {
            args[pair[1]] = pair[2];
        });

        return { name, args };
    }

    /**
     * @param {SubmitEvent} event Evento de submissão do formulário.
     */
    sendCommand(event) {
        event.preventDefault();

        const input = this.inputNode.value;
        if (!input.value) return;

        const command = this.parserCommand(input.value);
        if (!command) return;

        EmitEvent("command", command);

        this.inputHistory.push(input.value);

        this.index = -1;
        input.value = "";

        console.log(this.inputHistory);
    }

    /**
     * Sistema de navegação de histórico de comandos.
     * @param {KeyboardEvent} event Evento de tecla pressionada.
     */
    historyNavigation(event) {
        if (!event.key === "ArrowUp" || !event.key === "ArrowDown") return;

        const local_index = Number(this.index);
        const input = this.inputNode.value;

        if (this.inputHistory.length === 0) return;

        // ArrowDown
        if (event.key === "ArrowDown") {
            if (local_index === -1) return;

            if (this.inputHistory.length > local_index + 1) {
                this.index = local_index + 1;
                input.value = this.inputHistory[this.index];

                return;
            }

            this.index = -1;
            input.value = "";
        }

        if (event.key === "ArrowUp") {
            if (local_index === -1) {
                this.index = this.inputHistory.length - 1;
                input.value = this.inputHistory[this.index];
                return;
            }

            if (local_index > 0) {
                this.index = local_index - 1;
                input.value = this.inputHistory[this.index];
                return;
            }
        }
    }

    render() {
        return html`
            <ul>
                ${repeat(this.messages, (message) => {
                    return html` <p>${message}</p> `;
                })}
            </ul>

            <form @submit=${this.sendCommand}>
                <input
                    ${ref(this.inputNode)}
                    index=${this.index}
                    placeholder="Envie algum comando..."
                    @keyup=${this.historyNavigation}
                />
            </form>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        ListenEvent("command", (payload) => {
            this.parserMessage(payload);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("command");
    }
}

customElements.define("ex-commander", ExCommander);
