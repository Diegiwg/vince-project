// Test for module Page
import Page from "./modules/Page.js";

async function main() {
    await Page.bundler();

    console.log(Page._memory.files.get("CreateAccount"));
}

main();
