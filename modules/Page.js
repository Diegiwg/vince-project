import fs from "fs";

import { EmitServerEvent } from "./Events.js";
import { DEBUG, INFO, SUCCESS } from "./Logger.js";

// Adicionados comentários para dar suporte a outros desenvolvedores na compreensão do modulo.
// Modificado para dar suporte a sub-pastas
// Version: 3.1.0

/**
 * Função responsável por procurar em memoria se a pagina solicitada existe,
 * e devolver seu conteúdo (junto com a execução da função load equivalente, caso exista).
 * @param {import("./Functions.js").Pages} name
 * @returns {{html: String, page_data: Object|null}|null}
 */
async function _load(name) {
    // Procura no Set de nome de paginas, se a solicitada existe.
    if (!$DATA.pages.has(name)) return null;

    // Pega as informações previamente compiladas da memoria do servidor.
    const page = $DATA.files.get(name);

    // Caso exista a função de load para a pagina, a mesma é executada.
    const data = page.load ? await page.load() : null;

    // Retorna o conteúdo no modelo esperado.
    return {
        html: page.content,
        page_data: data,
    };
}

/**
 * Função responsável por procurar em disco o arquivo html correspondente
 * ao nome de pagina informado.
 * @param {String} name
 * @returns {String|null}
 */
function _html(name) {
    // Verifica se o arquivo existe.
    if (!fs.existsSync(`pages/${name}/${name}.html`)) return;

    // Devolve o conteúdo html carregado.
    return fs.readFileSync(`pages/${name}/${name}.html`, "utf-8");
}

/**
 * Função responsável por procurar em disco o arquivo css correspondente
 * ao nome de pagina informado.
 * @param {String} name
 * @param {String} html
 * @returns {String|null}
 */
function _css(name) {
    // Verifica se o arquivo existe.
    if (!fs.existsSync(`pages/${name}/${name}.css`)) return;

    // Devolve o conteúdo css carregado e modificado para ter a sintaxe aceita em html.
    const content = fs.readFileSync(`pages/${name}/${name}.css`, "utf-8");
    return content ? `\n\n<style>${content}</style>` : null;
}

/**
 * Função responsável por procurar em disco o arquivo js correspondente
 * ao nome de pagina informado. E caso exista, verificar a existência das
 * funções load e mount.
 * @param {String} name
 * @returns {{f_load: Function|null, f_mount: String|null}}
 */
async function _js(name) {
    // Verifica se o arquivo existe.
    if (!fs.existsSync(`pages/${name}/${name}.js`)) return;

    /** Importa o arquivo js como um modulo.
     * @type {{load: Function, mount: Function}} */
    const module = await import(`../pages/${name}/${name}.js`);

    // Verifica se existe a função load, e caso exista, a salva.
    let f_load = Object.keys(module).includes("load") ? module.load : null;

    // Verifica se existe a função mount, e caso exista, a transforma para a sintaxe aceita em html.
    let f_mount = !Object.keys(module).includes("mount")
        ? null
        : `<script type="module"> (
            ${module.mount
                .toString()
                .replace("export", "")
                .replace("async", "")
                .replace("mount()", "()")
                .trim()}
        )(); </script>`;

    return {
        f_load,
        f_mount,
    };
}

/**
 * Função responsável por procurar em disco os arquivos html, css e js correspondentes
 * ao nome de pagina informado.
 * @param {String} name
 * @returns {{html: String, css: String|null, js: {f_load: Function|null, f_mount: String|null}}|null}
 */
async function _parseFolder(name) {
    // Procura os arquivos html, css e js
    const files = fs.readdirSync(`pages/${name}`);
    if (!files) return;

    DEBUG("Parsing folder " + name);

    // Interpreta cada um dos arquivos, se eles existirem.
    const l_files = {
        html: files.includes(`${name}.html`) ? _html(name) : null,
        css: files.includes(`${name}.css`) ? _css(name) : null,
        js: files.includes(`${name}.js`) ? await _js(name) : null,
    };

    // Devolve como pagina existente apenas se o arquivo html existir.
    return l_files.html ? l_files : null;
}

/** Parte da memoria do servidor, na qual ficará compiladas as paginas disponíveis quando o mesmo foi iniciado.
 * @type {{pages: Set<String>, files: Map<String, {content: String, load: Function|null}>}} */
const $DATA = {
    pages: new Set(),
    files: new Map(),
};

/**
 * Função responsável por compilar as paginas, e salvar em memoria.
 */
export async function PagesBundler() {
    if (!fs.existsSync("pages")) return;

    INFO("Bundling pages...");

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
 * Função responsável por renderizar uma pagina solicitada.
 * @param {import("socket.io").Socket} client
 * @param {import("./Functions.js").Pages} name
 * @param {Object} data
 */
export async function RenderPage(client, name, data) {
    // Procura no Set de nome de paginas, se a solicitada existe.
    const loaded = await _load(name);
    if (!loaded) return;

    // Emita o evento para o cliente renderizar a página.
    EmitServerEvent(client, "RenderPage", {
        ...data,

        page: name,
        page_data: loaded.page_data,
        content: loaded.html,
    });
}
