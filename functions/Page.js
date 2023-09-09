import fs from "fs";
import mustache from "mustache";

import { renderComponents } from "./Component.js";
import { DEBUG } from "./Debug.js";

async function evalPageData(name) {
    try {
        const javascript = fs.readFileSync(`pages/${name}.js`, "utf8");
        const content = eval(javascript + "load()");
        return content;
    } catch {
        return {};
    }
}

export async function loadPage(name, data) {
    try {
        let html = fs.readFileSync(`pages/${name}.html`, "utf8");
        const content = await evalPageData(name);

        const local_content = {
            page: { ...content, ...data },
            page_raw: JSON.stringify({ ...content, ...data }),
        };
        DEBUG(`PAGE[${name}]`, local_content);

        html = renderComponents(html, local_content); // Really need pass to Component a custom data?
        return mustache.render(html, local_content);
    } catch {
        return;
    }
}
