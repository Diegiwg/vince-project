import fs from "fs";
import { jsmin } from "jsmin";

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

        final_code += `${jsmin(content, 3)}\n`;
    });

    // save component-bundle.js
    fs.writeFileSync(
        "./public/component-bundle.js",
        `
import { ${Array.from(final_imports).join(
            ","
        )} } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";
${final_code}`
    );
}

function deleteOldBundle() {
    fs.unlinkSync("./public/component-bundle.js");
}

export function compileComponents() {
    deleteOldBundle();

    const components_files = searchComponents();

    const components_contents = [];
    components_files.forEach((component) => {
        const content = loadComponent(component);
        if (content) components_contents.push(content);
    });

    bundler(components_contents);
}
