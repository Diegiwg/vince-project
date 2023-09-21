// Versão 2.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

/* eslint-disable no-unused-vars */

import { Server, Socket } from "socket.io";

/** @typedef {{client: Socket, server: Server}} io */

/** @typedef {{server: Server, client: Socket, data: object}} EventPayload */

/** @typedef {{ type: "SUCCESS"|"ERROR"|"INFO"|"WARN"; message: string; time: number }} Toast */

/**
 * Controlador dos Toasts.
 * @type {object}
 * @property {(data: Toast) => void} add Adiciona um Toast.
 */
export let Toast;

/**
 * Referência para o Controlador de Dados.
 * @type {object}
 * @property {() => object} get Retorna o Dicionário de Dados.
 * @property {(value: object) => void} set Sobrescreve o Dicionário de Dados.
 * @property {(key: string, value: any) => void} add Adiciona um novo item ao Dicionário de Dados.
 */
export let Data;

/**
 * Referência para o Controlador de Páginas.
 * @type {ShadowRoot}
 */
export let Page;

/**
 * Função responsável por emitir um evento para o servidor.
 * @param {string} target Nome do evento.
 * @param {object} payload Objeto contendo os dados que serão enviados.
 */
export function EmitEvent(target, payload) {}

/**
 * Função responsável por registrar uma ação a um evento.
 * @param {string} target Nome do evento.
 * @param {object} payload Objeto contendo os dados que serão enviados.
 */
export function ListenEvent(target, payload) {}

/**
 * Função responsável por remover uma ação previamente registrada a um evento.
 * @param {string} target Nome do evento.
 */
export function RemoveEvent(target) {}

/**
 * Função responsável por registrar um componente no espoco global do cliente.
 * @param {string} key Nome do componente.
 * @param {string} node Elemento/Objeto que representa o componente.
 */
export function Component(key, node) {}
