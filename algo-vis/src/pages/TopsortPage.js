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

    const animationIntervalInput = useRef()
    const generatedNodesInput = useRef()
    const minEdgesPerGeneratedNodeInput = useRef()
    const maxEdgesPerGeneratedNodeInput = useRef()
    const startNodeInput = useRef()
    const startingNodeResponse = useRef()

    const tableInterface = useRef()

    const startNodePopup = useRef()
    const generateGraphPopup = useRef()

    const [intervalBetweenAnimations, setInterval] = useState(DEFAULT_ANIMATION_DURATION_FACTOR)


    useEffect(() => {
        animationIntervalInput.current.value = DEFAULT_ANIMATION_DURATION_FACTOR
        generatedNodesInput.current.value = DEFAULT_COUNT_OF_GENERATED_NODES
        minEdgesPerGeneratedNodeInput.current.value = DEFAULT_COUNT_OF_MIN_EDGES_PER_GENERATED_NODE
        maxEdgesPerGeneratedNodeInput.current.value = DEFAULT_COUNT_OF_MAX_EDGES_PER_GENERATED_NODE
    }, [])


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

        <div className={styles.data_modification}>
            <div className={styles.data_input}>
                <Button className={styles.data_button} 
                        onClick={() => graphInterface.current.setGraph(tableInterface.current.getData())}>
                    Submit
                </Button>
                <Button className={styles.data_button} 
                        onClick={() => startNodePopup.current.setVisible(true)}>
                    Start
                </Button>
                <Button className={styles.data_button} 
                        onClick={() => generateGraphPopup.current.setVisible(true)}>
                    Generate
                </Button>
            </div>
            <Button className={styles.clear_button} onClick={() => {
                flowControlInterface.current?.setPaused(false)
                graphInterface.current.clear()}}>
                Clear
            </Button>

            <center>Input your data:</center>

            <Table
                className={styles.input_table}
                getInterface={(interfaceObj) => tableInterface.current = interfaceObj}/>
        </div>

        <Modal
            className={styles.modal}
            setCallbacks={(setVisible, getVisible) => startNodePopup.current = { setVisible, getVisible }}>
            <div className={styles.modal_container}>
                <div className={styles.modal_text_container}>
                    Slow down by
                    <input placeholder={DEFAULT_ANIMATION_DURATION_FACTOR} className={styles.short_number_input} type="number" ref={animationIntervalInput} />
                    times
                </div>
                <Button className={styles.modal_button} onClick={() => {
                    if (animationIntervalInput.current.value.length > 0) {
                        setInterval(parseFloat(animationIntervalInput.current.value))
                    }}}>
                    submit
                </Button>
                <div className={styles.modal_text_container} ref={startingNodeResponse} >
                    Choose the starting node:
                </div>
                <input className={styles.number_input} type="number" ref={startNodeInput} />
                <Button className={styles.modal_button} onClick={() => {
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
                    startNodePopup.current.setVisible(false)
                }}>
                    start
                </Button>
            </div>
            <Button className={styles.close_modal_button} onClick={() => startNodePopup.current.setVisible(false)}>close</Button>
        </Modal>

        <Modal
            className={styles.modal}
            setCallbacks={(setVisible, getVisible) => generateGraphPopup.current = { setVisible, getVisible }}>
            <div className={styles.modal_container}>
                <div className={styles.modal_text_container}>
                    <center>
                        Generate graph of

                        <input  className={styles.short_number_input}
                                placeholder={DEFAULT_COUNT_OF_GENERATED_NODES} 
                                type="number"
                                ref={generatedNodesInput} />

                        nodes, each having at least

                        <input  className={styles.short_number_input} 
                                placeholder={DEFAULT_COUNT_OF_MIN_EDGES_PER_GENERATED_NODE} 
                                type="number" 
                                ref={minEdgesPerGeneratedNodeInput} />

                        and at most

                        <input  className={styles.short_number_input}
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
                    generateGraphPopup.current.setVisible(false)
                }}>
                    submit
                </Button>
            </div>
            <Button className={styles.close_modal_button} onClick={() => generateGraphPopup.current.setVisible(false)}>close</Button>
        </Modal>
    </div>
}