import { LitElement, css, html, createRef, ref, repeat } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class ExData extends LitElement {
    static properties = {
        data: { state: true },
    };

    static styles = css`
        :host,
        pre {
            height: 10rem;
            overflow-y: scroll;
        }
    `;

    constructor() {
        super();
        this.data = {};
    }

    add(key, value) {
        this.data[key] = value;
        localStorage.setItem("data", JSON.stringify(this.data));
    }

    set(value) {
        this.data = value;
        localStorage.setItem("data", JSON.stringify(this.data));
    }

    get() {
        return this.data;
    }

    connectedCallback() {
        super.connectedCallback();

        Component("Data", this);

        // Search for saved data in local storage
        const saved = localStorage.getItem("data");
        if (saved) this.data = JSON.parse(saved);
    }
}

customElements.define("ex-data", ExData);



export class ExPage extends LitElement {
    static properties = {
        content: {
            converter: (value) => {
                if (!value) return;

                console.log("Converting page...");

                return document.createRange().createContextualFragment(value);
            },
        },
    };

    _setRoute(name) {
        // Change the title of the page to the current page
        document.title = `${name}`;

        // Change the url of the page to the current page
        window.history.pushState({}, "", `#/${name}`);

        // Save
        Data.add("page", name);
    }

    _registerEventListener() {
        console.log("Registering events...");

        socket.on("disconnect", () => {
            console.log("Reloading...");

            setTimeout(() => {
                window.location.reload();
            });
        });

        ListenEvent("RenderPage", (payload) => {
            console.log("Rendering page...");

            const { content } = payload;
            delete payload.content;

            // Save all values in Data Manager
            Data.set(payload);

            this._setRoute(payload.page);

            this.content = document
                .createRange()
                .createContextualFragment(content);
        });
    }

    connectedCallback() {
        super.connectedCallback();

        this._registerEventListener();

        setTimeout(() => {
            let l_page = new URLPattern(document.URL).hash.replace("/", "");
            if (l_page === "") l_page = Data.get().page;

            // The Initial Connection
            EmitEvent("RequestPage", {
                page: l_page,
            });

            Component("Page", this.shadowRoot);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("RenderPage");
        delete window.components["page"];
    }

    render() {
        return html`${this.content}`;
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

        #history {
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
            <div role="log" aria-labelledby="Chat">
                <ul ${ref(this.messagesRef)} id="history">
                    ${repeat(this.data, (message) => {
                        return html`<p>${message}</p>`;
                    })}
                </ul>
                <div id="controls">
                    <input
                        ${ref(this.messageInputRef)}
                        @keyup=${this.sendMessageCallback}
                        type="text"
                        placeholder="Digite algo..."
                    />
                    <button @click="${this.sendMessageCallback}">Enviar</button>
                </div>
            </div>
        `;
    }
}

customElements.define("ex-chat", ExChat);



export class ExCreateCharacterAttributes extends LitElement {
    static properties = {
        points_limit: { type: Number },
        points: { type: Number },
        inputs: { type: Array },
    };

    static styles = css`
        :host,
        p {
            margin: 0;
            padding: 0;
        }

        #attributes {
            display: flex;
            flex-direction: column;
        }
    `;

    /** @type {HTMLInputElement} */
    inputs_nodes = {};

    constructor() {
        super();

        this.inputs = [];
        this.points_limit = Data.get().page_data.points_limit;
        this.points = Data.get().page_data.points_limit;
    }

    setFields(data) {
        this.inputs = data;
    }

    /**
     * Retorna os valores de cada atributo.
     * @returns {{strength: number, agility: number, vitality: number, intelligence: number, spirituality: number}}
     */
    get() {
        if (this.points > 0) return null;

        return {
            strength: Number(this.inputs_nodes.strength.value),
            agility: Number(this.inputs_nodes.agility.value),
            vitality: Number(this.inputs_nodes.vitality.value),
            intelligence: Number(this.inputs_nodes.intelligence.value),
            spirituality: Number(this.inputs_nodes.spirituality.value),
        };
    }

    /** @return {HTMLInputElement} */
    _getField(name) {
        return this.inputs_nodes[name];
    }

    _changeHandler(event) {
        const l_name = event.target.id;
        const l_element = this._getField(l_name);

        // Verificar se o valor atual é maior que o limite
        if (
            Number(l_element.value) >
            Number(l_element.getAttribute("history")) + this.points
        ) {
            l_element.value = l_element.getAttribute("history");
            return;
        }

        // Salvar valor atual
        l_element.setAttribute("history", l_element.value);

        // Calcular o valor atual de todos os inputs
        let total = 0;
        Object.values(this.inputs_nodes).forEach((el) => {
            total += Number(el.value);
        });

        this.points = this.points_limit - total;
    }

    /** @type {{name: string, text: string}} */
    _fieldsNode(data) {
        const { name, text } = data;

        const l_ref = createRef();

        const content = html`
            <label for="${name}">${text}:</label>
            <input
                ${ref(l_ref)}
                id="${name}"
                @keyup=${this._changeHandler}
                type="number"
                name="${name}"
                min="0"
                value="0"
                history="0"
            />
        `;

        setTimeout(() => {
            this.inputs_nodes[name] = l_ref.value;
        });

        return content;
    }

    render() {
        return html`
            <p>Pontos Restantes: ${this.points}/${this.points_limit}</p>
            <br />
            <div id="attributes">
                ${repeat(
                    this.inputs,
                    (input) => input.name,
                    (input) => {
                        return this._fieldsNode(input);
                    }
                )}
            </div>
        `;
    }
}

customElements.define(
    "ex-create-character-attributes",
    ExCreateCharacterAttributes
);



export class ExToast extends LitElement {
    static properties = {
        _queue: { state: true },
        _current: { state: true },
    };

    static styles = css`
        #container {
            width: 100vw;
            display: flex;
            justify-content: center;
        }

        #toast {
            position: fixed;
            z-index: 2;
            max-width: 300px;

            bottom: 1rem;
            margin: 0 auto;

            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            color: white;
        }
        .SUCCESS {
            background-color: #00cc44;
        }

