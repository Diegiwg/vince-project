import fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "url";

import { DEBUG, INFO, SUCCESS } from "./Debug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @param {Object<string, string[]>} imports */
function compileImports(imports) {
    const content = [];

    Object.keys(imports).forEach((name) => {
        content.push(
            "import { " +
                Array.from(imports[name]).join(", ") +
                ` } from "${name}";`
        );
    });

    return content.join("\n") + "\n\n";
}

export async function compileEvents() {
    INFO("Compiling events handlers...");

    const events = fs.readdirSync(path.join(__dirname, "../events"));
    if (!events) return;

    let imports = {
        new: (name) => {
            if (imports[name]) return;

            imports[name] = new Set();
        },
    };

    let contents = "";
    for (let event_file of events) {
        if (event_file.indexOf("bundle") !== -1) continue;

        DEBUG(`Compiling ${event_file} component...`);

        const event_handler_content = fs.readFileSync(
            path.join(__dirname, `../events/${event_file}`),
            "utf-8"
        );

        const event_imports = event_handler_content.matchAll(
            /import {([\w\W]+?)} from "([\W\w]+?)";/gim
        );

        if (!event_imports) {
            contents += event_handler_content + "\n\n";
            continue;
        }

        let temp_content = event_handler_content;
        for (const match of event_imports) {
            imports.new(match[2]);

            match[1]
                .trim()
                .split(",")
                .forEach((el) => {
                    const local = el.trim();
                    if (local === "") return;

                    imports[match[2]].add(local);
                });

            temp_content = temp_content.replaceAll(match[0], "");
        }

        contents += temp_content;
    }

    delete imports["new"];
    const compiled_imports = compileImports(imports);

    fs.writeFileSync(
        path.join(__dirname, "../events/events-bundle.js"),
        compiled_imports + contents.trim()
    );

    SUCCESS("Events bundled!");
}

/** @param {import("../modules/Models.js").io} io  */
async function registerEvents(io) {
    const module = await import(`../events/events-bundle.js`);

    for (let internal_event of Object.keys(module)) {
        module[internal_event](io);
    }
}

/** @param {Server} server  */
export function loadEventHandler(server) {
    server.on(
        "connection",
        /** @param {Socket} client */
        (client) => {
            registerEvents({ server, client });
        }
    );
}
