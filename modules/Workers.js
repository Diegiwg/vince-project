// Versão: 1.0.0
// Data: 21.09.2023
// Autor: Diegiwg (Diego Queiroz <diegiwg@gmail.com>)

/**
 * Cria uma Fila, que internamente tem um Worker, que será acionado para lidar com os trabalhos nela inserida.
 * @param {number} concurrentJobLimit Limite de quantos trabalhos pegar por vez para resolver.
 * @param {number} listeningRate Taxa de atualização do Worker interno (em ms).
 * @param {number} queueSizeLimit Capacidade maxima da fila (em un).
 * @returns {{start: () => void, stop: () => void, add: (operation: Function) => number | null}} Objeto que representa a Fila.
 */
export function createQueue(
    concurrentJobLimit = 10,
    listeningRate = 100,
    queueSizeLimit = 100
) {
    return {
        start: function () {
            this._interval = setInterval(
                this._handleQueue.bind(this),
                listeningRate
            );
        },

        stop: function () {
            clearInterval(this._interval);
        },

        add: function (operation) {
            if (this._queue.length > queueSizeLimit) return null;

            return this._queue.push(operation);
        },

        _handleQueue: function () {
            if (this._queue.length === 0 || this._busy) return;

            this._busy = true;

            const jobs = this._queue.splice(0, concurrentJobLimit);

            jobs.forEach(async (operation) => {
                await operation();
            });

            this._busy = false;
        },

        /** @type {Array<Function>} */
        _queue: [],

        /** @type {number} */
        _interval: null,

        _busy: false,
    };
}
