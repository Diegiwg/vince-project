// Versão 1.0.5
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { CONFIG } from "../config.js";

const COLORS = {
    RESET: "\u001B[0m",

    PURPLE: "\u001B[35m",
    CYAN: "\u001B[36m",
    RED: "\u001B[31m",
    YELLOW: "\u001B[33m",
    BLUE: "\u001B[34m",
};

/**
 * Função responsável por formatar mensagens.
 * @param {string} value Mensagem a ser formatada.
 * @param {typeof COLORS} color Cor da mensagem.
 * @returns {string} Mensagem formatada.
 */
function text(value, color) {
    return `${COLORS[color]}[${value}]${COLORS.RESET}`;
}

/**
 * Mostrar mensagem da categoria DEBUG.
 * @param {...any} msgs Mensagens a serem mostradas.
 */
export function DEBUG(...msgs) {
    if (CONFIG.mode === "PROD") return;

    console.log(text("DEBUG", "PURPLE"), ...msgs);
}

/**
 * Mostrar mensagem da categoria INFO.
 * @param {...any} msgs Mensagens a serem mostradas.
 */
export function INFO(...msgs) {
    console.log(text("INFO", "CYAN"), ...msgs);
}

/**
 * Mostrar mensagem da categoria ERROR.
 * @param {...any} msgs Mensagens a serem mostradas.
 */
export function ERROR(...msgs) {
    console.log(text("ERROR", "RED"), ...msgs);
    process.exit(1);
}

/**
 * Mostrar mensagem da categoria WARN.
 * @param {...any} msgs Mensagens a serem mostradas.
 */
export function WARN(...msgs) {
    console.log(text("WARN", "YELLOW"), ...msgs);
}

/**
 * Mostrar mensagem da categoria SUCCESS.
 * @param {...any} msgs Mensagens a serem mostradas.
 */
export function SUCCESS(...msgs) {
    console.log(text("SUCCESS", "BLUE"), ...msgs);
}
