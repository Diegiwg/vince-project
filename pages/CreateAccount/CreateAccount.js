import { EmitEvent, Page, Toast } from "../../modules/Functions.js";

export function mount() {
    /** @param {PointerEvent | SubmitEvent} event */
    const _submitHandler = (event) => {
        if (event.type === "submit") event.preventDefault();

        const name = Page.querySelector("[name=name]");
        const email = Page.querySelector("[name=email]");
        const password = Page.querySelector("[name=password]");

        if (!name.value || !email.value || !password.value)
            return Toast.add({
                message: "Por favor, preencha todos os campos",
                type: "WARN",
            });

        // TODO: Adicionar a verificação do Schema com o ValiBot.
        EmitEvent("CreateAccount", {
            name: name.value,
            email: email.value,
            password: password.value,
        });
    };

    setTimeout(() => {
        Page.querySelector("#CreateAccountForm").addEventListener(
            "submit",
            _submitHandler
        );

        Page.querySelector("#LoginPage").addEventListener("click", () =>
            EmitEvent("RequestPage", { page: "Login" })
        );
    });
}
