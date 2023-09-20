import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import { CONFIG } from "./config.js";
import { compileComponents } from "./modules/Component.js";
import { EventsBundler, HandlerEvents } from "./modules/Events.js";
import { SUCCESS, WARN } from "./modules/Logger.js";
import { PagesBundler } from "./modules/Page.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação express
const app = express();

// Criar servidor http
const server = createServer(app);

// Criar servidor socket.io
const io = new Server(server);

// Executar as funções de configuração da inicialização do servidor.
(async function () {
    // Executar a Compilação das funções auxiliares ao desenvolvimento.
    if (CONFIG.mode === "PROD") await import("./modules/Develop.js");

    // Executar a Compilação das Paginas e salvar em memoria.
    await PagesBundler();

    // Executar a Compilação das Eventos e salvar em memoria.
    await EventsBundler();

    // TODO: Reescrever esse modulo.
    // Executar a Compilação e Disponibilização dos componentes na pasta public, sob o nome components-bundle.js
    compileComponents();

    // Inicializar o Gerenciador de Eventos.
    await HandlerEvents(io);

    // Mostrar o Link de Acesso rápido para desenvolvimento.
    if (CONFIG.mode === "DEV")
        WARN(`Server is listening on http://localhost:${CONFIG.port}`);

    // Mostrar mensagem de sucesso sobre o servidor está online.
    if (CONFIG.mode === "PROD") SUCCESS("Server is Online!");
})();

// Criar rota (única) do servidor.
app.get("/", (_, res) => {
    res.sendFile(__dirname + "/public/app.html");
});

// Configurar arquivos estáticos.
app.use("/static", express.static("public"));

// Iniciar servidor.
server.listen(CONFIG.port);
