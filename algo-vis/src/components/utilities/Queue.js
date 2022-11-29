
export default class Queue {
    constructor() {
        this.elements = [];
        this.head = 0;
        this.tail = 0;
    }
    enqueue(...elements) {
        for(let element of elements) {
            this.elements[this.tail] = element;
            this.tail++;
        }
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }

    peek() {
        return this.elements[this.head];
    }

    reset() {
        this.head = 0;
        this.tail = 0;
    }

    set elements(value) {
        this.elements = value
        this.reset()
    }

    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}
