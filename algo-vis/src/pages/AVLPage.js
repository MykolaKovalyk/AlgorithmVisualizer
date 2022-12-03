import styles from "./AVLPage.module.css"
import { useEffect, useRef, useState } from "react";
import AVLTree from "../components/AVLTree";
import Button from "../components/basic/Button";
import FlowControlPanel from "../components/FlowControlPanel";
import Modal from "../components/basic/Modal";


const DEFAULT_COUNT_OF_TEST_ADDITIONS = 20
const DEFAULT_COUNT_OF_TEST_REMOVALS = 10
const DEFAULT_ANIMATION_DURATION_FACTOR = 0.5


export default function AVLPage() {

    const treeInterface = useRef()
    const flowControlInterface = useRef()

    const messageLabel = useRef()

    const [intervalBetweenAnimations, setInterval] = useState(DEFAULT_ANIMATION_DURATION_FACTOR)


    return <div className={styles.page}>
        <div className={styles.message_label}>
            <b>Status: </b><div ref={messageLabel}>Waiting untill you tell me to do something...</div>
        </div>
        <div className={styles.view}>
            <AVLTree
                getInterface={(interfceObj) => { treeInterface.current = interfceObj }}
                onMessage={(message) => messageLabel.current.innerHTML = message}
                visualizationDuration={intervalBetweenAnimations}
            />
        </div>
        <div className={styles.action_panel}>
            <FlowControlPanel
                pause={() => treeInterface.current.pause()}
                resume={() => treeInterface.current.resume()}
                isPaused={() => treeInterface.current.isPaused()}
                stepBack={() => treeInterface.current.stepBack()}
                stepForward={() => treeInterface.current.stepForward()}
                getInterface={(interfaceObj) => flowControlInterface.current = interfaceObj}
            />

            <ActionPanel />

            <Button className={styles.clear_button} onClick={clearViewport}>
                clear
            </Button>

            <AdvancedOptionsModal
                treeInterface={treeInterface}
                setAnimationInterval={setInterval} />
        </div>

    </div>

    function clearViewport() {
        flowControlInterface.current?.setPaused(false)
        treeInterface.current.clear()
    }
}



function ActionPanel({ treeInterface, ...props }) {

    const newValueInput = useRef()

    return <div className={styles.modification_panel} {...props}>
        <center>Modify the tree and watch it as it changes:</center>

        <div className={styles.modification_buttons}>
            <div className={styles.modification_input}>
                <input className={styles.modification_input_field} ref={newValueInput} />
            </div>
            <Button className={styles.button} onClick={find}>
                find
            </Button>
            <Button className={styles.button} onClick={insert}>
                insert
            </Button>
            <Button className={styles.button} onClick={remove}>
                remove
            </Button>
        </div>
    </div>


    function find() {
        treeInterface.current.find(parseInt(newValueInput.current.value))
    }

    function insert() {
        treeInterface.current.insert(parseInt(newValueInput.current.value))
    }

    function remove() {
        treeInterface.current.remove(parseInt(newValueInput.current.value))
    }
}


function AdvancedOptionsModal({ treeInterface, setAnimationInterval, ...props }) {

    const modalInterface = useRef()
    const animationIntervalInput = useRef()
    const testAddItemsInput = useRef()
    const testRemoveItemsInput = useRef()


    useEffect(() => {
        animationIntervalInput.current.value = DEFAULT_ANIMATION_DURATION_FACTOR
        testAddItemsInput.current.value = DEFAULT_COUNT_OF_TEST_ADDITIONS
        testRemoveItemsInput.current.value = DEFAULT_COUNT_OF_TEST_REMOVALS
    }, [])


    return <>
        <Button className={styles.show_advanced_button} onClick={() => modalInterface.current.setVisible(true)}>
            show advaned
        </Button>

        <Modal
            className={styles.advanced_modal}
            getInterface={(interfaceObj) => modalInterface.current = interfaceObj}>
            <div className={styles.modal_container}>
                <div className={styles.modal_text_container}>
                    Slow down by
                    <input placeholder={DEFAULT_ANIMATION_DURATION_FACTOR} className={styles.number_input} type="number" ref={animationIntervalInput} />
                    times
                </div>
                <Button className={styles.modal_button} onClick={() => {
                    if (animationIntervalInput.current.value.length > 0) {
                        submitSpeedfactor(parseFloat(animationIntervalInput.current.value))
                    }
                }}>
                    submit
                </Button>
                <div className={styles.modal_text_container}>
                    Test tree with
                    <input placeholder={DEFAULT_COUNT_OF_TEST_ADDITIONS} className={styles.number_input} ref={testAddItemsInput} />
                    elements, and remove
                    <input placeholder={DEFAULT_COUNT_OF_TEST_REMOVALS} className={styles.number_input} ref={testRemoveItemsInput} />
                    elements after that
                </div>
                <Button className={styles.modal_button} onClick={() => {
                    let addedCount = parseInt(testAddItemsInput.current.value)
                    let removedCount = parseInt(testRemoveItemsInput.current.value)

                    if (isNaN(addedCount) || isNaN(removedCount)) return;

                    if (addedCount < removedCount) return;

                    treeInterface.current.test(addedCount, removedCount)
                    modalInterface.current.setVisible(false)
                }}>start testing</Button>
            </div>
            <Button className={styles.close_modal_button} onClick={() => modalInterface.current.setVisible(false)}>close</Button>
        </Modal>
    </>


    function submitSpeedfactor() {
        if (animationIntervalInput.current.value.length > 0) {
            setAnimationInterval(parseFloat(animationIntervalInput.current.value))
        }
    }
}