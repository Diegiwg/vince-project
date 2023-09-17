import fs from "fs";

import { DEBUG, INFO, SUCCESS } from "./Logger.js";

function searchComponents() {
    const components = fs.readdirSync("./components");
    return components || [];
}

function loadComponent(component) {
    let content = fs.readFileSync(`./components/${component}`, "utf-8");
    return content;
}

/** @param {string} content */
function parseLitImports(content) {
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

    // TODO: Rewrite this Module
    // INFO: Simple way for now to handle 'fake' imports
    final_code = final_code.replaceAll(
        /import {([\w,\s]+?)} from "\.\.\/modules\/Functions\.js";/gm,
        ""
    );

    // save component-bundle.js
    fs.writeFileSync(
        "./public/component-bundle.js",
        "import { " +
            final_imports +
            " } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';\n" +
            final_code
    );

    SUCCESS("Components bundled!");
}

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
