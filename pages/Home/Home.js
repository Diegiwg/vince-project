import { EmitEvent, Page } from "../../modules/Functions.js";

export function mount() {
    Page.querySelector("#Logout").onclick = () => {
        EmitEvent("Logout");
    };
}
