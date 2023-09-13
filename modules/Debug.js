import { CONFIG } from "../config.js";

const COLORS = {
    RESET: "\u001B[0m",

    PURPLE: "\u001B[35m",
    CYAN: "\u001B[36m",
    RED: "\u001B[31m",
    YELLOW: "\u001B[33m",
    BLUE: "\u001B[34m",
};

/** @param {typeof COLORS} color  */
function text(value, color) {
    return `${COLORS[color]}[${value}]${COLORS.RESET}`;
}

export function DEBUG(...msg) {
    if (CONFIG.mode === "PROD") return;

    console.log(text("DEBUG", "PURPLE"), ...msg);
}

export function INFO(...msg) {
    console.log(text("INFO", "CYAN"), ...msg);
}

export function ERROR(...msg) {
    console.log(text("ERROR", "RED"), ...msg);
    process.exit(1);
}

export function WARN(...msg) {
    console.log(text("WARN", "YELLOW"), ...msg);
}

export function SUCCESS(...msg) {
    console.log(text("SUCCESS", "BLUE"), ...msg);
}
