async function load() {
    return {
        page: "Test",
        other: await (
            await fetch("https://jsonplaceholder.typicode.com/todos/")
        ).json(),
    };
}
