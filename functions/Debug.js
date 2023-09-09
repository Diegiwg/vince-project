import { CONFIG } from "../config.js";

/** @param {string} msg */
export function DEBUG(msg) {
    if (CONFIG.mode === "PROD") return;

    console.log("[DEBUG] ", msg);
}
