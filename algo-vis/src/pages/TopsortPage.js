import styles from "./TopsortPage.module.css"
import { useEffect, useRef, useState } from "react";
import Graph from "../components/Graph";
import FlowControlPanel from "../components/FlowControlPanel";
import Table from "../components/basic/Table"
import Button from "../components/basic/Button";
import Modal from "../components/basic/Modal";


const DEFAULT_ANIMATION_DURATION_FACTOR = 0.5
const DEFAULT_COUNT_OF_GENERATED_NODES = 20
const DEFAULT_COUNT_OF_MIN_EDGES_PER_GENERATED_NODE = 1
const DEFAULT_COUNT_OF_MAX_EDGES_PER_GENERATED_NODE = 3

export default function TopsortPage(props) {
    const graphInterface = useRef()

    const flowControlInterface = useRef()

    const messageLabel = useRef()


    const [intervalBetweenAnimations, setInterval] = useState(DEFAULT_ANIMATION_DURATION_FACTOR)



    return <div>

        <div className={styles.message_area}>
            <b>Output array:</b>
            <div ref={messageLabel} style={{ overflowX: "auto" }}>Waiting for you to start...</div>
        </div>

        <div className={styles.view}>
            <Graph
                getInterfaceObject={(object) => graphInterface.current = object}
                visualizationDuration={intervalBetweenAnimations}
                onMessage={(message) => messageLabel.current.innerHTML = message}
            />
        </div>

        <FlowControlPanel
            pause={() => graphInterface.current.pause()}
            resume={() => graphInterface.current.resume()}
            isPaused={() => graphInterface.current.isPaused()}
            stepBack={() => graphInterface.current.stepBack()}
            stepForward={() => graphInterface.current.stepForward()}
            getInterface={(interfaceObj) => flowControlInterface.current = interfaceObj}
        />

        <DataModificationPanel
            flowControlInterface={flowControlInterface}
            setAnimationInterval={setInterval}
            graphInterface={graphInterface} />



    </div>
}



function DataModificationPanel({ flowControlInterface, graphInterface, setAnimationInterval, ...props }) {
    const tableInterface = useRef()

    const startNodeModal = useRef()
    const generateGraphModal = useRef()

    return <>
        <div className={styles.data_modification}>
            <div className={styles.data_input}>
                <Button className={styles.data_button}
                    onClick={() => graphInterface.current.setGraph(tableInterface.current.getData())}>
                    Submit
                </Button>
                <Button className={styles.data_button}
                    onClick={() => startNodeModal.current.setVisible(true)}>
                    Start
                </Button>
                <Button className={styles.data_button}
                    onClick={() => generateGraphModal.current.setVisible(true)}>
                    Generate
                </Button>
            </div>
            <Button className={styles.clear_button} onClick={() => {
                flowControlInterface.current?.setPaused(false)
                graphInterface.current.clear()
            }}>
                Clear
            </Button>

            <center>Input your data:</center>

            <Table
                className={styles.input_table}
                getInterface={(interfaceObj) => tableInterface.current = interfaceObj} />
        </div>
        <SelectStartNodeModal
            flowControlInterface={flowControlInterface}
            graphInterface={graphInterface}
            setAnimationInterval={setAnimationInterval}
            getInterface={(interfaceObj) => startNodeModal.current = interfaceObj} />
        <GenerateGraphModal
            tableInterface={tableInterface}
            graphInterface={graphInterface}
            getInterface={(interfaceObj) => generateGraphModal.current = interfaceObj} />
    </>
}



