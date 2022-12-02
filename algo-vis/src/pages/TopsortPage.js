import styles from "./TopsortPage.module.css"
import { useRef } from "react";
import Graph from "../components/Graph";
import FlowControlPanel from "../components/FlowControlPanel";
import Table from "../components/Table"
import Button from "../components/Button";
import Modal from "../components/Modal";


export default function TopsortPage(props) {
    const graphInterface = useRef()
    const onViewClearedCbck = useRef()
    const messageLabel = useRef()
    const tableInterfaceObj = useRef()
    const startingNodePopup = useRef()
    const startingNodeInput = useRef()
    const startingNodeResponse = useRef()

    return <div>

        <div className={styles.output_area}>
            <b>Output array:</b>
            <div ref={messageLabel}>Waiting for you to start...</div>
        </div>
        <div className={styles.view}>
            <Graph 
                
                getInterfaceObject={(object) => { 
                    graphInterface.current = object;
                }}
                visualizationDuration={0.5}
                onNewTraversedArray={(array) => { messageLabel.current.innerHTML = JSON.stringify(array); console.log("Hi")}}
            />
        </div>
        
        <FlowControlPanel
            pause={() => graphInterface.current.pause()}
            resume={() => graphInterface.current.resume()}
            isPaused={() => graphInterface.current.isPaused()}
            stepBack={() => graphInterface.current.stepBack()}
            stepForward={() => graphInterface.current.stepForward()}
            onViewCleared={(onViewClearedCallback) => onViewClearedCbck.current = onViewClearedCallback}
        />
        <div className={styles.data_input}>
            <div className={styles.data_input_buttons}>
                <Button className={styles.submit_data_button} onClick={
                    () => {
                        graphInterface.current.initializeGraph(tableInterfaceObj.current.getData())
                    }
                }>Submit</Button>
                <Button className={styles.start_button} onClick={
                    () => {
                        startingNodePopup.current.setVisible(true)
                    }
                }>Start</Button>
                <Button className={styles.start_button} onClick={
                    () => {
                        tableInterfaceObj.current.setData(graphInterface.current.generateGraph(20, 40).edges)
                    }
                }>Generate</Button>
            </div>
            <center>Input your data:</center>
            <Table 
                className={styles.input_table}
                getSetterAndGetter={(setCallback, getCallback) => tableInterfaceObj.current = {setData: setCallback, getData: getCallback}}/>
        </div>
        <Modal
            className={styles.choose_starting_edge_popup}
            setCallbacks={(setVisible, getVisible) => startingNodePopup.current = { setVisible, getVisible }}
        >
            <div className={styles.modal_container}>
                <div className={styles.modal_text_container} ref={startingNodeResponse} >
                    Choose the starting node:
                </div>
                <input className={styles.number_input} type="number" ref={startingNodeInput} />
                <Button className={styles.modal_button} onClick={() => {
                    let startNode = parseInt(startingNodeInput.current.value)

                    if(isNaN(startNode)) {
                        startingNodeResponse.current.innerHTML =  "Error - incorrect format, should be a whole number."
                        return
                    }

                    if(!graphInterface.current.getGraph()?.nodes.includes(startNode)) {
                        startingNodeResponse.current.innerHTML =  "Error - specified node is not in the node list."
                        return
                    }

                    graphInterface.current.topsort(startNode)
                    startingNodePopup.current.setVisible(false)
                }}>start</Button>
            </div>
            <Button className={styles.close_modal_button} onClick={() => startingNodePopup.current.setVisible(false)}>close</Button>
        </Modal>
    </div>
}