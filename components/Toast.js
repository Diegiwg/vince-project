import { LitElement, html, css } from "lit";

export class ExToast extends LitElement {
    static properties = {
        queue: { type: Array },
        content: { type: String },
    };

    static styles = css`
        div {
            position: fixed;
            z-index: 2;
            max-width: 300px;

            bottom: 1rem;
            right: 1rem;

            padding: 10px 20px;
            border-radius: 5px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .success {
            background-color: #00cc44;
            color: white;
        }

        .danger {
            background-color: #ff3300;
            color: white;
        }

        .warning {
            background-color: #ffcc00;
            color: black;
        }

        .info {
            background-color: #17a2b8;
            color: white;
        }
    `;

    constructor() {
        super();

        this.content = "ola mundo";
    }

    add(data) {}

    render() {}
}

customElements.define("ex-toast", ExToast);
