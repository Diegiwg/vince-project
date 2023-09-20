import { io } from "socket.io-client";

const URL = process.env.URL || "http://localhost:7001";
const MAX_CLIENTS = 4_000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
    const transports =
        Math.random() < POLLING_PERCENTAGE
            ? ["polling"]
            : ["polling", "websocket"];

    const socket = io(URL, {
        transports,
    });

    setInterval(() => {
        socket.emit("request", {
            target: "RequestPage",
            page: "Login",
        });
    }, EMIT_INTERVAL_IN_MS);

    socket.on("response", () => {
        packetsSinceLastReport++;
    });

    socket.on("disconnect", (reason) => {
        console.log(`disconnect due to ${reason}`);
        process.exit(1);
    });

    if (++clientCount < MAX_CLIENTS) {
        setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
    }
};

createClient();

const printReport = () => {
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;
    const packetsPerSeconds = (
        packetsSinceLastReport / durationSinceLastReport
    ).toFixed(2);

    console.log(
        `client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`
    );

    packetsSinceLastReport = 0;
    lastReport = now;
};

setInterval(printReport, 1000);
