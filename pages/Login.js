import { $User } from "../modules/Prisma.js";

export async function load() {
    return {
        users: (await $User.findAll())?.map((user) => ({
            name: user.name,
            email: user.email,
        })),
    };
}

export async function mount() {
    /** @param {PointerEvent | SubmitEvent} event */
    const _submitHandler = (event) => {
        if (event.type === "submit") event.preventDefault();

        const email = Page().querySelector("[name=email]");
        const password = Page().querySelector("[name=password]");

        if (!email.value || !password.value) return;

        EmitEvent("Login", {
            email: email.value,
            password: password.value,
        });
    };

    setTimeout(() => {
        Page()
            .querySelector("#LoginForm")
            .addEventListener("submit", _submitHandler);

        Page()
            .querySelector("#Submit")
            .addEventListener("click", _submitHandler);

        Page()
            .querySelector("#CreateAccountPage")
            .addEventListener("click", (event) =>
                EmitEvent("RequestPage", { page: "CreateAccount" })
            );
    });
}
