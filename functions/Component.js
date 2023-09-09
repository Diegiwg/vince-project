import fs from "fs";
import mustache from "mustache";

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
function findComponents(html) {
    const components = html.match(/<{1}!{1}(.)*>{1}/gim);
    if (!components) {
        return;
    }

    let loaded_components = {};
    let content_props = {};

    for (let component of components) {
        const name = component.replace("<!", "").split(/[>|\s]/)[0];
        const content = loadComponent(name);

        if (!content) continue;

        // Try to find props
        const props = component.match(/(\w+)={([^}|{]+)}/gim);
        if (!props) {
            loaded_components[component] = content.trim();
            continue;
        }

        for (let prop of props) {
            content_props[prop.split("=")[0]] = eval(
                prop.split("={")[1].split("}")[0]
            );
        }

        const content_html = mustache.render(content, content_props);
        loaded_components[component] = content_html.trim();
    }

    return loaded_components;
}

/** @param {string} html */
export function renderComponents(html) {
    const components = findComponents(html);
    if (!components) {
        return html;
    }

    for (let component in components) {
        html = html.replace(component, components[component]);
    }

    return html;
}
