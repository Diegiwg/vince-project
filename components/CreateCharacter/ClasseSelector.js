/* eslint-disable indent */
import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

import { Data, Page } from "../../modules/Functions.js";

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

        this._node = createRef();
        this._value = "";
        this.classes = null;
    }

    /**
     * Retorna a Classe selecionada.
     * @returns {string} Nome da Classe.
     */
    get() {
        if (
            this._value === "" ||
            !this.classes ||
            !this.classes.includes(this._value)
        )
            return null;

        return this._value;
    }

    _raceChangeHandler(race) {
        if (race === "") return;

        this.classes = null;
        this._value = "";
        this._node.value.value = "";

        this.classes = Data.get().page_data.races[race].classes;
    }

    _changeHandler() {
        this._value = this._node.value?.value;
    }

    _classeOption(classe) {
        return html` <option value="${classe}">${classe}</option> `;
    }

    _renderClasseInfo() {
        if (
            this._value === "" ||
            !this.classes ||
            !this.classes.includes(this._value)
        )
            return "";

        /** @type {{description: string}} */
        const l_classe = Data.get().page_data.classes[this._value];

        return html` <p>Descrição:<br />${l_classe.description}</p> `;
    }

    render() {
        return html`
            <select ${ref(this._node)} @change=${this._changeHandler}>
                <option value="">Escolha uma Classe</option>
                ${!this.classes
                    ? ""
                    : repeat(
                          this.classes,
                          (classe) => classe,
                          (classe) => this._classeOption(classe)
                      )}
            </select>
            ${this._renderClasseInfo()}
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        Page.addEventListener("ex-race-selector:change", (e) => {
            this._raceChangeHandler(e.detail);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        Page.removeEventListener(
            "ex-race-selector:change",
            this._raceChangeHandler,
            true
        );
    }
}

customElements.define("ex-classe-selector", ExClasseSelector);
