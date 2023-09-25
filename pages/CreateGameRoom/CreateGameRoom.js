import { EmitEvent, Page, Toast } from "../../modules/Functions.js";

/**
 *
 */
export function mount() {
    /**
     *
     * @param event
     */
    function submitHandler(event) {
        event.preventDefault();

        const pageName = Page.querySelector("input[name='name']").value;
        const pageIsPublic = Page.querySelector(
            "input[name='isPublic']"
        ).checked;
        const pagePassword = pageIsPublic
            ? ""
            : Page.querySelector("input[name='password']").value;

        if (!pageName || pageName.length < 5) {
            return Toast.add({
                message: "O nome deve ter no mínimo 5 caracteres.",
                type: "WARN",
            });
        }

        if (!pageIsPublic && !pagePassword) {
            return Toast.add({
                message: "A senha é obrigatória para salas privadas.",
                type: "WARN",
            });
        }

        EmitEvent("CreateGameRoom", {
            name: pageName,
            isPublic: pageIsPublic,
            password: pagePassword,
        });
    }

    Page.querySelector("form").onsubmit = submitHandler;
}
