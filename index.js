import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import { CONFIG } from "./config.js";
import { compileComponents } from "./modules/Component.js";
import { EventsBundler, HandlerEvents } from "./modules/Events.js";
import { WARN } from "./modules/Logger.js";
import { PagesBundler } from "./modules/Page.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

(async function () {
    // Compile Devtools Infos
    await import("./modules/Develop.js");

    // Compile Pages Bundle
    await PagesBundler();

    // Compile Events Bundle
    await EventsBundler();

    // TODO: Rewrite this Module
    compileComponents();

    // Initialize the Event's Manager
    await HandlerEvents(io);

    // Final Log
    WARN(`Server is listening on http://localhost:${CONFIG.port}`);
})();

app.get("/", (_, res) => {
    res.sendFile(__dirname + "/public/app.html");
});

app.use("/static", express.static("public"));

server.listen(CONFIG.port);
