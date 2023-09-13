import { CONFIG } from "../config.js";

export function DEBUG(...msg) {
    if (CONFIG.mode === "PROD") return;

    console.log("[DEBUG] ", ...msg);
}
