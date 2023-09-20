import { EmitEvent, Page } from "../../modules/Functions.js";

export function mount() {
    Page.querySelector("#CreateCharacter").onclick = () => {
        EmitEvent("RequestPage", { page: "CreateCharacter" });
    };

    Page.querySelector("#Logout").onclick = () => {
        EmitEvent("Logout");
    };
}
