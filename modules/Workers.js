/**
 * Cria um Worker, que internamente tem uma fila, que será continuamente analisada, para lidar com os trabalhos nela inserida.
 * @param {Number} concurrentJobLimit Limite de quantos trabalhos pegar por vez para resolver.
 * @param {Number} listeningRate      Taxa de atualização do Woker (em ms).
 * @param {Number} queueSizeLimit     Capacidade maxima da fila (em un).
 */
export function createWorker(
    concurrentJobLimit = 10,
    listeningRate = 100,
    queueSizeLimit = 100
) {
    return {
        /**
         * Inicia os trabalhos do Worker.
         */
        start: function () {
            this._interval = setInterval(
                this._handleQueue.bind(this),
                listeningRate
            );
        },

        /**
         * Finaliza os trabalhos do Worker.
         */
        stop: function () {
            clearInterval(this._interval);
        },

        /**
         * Adiciona uma operação a fila.
         * @param {Function} operation Função que será executada dentro do Worker.
         * @param {Number} user        Opcional: Identificação do usuario que mandou a operação.
         * @returns {Number|null}      Retornar null caso não seja possivel anexar a operação, ou a posição da operação na fila.
         */
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
