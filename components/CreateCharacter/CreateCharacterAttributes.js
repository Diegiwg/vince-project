/* eslint-disable indent */
import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";

import { Data } from "../modules/Functions.js";

/**
 * Retorna um valor aleatório.
 * @param {number} max Valor máximo.
 * @returns {number} Valor aleatório.
 */
function _getRandomValue(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Retorna um item aleatório de um array.
 * @param {Array} array Array de itens.
 * @returns {any} Item aleatório.
 */
function _getRandomValueFromArray(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    const randomValue = array.splice(randomIndex, 1)[0];
    return randomValue;
}

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

    randomize() {
        this.points = this.points_limit;

        const _temp = Object.values(this.inputs_nodes);
        const _temp_length = _temp.length;

        _temp.forEach((el) => {
            el.value = 0;
        });

        for (let index = 0; index < _temp_length; index++) {
            const value = _getRandomValue(this.points);
            const node = _getRandomValueFromArray(_temp);

            node.value = index === _temp_length - 1 ? this.points : value;
            this._changeHandler({ target: { id: node.id } });
        }
    }

    /**
     * Retorna os valores de cada atributo.
     * @returns {{strength: number, agility: number, vitality: number, intelligence: number, spirituality: number}} Objeto com os valores dos atributos.
     */
    get() {
        if (this.points > 0 || 0 < this.points) return null;

        return {
            strength: Number(this.inputs_nodes.strength.value),
            agility: Number(this.inputs_nodes.agility.value),
            vitality: Number(this.inputs_nodes.vitality.value),
            intelligence: Number(this.inputs_nodes.intelligence.value),
            spirituality: Number(this.inputs_nodes.spirituality.value),
        };
    }

    /**
     * @param {string} name Nome do atributo.
     * @returns {HTMLInputElement} Node do atributo.
     */
    _getField(name) {
        return this.inputs_nodes[name];
    }

    _changeHandler(event) {
        const l_name = event.target.id;
        const l_element = this._getField(l_name);

        // Verificar se o valor atual é maior que o limite
        if (
            Number(l_element.value) >
                Number(l_element.getAttribute("history")) + this.points ||
            Number(l_element.value) < 0
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
