// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)
// TODO: Reescrever esse módulo para adicionar a capacidade de carregar componentes que estejam dentro de sub-pastas. Ex: /components/buttons/cool.js

import fs from "fs";
import path from "path";

import { DEBUG, INFO, SUCCESS } from "./Logger.js";

/**
 * Função responsável por procurar os componentes.
 * @returns {string[]} Array com os nomes dos arquivos.
 */
function searchComponents() {
    const components = new Set();

    /**
     * @param {string} directory Diretório a procurar.
     */
    function searchRecursively(directory) {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
            const filePath = path.join(directory, file);
            const isDirectory = fs.statSync(filePath).isDirectory();

            if (isDirectory) {
                searchRecursively(filePath);
            } else {
                components.add(path.relative("components", filePath));
            }
        });
    }

    searchRecursively("components");

    return Array.from(components);
}

/**
 * Função responsável por carregar o conteúdo de um componente.
 * @param {string} fileName Nome do arquivo.
 * @returns {string} Conteúdo do arquivo.
 */
function loadComponent(fileName) {
    let content = fs.readFileSync(`./components/${fileName}`, "utf-8");
    return content;
}

/**
 * Função responsável por analisar/arrumar os imports de um componente.
 * @param {string} content Conteúdo do componente.
 * @returns {{content: string, imports: Set<string>}} Objeto com o conteúdo e os imports arrumados.
 */
function parseLitImports(content) {
    // eslint-disable-next-line no-useless-escape
    const data = content.match(/import {([\w\s,]+)} from "lit[\w\/.]*";/gim);
    const imports = new Set();

    for (let element of data) {
        const el = element.match(/import {([\w\s,]+)}/);

        el[1].split(",").forEach((imp) => {
            imports.add(imp.trim());
        });

        content = content.replace(element, "").trim();
    }

    return { content, imports };
}

/**
 * Função responsável por gerar o arquivo component-bundle.js
 * @param {string[]} components Array com os nomes dos arquivos.
 */
function bundler(components) {
    let final_imports = new Set();
    let final_code = "";

    components.forEach((component) => {
        const { content, imports } = parseLitImports(component);

        imports.forEach((element) => {
            final_imports.add(element.trim());
        });

        final_code += `\n${content.trim()}\n`;
    });

    final_imports = Array.from(final_imports).join(", ");

    final_code = final_code.replaceAll(
        /import {([\w,\s]+?)} from "([\w.-/\\]+?)Functions.js";/gm,
        ""
    );

    fs.writeFileSync(
        "./public/component-bundle.js",
        "import { " +
            final_imports +
            " } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';\n" +
            final_code
    );

    SUCCESS("Components bundled!");
}

/**
 * Função responsável por compilar os componentes.
 */
export function compileComponents() {
    INFO("Compiling components...");

    if (fs.existsSync("./public/component-bundle.js"))
        fs.unlinkSync("./public/component-bundle.js");

    const components_files = searchComponents();

    const components_contents = [];
    components_files.forEach((component) => {
        const content = loadComponent(component);
        if (!content) return;

        components_contents.push(content);
        DEBUG(`Compiling ${component} component...`);
    });

    bundler(components_contents);
}
