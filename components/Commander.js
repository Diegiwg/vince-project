import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat.js";

import { EmitEvent, ListenEvent, RemoveEvent } from "../modules/Functions.js";

export class ExCommander extends LitElement {
    static properties = {
        messages: {
            type: Array,
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

        // Split args in pair of key/value
        const args = Array.from(string.matchAll(/([\w]*)?=([\w\d]*)?/g)).map(
            (pair) => {
                return { key: pair[1], value: pair[2] };
            }
        );

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

        input.setAttribute("index", -1);
        input.value = "";
    }

    /**
     * @param {KeyboardEvent} event Evento de tecla pressionada.
     */
    historyNavigation(event) {
        if (!event.key === "ArrowUp" || !event.key === "ArrowDown") return;

        const input = this.inputNode.value;

        const index = Number(input.getAttribute("index"));
        if (!index) return;

        if (
            (index === -1 && event.key === "ArrowDown") ||
            this.inputHistory.length === 0
        )
            return;

        if (index === -1 && event.key === "ArrowUp") {
            input.setAttribute("index", this.inputHistory.length - 1);
            return;
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
                    placeholder="Envie algum comando..."
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
