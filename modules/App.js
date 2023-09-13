import fs from "fs";
import { jsmin } from "jsmin";

export function compileApp() {
    const content = fs.readFileSync("./app/app.js", "utf8");
    const compiled = jsmin(content, 3);
    fs.writeFileSync("./public/app.js", compiled);
}
