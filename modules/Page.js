import fs from "fs";

import { EmitServerEvent } from "./Events.js";
import { DEBUG, INFO, SUCCESS } from "./Logger.js";

// Modificado para dar suporte a sub-pastas
// Version: 3.0.0

/** @param {import("./Functions.js").Pages} name */
async function _load(name) {
    if (!$DATA.pages.has(name)) return;

    const page = $DATA.files.get(name);

    let data = {};
    if (page.load) {
        data = await page.load();
    }

    return {
        html: page.content,
        page_data: data,
    };
}

/** @param {String} name */
function _html(name) {
    const content = fs.readFileSync(`pages/${name}/${name}.html`, "utf-8");
    return content;
}

/**
 * @param {String} name
 * @param {String} html
 */
function _css(name) {
    const content = fs.readFileSync(`pages/${name}/${name}.css`, "utf-8");
    return content ? `\n\n <style>${content}</style>` : null;
}

/** @param {String} name */
async function _js(name) {
    /** @type {{load: Function, mount: Function}} */
    const module = await import(`../pages/${name}/${name}.js`);

    let f_load = null;
    if (Object.keys(module).includes("load")) {
        f_load = module.load;
    }

    let f_mount = null;
    if (Object.keys(module).includes("mount")) {
        let temp = module.mount
            .toString()
            .replace("export", "")
            .replace("async", "")
            .replace("mount()", "()")
            .trim();

        f_mount = `<script type="module"> (
            ${temp}
        )(); </script>`;
    }

    return {
        f_load,
        f_mount,
    };
}

/**
 * @param {String} folder_name
 * @returns {{html: String, css: String|null, js: {f_load: Function|null, f_mount: String|null}}|null}
 */
async function _parseFolder(folder_name) {
    DEBUG("Parsing folder: " + folder_name);

    const files = fs.readdirSync(`pages/${folder_name}`);
    if (!files) return;

    const l_files = {
        html: null,
        css: null,
        js: null,
    };

    for (const file of files) {
        if (file.endsWith(".html")) l_files.html = _html(folder_name);
        if (file.endsWith(".css")) l_files.css = _css(folder_name);
        if (file.endsWith(".js")) l_files.js = await _js(folder_name);
    }

    return l_files.html ? l_files : null;
}

/** @type {{pages: Set<String>, files: Map<String, {content: String, load: Function|null}>}} */
const $DATA = {
    pages: new Set(),
    files: new Map(),
};

export async function PagesBundler() {
    INFO("Bundling pages...");

    if (!fs.existsSync("pages")) return;

    const folders = fs.readdirSync("pages");
    if (!folders) return;

    // Analisar cada sub-pasta, buscando os arquivos html, css e js e injetando o resultado em $DATA
    for (const folder of folders) {
        const l_files = await _parseFolder(folder);
        if (!l_files) continue;

        if (l_files.css) l_files.html += l_files.css;
        if (l_files?.js?.f_mount) l_files.html += l_files.js.f_mount;

        $DATA.pages.add(folder);
        $DATA.files.set(folder, {
            content: l_files.html,
            load: l_files.js?.f_load,
        });
    }

    SUCCESS("Pages bundled!");
}

/**
 *
 * @param {import("socket.io").Socket} client
 * @param {import("./Functions.js").Pages} name
 * @param {Object} data
 * @returns
 */
export async function RenderPage(client, name, data) {
    const loaded = await _load(name);
    if (!loaded) return;

    EmitServerEvent(client, "RenderPage", {
        ...data,

        page: name,
        page_data: loaded.page_data,
        content: loaded.html,
    });
}
