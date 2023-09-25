import { EmitEvent, Page } from "../../modules/Functions.js";

/**
 * Função que será executada quando a página for carregada.
 */
export function mount() {
    Page.querySelector("#CreateCharacter").onclick = () => {
        EmitEvent("RequestPage", { page: "CreateCharacter" });
    };

    Page.querySelector("#CreateGameRoom").onclick = () => {
        EmitEvent("RequestPage", { page: "CreateGameRoom" });
    };

    Page.querySelector("#Logout").onclick = () => {
        EmitEvent("Logout");
    };
}
