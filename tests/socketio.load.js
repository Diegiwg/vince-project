import { io } from "socket.io-client";

const URL = process.env.URL || "http://localhost:7001";
const MAX_CLIENTS = 1500;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 10;
const EMIT_INTERVAL_IN_MS = 1000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsReceivedSinceLastReport = 0;
let packetsEmittedSinceLastReport = 0;
let disconnectCount = 0;
let pollingCount = 0;
let websocketCount = 0;

const createClient = () => {
    const transports =
        Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["websocket"];

    if (transports.includes("polling")) {
        pollingCount++;
    } else {
        websocketCount++;
    }

    const socket = io(URL, {
        transports,
    });

    setInterval(() => {
        socket.emit("request", {
            target: "RequestPage",
            page: "Login",
        });
        packetsEmittedSinceLastReport++;
    }, EMIT_INTERVAL_IN_MS);

    socket.on("response", () => {
        packetsReceivedSinceLastReport++;
    });

    socket.on("disconnect", (reason) => {
        console.log(`Client disconnected due to ${reason}`);
        disconnectCount++;
        if (disconnectCount === MAX_CLIENTS) {
            printFinalReport();
        }
    });

    if (++clientCount < MAX_CLIENTS) {
        setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
    }
};

createClient();

const printReport = () => {
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;
    const packetsReceivedPerSecond = (
        packetsReceivedSinceLastReport / durationSinceLastReport
    ).toFixed(2);
    const packetsEmittedPerSecond = (
        packetsEmittedSinceLastReport / durationSinceLastReport
    ).toFixed(2);

    console.log(
        `Client count: ${clientCount} | Average packets received per second: ${packetsReceivedPerSecond} | Average packets emitted per second: ${packetsEmittedPerSecond} | Polling: ${pollingCount} | WebSocket: ${websocketCount}`
    );

    packetsReceivedSinceLastReport = 0;
    packetsEmittedSinceLastReport = 0;
    lastReport = now;
};

const printFinalReport = () => {
    console.log("All clients disconnected.");
    printReport();
};

setInterval(printReport, 1000);
