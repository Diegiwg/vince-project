import fs from "fs";

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

/** @param {String} name */
async function _load(name) {
    if (!$DATA.pages.has(name)) return; // Retornar erro de pagina não existe

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

/** @type {{pages: Set<String>, files: Map<String, {content: String, load: Function}>}} */
const $DATA = {
    pages: new Set(),
    files: new Map(),
};

export async function PageBundler() {
    if (!fs.existsSync("pages")) return;

    const files = fs.readdirSync("pages");
    if (!files) return;

    const filtered_files = _filterFiles(files);
    if (filtered_files.size === 0) return;

    for (const [name, data] of filtered_files) {
        let html = _html(name);

        let css = "";
        if (data.css) {
            css = _css(name);
        }

        let js = "";
        let f_load = null;
        if (data.js) {
            const temp = await _js(name);
            f_load = temp.f_load;
            js = temp.f_mount;
        }

        html = html + css + js;

        $DATA.pages.add(name);
        $DATA.files.set(name, { content: html, load: f_load });
    }
}

/**
 *
 * @param {import("socket.io").Socket} client
 * @param {import("./Functions.js").Pages} name
 * @param {Object} data
 * @returns
 */
export async function emitRenderPageEvent(client, name, data) {
    const loaded = await _load(name);
    if (!loaded) return;

    client.emit("Event::RenderPage", {
        page: name,
        page_data: loaded.page_data,
        content: loaded.html,

        ...data,
    });
}
