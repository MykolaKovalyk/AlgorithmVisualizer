import Queue from "./Queue";

export default class EventHandler {
    #eventQueue = new Queue(100);
    #currentResolve = null;
    #closed = false;
    #paused = false
    #reversed = false

    constructor(handleEvent) {
        this.handleEvent = handleEvent
    }

    async start() {
        this.#closed = false

        while(!this.#closed) {
            await this.#constructNewPromise()

            if(this.#reversed) {
                if(this.#eventQueue.bufferedLength < 2) continue; 
                
                await this.handleEvent(this.#eventQueue.revert())
            } else {
                if(this.#eventQueue.length == 0) continue; 
                
                await this.handleEvent(this.#eventQueue.dequeue())
            }
        }
    }

    get closed() { return this.#closed }

    addEvents(actions) {
        this.#eventQueue.enqueue(...actions)

        if(!this.paused) {
            this.#currentResolve?.()
        }
    }

    pause() {
        this.#paused = true
    }

    back() {
        this.pause()
        this.#reversed = true
        this.#currentResolve?.()
    }

    forward() {
        this.pause()
        this.#reversed = false
        this.#currentResolve?.()
    }

    resume() {
        this.#paused = false
        this.#reversed = false
        this.#currentResolve?.()
    }

    stop() {
        this.#closed = true
        this.#currentResolve?.()
    }

    #constructNewPromise() {
        return new Promise((resolve) => {
            this.#currentResolve = resolve;
            
            if(!this.#paused) {
                if( (!this.#reversed && this.#eventQueue.length > 0) ||
                    (this.#reversed && this.#eventQueue.bufferedLength > 0)) {
                    resolve()
                }
            }
        })
    }
}