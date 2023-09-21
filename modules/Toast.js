// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

import { EmitServerEvent } from "./Events.js";

/**
 * @param {import('socket.io').Socket} client Objeto que representa a conexão do cliente.
 * @param {import('./Models.js').Toast} data Dados a serem enviados.
 */
function _sendToast(client, data) {
    EmitServerEvent(client, "Toast", data);
}

/**
 * @param {import('socket.io').Socket} client Objeto que representa a conexão do cliente.
 * @param {number} time Tempo de exibição do Toast.
 * @param {string[]} msg Mensagem a ser exibida.
 */
function INFO(client, time = null, ...msg) {
    _sendToast(client, {
        type: "INFO",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client Objeto que representa a conexão do cliente.
 * @param {number} time Tempo de exibição do Toast.
 * @param {string[]} msg Mensagem a ser exibida.
 */
function ERROR(client, time = null, ...msg) {
    _sendToast(client, {
        type: "ERROR",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client Objeto que representa a conexão do cliente.
 * @param {number} time Tempo de exibição do Toast.
 * @param {string[]} msg Mensagem a ser exibida.
 */
function WARN(client, time = null, ...msg) {
    _sendToast(client, {
        type: "WARN",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client Objeto que representa a conexão do cliente.
 * @param {number} time Tempo de exibição do Toast.
 * @param {string[]} msg Mensagem a ser exibida.
 */
function SUCCESS(client, time = null, ...msg) {
    _sendToast(client, {
        type: "SUCCESS",
        message: msg.join(" "),
        time,
    });
}

export const TOAST = {
    INFO,
    ERROR,
    WARN,
    SUCCESS,
};
