
export default class Queue {

    #elements = [];
    constructor(maxBufferLength=0, bufferEverything=false) {
        this.head = null
        this.tail = null
        this.bufferedHead = null
        this.bufferedLength = 0
        this.length = 0
        this.maxBufferLength = maxBufferLength
        this.bufferEverything = bufferEverything
    }

    enqueue(...elements) {
        for(let element of elements) {
            let newNode = new Node(this.tail, element)
            this.tail = newNode
            
            if(!this.head) {
                this.head = this.tail
            }

            this.length++
        }
    }

    dequeue() {
        if(this.length == 0) return undefined

        const item = this.head
        this.head = this.head.next
        
        this.length--

        this.bufferedLength++
        if(!this.bufferedHead) {
            this.bufferedHead = item
        }

        if(!this.bufferEverything) {
            while (this.bufferedLength > this.maxBufferLength) {
                this.bufferedHead = this.bufferedHead === this.head ? null : this.bufferedHead.next

                if(this.bufferedHead) {
                    this.bufferedHead.previous = null
                }

                this.bufferedLength--
            }
        }

        return item.element;
    }

    revert() {
        if(this.bufferedLength < 2) return undefined

        if( this.length > 0) {
            this.head = this.head.previous 
        } else {
            this.head = this.tail
        }

        this.length++
        this.bufferedLength--

        return this.head.previous.element;
    }

    peek() {
        return this.#elements[this.head];
    }

    reset() {
        this.head = 0;
        this.tail = 0;
    }

    set elements(value) {
        this.#elements = value
        this.reset()
    }

    get elements() {
        let elements = []

        let current = this.bufferedHead
        let i = 0
        while(current && i < this.bufferedLength) {
            elements.push(current.element)
            current = current.next
            i++
        }

        return elements
    }

    get isEmpty() {
        return this.length === 0;
    }
}

class Node {
    constructor(previous, element) {
        this.previous = previous
        this.next = null
        
        if(this.previous) {
            this.previous.next = this
        }

        this.element = element
    }
}