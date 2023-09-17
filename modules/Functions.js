import { Server, Socket } from "socket.io";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {{server: Server, client: Socket, data: Object}} EventPayload */

/** @typedef {{ type: "SUCCESS" | "ERROR" | "INFO" | "WARN"; message: string; time: number }} Toast */

/**
 * @description Reference to the Data Manager.
 * @type {{get: () => Object<string, any>, set: ((value: Object<string, any>) => void)}}
 */
export let Data;

/**
 * @description Reference to the ShadowRoot object of the (global) Page Component.
 * @type {ShadowRoot}
 * @example
 * // returns {p node}
 * Page.querySelector("p");
 */
export let Page;

/** @typedef {"Home"|"Login"|"CreateAccount"} Pages */

/** @typedef {"RequestPage"|"NewMessage"|"RegisterRoom"|"CreateAccount"|"Login"|"Logout"|"Init"} Events */

/**
 * @description
 * @param {Events} target
 * @param {Object<string, any>} payload
 * @returns {null}
 * @example
 * EmitEvent("Test", { message: "Hello World" });
 */
export function EmitEvent(target, payload) {}

/**
 * @description
 * @param {String} target
 * @param {Object<string, any>} payload
 * @returns {null}
 * @example
 * ListenEvent("Test", (payload) => {
 *     const { message } = payload;
 * });
 */
export function ListenEvent(target, callback) {}

/**
 * @description
 * @param {String} target
 * @returns {null}
 * @example
 * RemoveEvent("Test");
 */
export function RemoveEvent(target) {}
