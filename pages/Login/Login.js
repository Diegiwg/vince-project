import { EmitEvent, Page, Toast } from "../../modules/Functions.js";

export async function mount() {
    /** @param {PointerEvent | SubmitEvent} event */
    const _submitHandler = (event) => {
        if (event.type === "submit") event.preventDefault();

        const email = Page.querySelector("[name=email]");
        const password = Page.querySelector("[name=password]");

        if (!email.value || !password.value)
            return Toast.add({
                message: "Por favor, preencha todos os campos",
                type: "WARN",
            });

        // TODO: Adicionar a verificação do Schema com o ValiBot.
        EmitEvent("Login", {
            email: email.value,
            password: password.value,
        });
    };

    setTimeout(() => {
        Page.querySelector("#LoginForm").addEventListener(
            "submit",
            _submitHandler
        );

        Page.querySelector("#CreateAccountPage").addEventListener("click", () =>
            EmitEvent("RequestPage", { page: "CreateAccount" })
        );
    });
}
