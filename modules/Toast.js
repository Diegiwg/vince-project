/**
 * @param {import('socket.io').Socket} client
 * @param {import('./Models.js').Toast} data
 */
function _sendToast(client, data) {
    client.emit("Event::Toast", data);
}

/**
 * @param {import('socket.io').Socket} client
 * @param {number} time
 * @param {String[]} msg
 */
function INFO(client, time = null, ...msg) {
    _sendToast(client, {
        type: "INFO",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client
 * @param {number} time
 * @param {String[]} msg
 */
function ERROR(client, time = null, ...msg) {
    _sendToast(client, {
        type: "ERROR",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client
 * @param {number} time
 * @param {String[]} msg
 */
function WARN(client, time = null, ...msg) {
    _sendToast(client, {
        type: "WARN",
        message: msg.join(" "),
        time,
    });
}

/**
 * @param {import('socket.io').Socket} client
 * @param {number} time
 * @param {String[]} msg
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
