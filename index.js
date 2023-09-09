import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { loadEventHandler } from "./functions/Events.js";

// Get a Random Port
const PORT = 9999;

const app = express();
const server = createServer(app);

const io = new Server(server);
loadEventHandler(io);

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "app.html"));
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
