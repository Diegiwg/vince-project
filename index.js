import express from "express";
import fs from "fs";
import { createServer } from "http";
import { jsmin } from "jsmin";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import { CONFIG } from "./config.js";
import { loadEventHandler } from "./functions/Events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const io = new Server(server);
loadEventHandler(io);

app.get("/", (_, res) => {
    const app_html = fs.readFileSync(
        path.join(__dirname, "app/app.html"),
        "utf8"
    );
    const app_js = fs.readFileSync(path.join(__dirname, "app/app.js"), "utf8");

    const minified = jsmin(app_js, 3);
    const html = app_html.replace("<!script>", `<script>${minified}</script>`);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
});

server.listen(CONFIG.port, () => {
    console.log(`Server is listening on http://localhost:${CONFIG.port}`);
});