        .ERROR {
            background-color: #ff3300;
        }

        .WARN {
            background-color: #ffcc00;
            color: #2a2626;
        }

        .INFO {
            background-color: #17a2b8;
        }
    `;

    constructor() {
        super();

        /** @type {import('../modules/Functions.js').Toast[]} */
        this._queue = [];

        /** @type {import('../modules/Functions.js').Toast} */
        this._current = null;
    }

    /** @param {import('../modules/Functions.js').Toast} data */
    add(data) {
        this._queue = [...this._queue, data];
        this._showHandler();
    }

    _showHandler() {
        if (this._queue.length === 0 || this._current) return;

        this._current = this._queue.shift();
        setTimeout(
            () => {
                this._current = null;
                this._showHandler();
            },
            this._current.time ? this._current.time : 3_000
        );
    }

    render() {
        return html`
            <div role="status" id="container">
                ${this._current
                    ? html` <div
                          id="toast"
                          tabindex="0"
                          class="${this._current.type}"
                      >
                          ${this._current.message}
                      </div>`
                    : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        ListenEvent("Toast", (payload) => {
            this.add({
                type: payload.type,
                message: payload.message,
                time: payload.time,
            });
        });

        setTimeout(() => {
            Component("Toast", this);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        RemoveEvent("Toast");
        delete window.components["Toast"];
    }
}

customElements.define("ex-toast", ExToast);



export class ExRaceSelector extends LitElement {
    static properties = {
        _node: { type: Object },
        _value: { type: String },
        races: { type: Object },
    };

    static styles = css`
        p {
            margin: 0 !important;
            padding: 0 !important;
        }
    `;

    constructor() {
        super();

        /** @type {{value: HTMLSelectElement}} */
        this._node = createRef();
        this._value = "";
        this.races = null;
    }

    set(races) {
        this.races = races;
    }

    /**
     * Retorna a Raça selecionada.
     * @returns {string}
     */
    get() {
        if (this._value === "") return null;

        return this._value;
    }

    _changeHandler() {
        this._value = this._node.value.value;

        Page.dispatchEvent(
            new CustomEvent("ex-race-selector:change", {
                detail: this._value,
            })
        );
    }

    _raceOption(race) {
        return html` <option value="${race}">${race}</option> `;
    }

    _renderRaceInfo() {
        if (this._value === "") return "";

        /** @type {{hp: number, sp: number, mp: number, description: string}} */
        const l_race = Data.get().page_data.races[this._value];

        return html`
            <p>Vida: ${l_race.hp}</p>
            <p>Vigor: ${l_race.sp}</p>
            <p>Mana: ${l_race.mp}</p>
            <p>Descrição:<br />${l_race.description}</p>
        `;
    }

    render() {
        return !this.races
            ? ""
            : html`
                  <select ${ref(this._node)} @change=${this._changeHandler}>
                      <option value="">Escolha uma Raça</option>
                      ${repeat(
                          this.races,
                          (race) => race,
                          (race) => html`${this._raceOption(race)}`
                      )}
                  </select>
                  ${this._renderRaceInfo()}
              `;
    }
}

customElements.define("ex-race-selector", ExRaceSelector);



export class ExClasseSelector extends LitElement {
    static properties = {
        _node: { type: Object },
        _value: { type: String },
        classes: { type: Object },
    };

    static styles = css`
        p {
            margin: 0 !important;
            padding: 0 !important;
        }
    `;

    constructor() {
        super();

        /** @type {{value: HTMLSelectElement}} */
        this._node = createRef();
        this._value = "";
        this.classes = null;
    }

    /**
     * Retorna a Classe selecionada.
     */
    get() {
        if (this._value === "") return null;

        return this._value;
    }

    _changeHandler() {
        this._value = this._node.value.value;
    }

    _classeOption(classe) {
        return html` <option value="${classe}">${classe}</option> `;
    }

    _renderClasseInfo() {
        if (this._value === "") return "";

        /** @type {{description: string}} */
        const l_classe = Data.get().page_data.classes[this._value];

        return html` <p>Descrição:<br />${l_classe.description}</p> `;
    }

    render() {
        return html`
            <select
                ${ref(this._node)}
                @change=${this._changeHandler}
                ?disabled=${!this.classes}
            >
                <option value="">Escolha uma Classe</option>
                ${!this.classes
                    ? ""
                    : repeat(
                          this.classes,
                          (classe) => classe,
                          (classe) => html`${this._classeOption(classe)}`
                      )}
            </select>
            ${this._renderClasseInfo()}
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        Page.addEventListener("ex-race-selector:change", (event) => {
            this.classes = null;
            this._value = "";
            this._node.value.value = "";

            if (event.detail === "") return;

            this.classes = Data.get().page_data.races[event.detail].classes;
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        Page.removeEventListener("ex-race-selector:change");
    }
}

customElements.define("ex-classe-selector", ExClasseSelector);
