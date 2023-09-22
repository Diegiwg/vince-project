import { LitElement, html, css } from "lit";

/* 
    Estrutura esperada de um comando:
    /command-name argname=[argvalue] argname=[argvalue] ...
*/

export class ExCommander extends LitElement {
    static properties = {};
    static styles = css``;

    constructor() {
        super();
    }

    render() {
        return html``;
    }
}

customElements.define("ex-commander", ExCommander);
