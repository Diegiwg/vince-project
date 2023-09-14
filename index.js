import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import { CONFIG } from "./config.js";
import { compileApp } from "./modules/App.js";
import { compileComponents } from "./modules/Component.js";
import { WARN } from "./modules/Debug.js";
import { compileEvents, loadEventHandler } from "./modules/Events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Compile Events Bundle
compileEvents();

// Load all events for Websocket
loadEventHandler(io);

// Compile app JS
compileApp();

// Compile Components Bundle
compileComponents();

app.get("/", (_, res) => {
    res.sendFile(__dirname + "/app/app.html");
});

app.use("/static", express.static("public"));

server.listen(CONFIG.port);

WARN(`Server is listening on http://localhost:${CONFIG.port}`);
