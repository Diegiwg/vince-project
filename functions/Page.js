import fs from "fs";
import { jsmin } from "jsmin";
import mustache from "mustache";

import { renderComponents } from "./Component.js";

async function evalPageData(name) {
    try {
        const javascript = fs.readFileSync(`pages/${name}.js`, "utf8");
        const content = eval(javascript + "load()");
        return content;
    } catch {
        return {};
    }
}

/** @param {string} html  */
function minifyJavascript(html) {
    const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gim);

    if (!scripts) return html;

    for (let script of scripts) {
        const minified = jsmin(script, 3);
        html = html.replace(script, minified);
    }

    return html;
}

export async function loadPage(name, data) {
    try {
        let html = fs.readFileSync(`pages/${name}.html`, "utf8");
        const content = await evalPageData(name);

        const page = {
            ...content,
            ...data,
        };

        html = renderComponents(html, page); // Really need pass to Component a custom data?
        html = mustache.render(html, page);
        html = minifyJavascript(html);

        return html;
    } catch {
        return;
    }
}

export async function emitRenderPageEvent(client, name, data) {
    client.emit("Event::RenderPage", {
        page: name,
        content: await loadPage(name),

        ...data,
    });
}
