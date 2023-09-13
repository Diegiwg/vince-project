import fs from "fs";
import { jsmin } from "jsmin";

import { CONFIG } from "../config.js";
import { INFO, SUCCESS } from "./Debug.js";

export function compileApp() {
    INFO("Compiling App.js...");

    const content = fs.readFileSync("./app/app.js", "utf8");
    const compiled = jsmin(
        `window.DEBUG_MODE = ${CONFIG.mode === "DEV"};\n\n` + content,
        3
    );
    fs.writeFileSync("./public/app.js", compiled);

    SUCCESS("App.js bundled!");
}
