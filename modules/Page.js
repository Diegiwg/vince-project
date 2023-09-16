import fs from "fs";
import { jsmin } from "jsmin";
import mustache from "mustache";

async function loadPageData(name) {
    if (!fs.existsSync(`pages/${name}.js`)) return;

    const module = await import(`../pages/${name}.js`);

    if (!Object.keys(module).includes("load")) return;

    return module.load();
}

/** @param {String} html  */
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
    if (!fs.existsSync(`pages/${name}.html`)) return;

    let html = fs.readFileSync(`pages/${name}.html`, "utf8");
    const page_data = await loadPageData(name);

    html = mustache.render(html, {
        ...page_data,
        ...data,
    });

    html = minifyJavascript(html);

    return { html, page_data };
}

export async function emitRenderPageEvent(client, name, data) {
    const loaded = await loadPage(name, data);
    if (!loaded) return;

    client.emit("Event::RenderPage", {
        page: name,
        page_data: loaded.page_data,
        content: loaded.html,

        ...data,
    });
}

// Version: 2.0.0

/** @param {String} file */
function _extractName(file) {
    return file.split(".").shift();
}

/**
 * @param {String[]} files
 * @returns {Map<String, {css: boolean, js: boolean}>}
 */
function _filterFiles(files) {
    const html = new Set();
    const css = new Set();
    const js = new Set();

    files.forEach((file) => {
        switch (file.split(".").pop()) {
            case "html":
                html.add(file);
                break;

            case "css":
                css.add(file);
                break;

            case "js":
                js.add(file);
                break;

            default:
                break;
        }
    });

    // Construct the response
    const response = new Map();

    for (let page of html) {
        const name = _extractName(page);

        response.set(name, {
            css: css.has(`${name}.css`),
            js: js.has(`${name}.js`),
        });
    }

    return response;
}

/** @param {String} file_name */
function _html(file_name) {
    const content = fs.readFileSync(`pages/${file_name}.html`, "utf-8");
    return content;
}

/**
 * @param {String} file_name
 * @param {String} html
 */
function _css(file_name) {
    const content = fs.readFileSync(`pages/${file_name}.css`, "utf-8");
    return `\n\n <style>${content}</style>`;
}

/** @param {String} file_name */
async function _js(file_name) {
    /** @type {{load: Function, mount: Function}} */
    const module = await import(`../pages/${file_name}.js`);

    let f_load = null;
    if (Object.keys(module).includes("load")) {
        f_load = module.load;
    }

    let f_mount = null;
    if (Object.keys(module).includes("mount")) {
        let temp = module.mount
            .toString()
            .replace("mount()", "()")
            .replace("export", "")
            .replace("async", "")
            .trim();
        f_mount = `(
            ${temp}
        )();`;
    }

    return {
        f_load,
        f_mount,
    };
}

/** @type {{pages: Set<String>, files: Map<String, {content: String, load: Function}>}} */
const $DATA = {
    pages: new Set(),
    files: new Map(),
};

async function bundler() {
    if (!fs.existsSync("pages")) return;

    const files = fs.readdirSync("pages");
    if (!files) return;

    const filtered_files = _filterFiles(files);
    if (filtered_files.size === 0) return;

    for (const [name, data] of filtered_files) {
        let html = _html(name);

        if (data.css) {
            const temp = _css(name);
            html += temp;
        }

        if (data.js) {
            console.log("a", name);
            const temp = await _js(name);
            console.log(temp.f_mount);
        }
    }
}

/** @param {String} name */
function load(name) {
    if (!$DATA.pages.has(name)) return; // Retornar erro de pagina não existe
}

export default {
    bundler,
    load,
    _memory: $DATA,
};
