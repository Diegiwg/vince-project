import fs from "fs";
import mustache from "mustache";

import { renderComponents } from "./Component.js";

async function evalPageData(name) {
    try {
        const javascript = fs.readFileSync(`pages/${name}.js`, "utf8");
        return eval(javascript + "await load()");
    } catch {
        return {};
    }
}

export async function loadPage(name) {
    try {
        let html = fs.readFileSync(`pages/${name}.html`, "utf8");
        const content = await evalPageData(name);
        html = renderComponents(html, content);
        return mustache.render(html, content);
    } catch {
        return;
    }
}
