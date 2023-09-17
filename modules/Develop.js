import fs from "fs";

function _updateFunctionsFile(new_data, target) {
    if (!target) return;

    let content = fs.readFileSync("./modules/Functions.js", "utf-8");

    content = content.replace(target, new_data);

    fs.writeFileSync("./modules/Functions.js", content);
}

function _pages() {
    if (!fs.existsSync("./pages")) return;

    const files = fs.readdirSync("./pages");
    if (!files) return;

    const l_pages = [];
    for (const file of files) {
        if (!file.endsWith(".html")) continue;
        l_pages.push(file.replace(".html", ""));
    }

    _updateFunctionsFile(
        `/** @typedef {${l_pages.map((p) => `"${p}"`).join("|")}} Pages */`,
        /\/\*\* @typedef {([\w|"']+?)} Pages \*\//gm
    );
}

function devtools() {
    _pages();
}

devtools();
