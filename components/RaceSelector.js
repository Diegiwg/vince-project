/* eslint-disable indent */
import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref";
import { repeat } from "lit/directives/repeat";

import { Data, Page } from "../modules/Functions.js";

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
     * @returns {string} Nome da Raça.
     */
    get() {
        if (this._value === "" || !this.races.includes(this._value))
            return null;

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
        if (this._value === "" || !this.races.includes(this._value)) return "";

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
