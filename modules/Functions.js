import { Server, Socket } from "socket.io";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {{server: Server, client: Socket, data: Object}} EventPayload */

/** @typedef {{ type: "SUCCESS"|"ERROR"|"INFO"|"WARN"; message: string; time: number }} Toast */

/**
 * Controlador dos Toasts.
 * @type {{add: ((data: Toast) => void)}}
 */
export let Toast;

/**
 * @description Reference to the Data Manager.
 * @type {{get: () => Object<string, any>, set: ((value: Object<string, any>) => void, add: ((key: string, value: any)))}}
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

/** @typedef {"CreateAccount"|"CreateCharacter"|"Home"|"Login"} Pages */

/** @typedef {"CreateAccount"|"Login"|"Logout"|"CreateCharacter"|"NewMessage"|"RegisterRoom"|"RequestPage"} Events */

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
 * @param {Events} target
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
 * @param {Events} target
 * @returns {null}
 * @example
 * RemoveEvent("Test");
 */
export function RemoveEvent(target) {}
