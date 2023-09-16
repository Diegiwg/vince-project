export function mount() {
    Page().querySelector("#Logout").onclick = () => {
        EmitEvent("Logout");
    };
}
