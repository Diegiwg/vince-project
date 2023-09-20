import fs from "fs";

import { INFO, SUCCESS } from "./Logger.js";

function _updateFunctionsFile(new_data, target) {
    if (!target) return;

    let content = fs.readFileSync("./modules/Functions.js", "utf-8");

    content = content.replace(target, new_data);

    fs.writeFileSync("./modules/Functions.js", content);
}

async function _pages() {
    if (!fs.existsSync("pages")) return;

    const l_pages = fs.readdirSync("pages");
    if (!l_pages) return;

    _updateFunctionsFile(
        `/** @typedef {${l_pages.map((p) => `"${p}"`).join("|")}} Pages */`,
        /\/\*\* @typedef {([\w|"']*?)} Pages \*\//gm
    );
}

async function _events() {
    if (!fs.existsSync("events")) return;

    const files = fs.readdirSync("events");
    if (!files) return;

    const l_events = [];
    for (const file of files) {
        if (!file.endsWith(".js")) continue;

        const l_module = await import(`../events/${file}`);
        l_events.push(...Object.keys(l_module));
    }

    _updateFunctionsFile(
        `/** @typedef {${l_events.map((p) => `"${p}"`).join("|")}} Events */`,
        /\/\*\* @typedef {([\w|"']*?)} Events \*\//gm
    );
}

(async function () {
    INFO("Updating Development information!...");

    await _pages();
    await _events();

    SUCCESS("Updated Development Information!...");
})();
