import Queue from "./Queue";

export default class EventHandler {
    #eventQueue = new Queue();
    #currentResolve = null;
    #closed = false;

    constructor(handleEvent) {
        this.handleEvent = handleEvent
    }

    async start() {
        this.#closed = false
        while(!this.#closed) {
            if(this.#eventQueue.length === 0) {
                await this.#constructNewPromise()
            } else {
                await this.handleEvent(this.#eventQueue.dequeue())
            }
        }
    }

    get closed() { return this.#closed }

    addEvents(actions) {
        this.#eventQueue.enqueue(...actions)
        this.#currentResolve?.()
    }

    stop() {
        this.#closed = true
        this.#currentResolve?.()
    }

    #constructNewPromise() {
        return new Promise((resolve) => {
            this.#currentResolve = resolve;
        })
    }
}