import fs from "fs";
import { jsmin } from "jsmin";
import mustache from "mustache";

async function loadPageData(name) {
    if (!fs.existsSync(`pages/${name}.js`)) return;

    const module = await import(`../pages/${name}.js`);

    if (!Object.keys(module).includes("load")) return;

    return module.load();
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
        const page_data = await loadPageData(name);

        html = mustache.render(html, {
            ...page_data,
            ...data,
        });

        html = minifyJavascript(html);

        return { html, page_data };
    } catch {
        return;
    }
}

export async function emitRenderPageEvent(client, name, data) {
    const { html, page_data } = await loadPage(name, data);

    client.emit("Event::RenderPage", {
        page: name,
        page_data,
        content: html,

        ...data,
    });
}