function SelectStartNodeModal({ flowControlInterface, graphInterface, setAnimationInterval, getInterface, ...props }) {
    const modalInterface = useRef()
    const animationIntervalInput = useRef()
    const startNodeInput = useRef()
    const startingNodeResponse = useRef()

    useEffect(() => {
        animationIntervalInput.current.value = DEFAULT_ANIMATION_DURATION_FACTOR
    }, [])

    return <Modal
        className={styles.modal}
        getInterface={getModalInterface} {...props}>
        <div className={styles.modal_container}>
            <div className={styles.modal_text_container}>
                Slow down by
                <input placeholder={DEFAULT_ANIMATION_DURATION_FACTOR} className={styles.short_number_input} type="number" ref={animationIntervalInput} />
                times
            </div>
            <Button className={styles.modal_button} onClick={submitSpeedfactor}>
                submit
            </Button>
            <div className={styles.modal_text_container} ref={startingNodeResponse} >
                Choose the starting node:
            </div>
            <input className={styles.number_input} type="number" ref={startNodeInput} />
            <Button className={styles.modal_button} onClick={startTopsort}>
                start
            </Button>
        </div>
        <Button className={styles.close_modal_button} onClick={() => modalInterface.current.setVisible(false)}>close</Button>
    </Modal>

    function getModalInterface(interfaceObj) {
        modalInterface.current = interfaceObj
        getInterface?.(modalInterface.current)
    }

    function startTopsort() {
        let startNode = parseInt(startNodeInput.current.value)

        if (isNaN(startNode)) {
            startingNodeResponse.current.innerHTML = "Error - incorrect format, should be a whole number."
            return
        }

        if (!graphInterface.current.getGraph()?.nodes.includes(startNode)) {
            startingNodeResponse.current.innerHTML = "Error - specified node is not in the node list."
            return
        }

        graphInterface.current.topsort(startNode)
        modalInterface.current.setVisible(false)
    }

    function submitSpeedfactor() {
        if (animationIntervalInput.current.value.length > 0) {
            setAnimationInterval(parseFloat(animationIntervalInput.current.value))
        }
    }
}



function GenerateGraphModal({ graphInterface, tableInterface, getInterface, ...props }) {

    const generatedNodesInput = useRef()
    const minEdgesPerGeneratedNodeInput = useRef()
    const maxEdgesPerGeneratedNodeInput = useRef()
    const modalInterface = useRef()

    useEffect(() => {
        generatedNodesInput.current.value = DEFAULT_COUNT_OF_GENERATED_NODES
        minEdgesPerGeneratedNodeInput.current.value = DEFAULT_COUNT_OF_MIN_EDGES_PER_GENERATED_NODE
        maxEdgesPerGeneratedNodeInput.current.value = DEFAULT_COUNT_OF_MAX_EDGES_PER_GENERATED_NODE
    }, [])

    return <Modal
        className={styles.modal}
        getInterface={getModalInterface} {...props}>
        <div className={styles.modal_container}>
            <div className={styles.modal_text_container}>
                <center>

                    Generate graph of

                    <input className={styles.short_number_input}
                        placeholder={DEFAULT_COUNT_OF_GENERATED_NODES}
                        type="number"
                        ref={generatedNodesInput} />

                    nodes, each having at least

                    <input className={styles.short_number_input}
                        placeholder={DEFAULT_COUNT_OF_MIN_EDGES_PER_GENERATED_NODE}
                        type="number"
                        ref={minEdgesPerGeneratedNodeInput} />

                    and at most

                    <input className={styles.short_number_input}
                        placeholder={DEFAULT_COUNT_OF_MAX_EDGES_PER_GENERATED_NODE}
                        type="number"
                        ref={maxEdgesPerGeneratedNodeInput} />

                    edges

                </center>
            </div>

            <Button className={styles.modal_button} onClick={() => {
                let nodeCount = parseInt(generatedNodesInput.current.value)
                let minEdgeCount = parseInt(minEdgesPerGeneratedNodeInput.current.value)
                let maxEdgeCount = parseInt(maxEdgesPerGeneratedNodeInput.current.value)

                if (isNaN(nodeCount) || isNaN(maxEdgeCount)) return;

                if (maxEdgeCount > nodeCount - 1) return;

                graphInterface.current.generateGraph(nodeCount, minEdgeCount, maxEdgeCount)
                tableInterface.current.setData(graphInterface.current.getGraph().edges)
                modalInterface.current.setVisible(false)
            }}>
                submit
            </Button>
        </div>
        <Button className={styles.close_modal_button} onClick={() => modalInterface.current.setVisible(false)}>close</Button>
    </Modal>


    function getModalInterface(interfaceObj) {
        modalInterface.current = interfaceObj
        getInterface?.(modalInterface.current)
    }
}
