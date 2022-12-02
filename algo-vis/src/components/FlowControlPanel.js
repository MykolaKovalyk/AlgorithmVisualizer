import { useEffect, useState } from "react"
import Button from "./Button"
import styles from "./FlowControlPanel.module.css"



export default function FlowControlPanel({
    pause,
    resume,
    isPaused,
    stepBack,
    stepForward,
    onViewCleared,
    ...props
}) {

    let [paused, setPaused] = useState(false)

    function clearViewCallback() {
        setPaused(false)
    }

    useEffect(() => {
        onViewCleared(clearViewCallback)
    }, [])

    return <div className={styles.control_panel}>
        <button className={styles.back_button} type="button" onClick={
            () => {
                stepBack()
                setPaused(true)
            }} />
        <div
            className={[styles.pause_resume_button, paused ? styles.resume_button : styles.pause_button].join(' ')}
            onClick={() => {
                if (isPaused()) {
                    resume()
                    setPaused(false)
                } else {
                    pause()
                    setPaused(true)
                }
            }} />
        <button className={styles.forward_button} type="button" onClick={
            () => {
                stepForward()
                onViewCleared()
            }
        } />
    </div>
}