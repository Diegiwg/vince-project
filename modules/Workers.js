export function createWorker(concurrent_jobs_limit) {
    return {
        /**
         * Inicia os trabalhos do Worker
         */
        start: function () {
            this._interval = setInterval(this._handleQueue.bind(this), 1000);
        },

        /**
         * Finaliza os trabalhos do Worker
         */
        stop: function () {
            clearInterval(this._interval);
        },

        /**
         * Adiciona uma operação a fila
         * @param {Function} operation
         */
        add: function (operation) {
            this._queue.push(operation);
        },

        _handleQueue: function () {
            if (this._queue.length === 0 || this._busy) return;

            const operations = this._queue.splice(
                0,
                concurrent_jobs_limit // Use a variável passada como parâmetro
            );

            this._busy = true;

            operations.forEach(async (operation) => {
                try {
                    await operation();
                } catch (error) {
                    this.add(operation);
                }
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
