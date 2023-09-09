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

export async function loadPage(name, data) {
    try {
        let html = fs.readFileSync(`pages/${name}.html`, "utf8");
        const content = await evalPageData(name);

        html = renderComponents(html, content); // Really need pass to Component a custom data?

        return mustache.render(html, { ...content, ...data });
    } catch {
        return;
    }
}
