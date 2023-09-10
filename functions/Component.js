import fs from "fs";
import mustache from "mustache";

import { DEBUG } from "./Debug.js";

/** @param {string} name */
function loadComponent(name) {
    try {
        const html = fs.readFileSync(`components/${name}.html`, "utf8");
        return html;
    } catch {
        return;
    }
}

/** @param {string} html */
function findComponents(html, page_content) {
    const components = html.match(/<{1}!{1}(.)*>{1}/gim);
    if (!components) {
        return;
    }

    let loaded_components = {};
    for (let component of components) {
        const name = component.replace("<!", "").split(/[>|\s]/)[0];
        let content = loadComponent(name);
        if (!content) continue;

        // Try to find props
        const props = component.match(/(\w+)={([^}|{]+)}/gim);
        if (!props) {
            loaded_components[component] = content.trim();
            continue;
        }

        for (let prop of props) {
            const prop_name = `[[${prop.split("=")[0]}]]`;
            content = content.replaceAll(
                prop_name,
                eval(prop.split("={")[1].split("}")[0])
            );
        }

        let content_html = mustache.render(content, page_content);
        loaded_components[component] = content_html.trim();
    }

    DEBUG("LoadedComponents", Object.keys(loaded_components));
    return loaded_components;
}

/** @param {string} html */
export function renderComponents(html, page_content) {
    const components = findComponents(html, page_content);
    if (!components) {
        return html;
    }

    for (let component in components) {
        html = html.replace(component, components[component]);
    }

    return renderComponents(html, page_content);
}
