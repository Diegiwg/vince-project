import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

import { Data, Page } from "../modules/Functions.js";

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
