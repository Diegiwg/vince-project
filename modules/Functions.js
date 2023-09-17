import { Server, Socket } from "socket.io";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {{ type: "SUCCESS" | "ERROR" | "INFO" | "WARN"; message: string; time: number }} Toast */

/**
 * @description Reference to the ShadowRoot object of the (global) Page Component.
 * @type {ShadowRoot}
 * @example
 * // returns {p node}
 * Page.querySelector("p");
 */
export let Page;

/** @typedef {"Ola"|"Mundo"|"Test"} Events */

/**
 * @description
 * @param {Events} target
 * @param {Object<string, any>} payload
 * @returns {null}
 * @example
 * EmitEvent("Test", { message: "Hello World" });
 */
export function EmitEvent(target, payload) {}

/** @typedef {"Home"|"Login"|"CreateAccount"} Pages */
