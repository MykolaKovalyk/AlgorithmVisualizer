import { useEffect, useRef } from "react"
import useStateRef from "react-usestateref"
import styles from "./Modal.module.css"



export default function Modal({ getInterface, ...props }) {
    const outer = useRef()
    const [visible, setVisible, visibleRef] = useStateRef(false)

    useEffect(() => {
        if (!getInterface) return;
        getInterface?.({
            setVisible, 
            getVisible: () => visibleRef.current
        })
    }, [])

    return <div
        className={[styles.outer_cover, visible ? null : styles.outer_disabled].join(' ')}
        ref={outer}
        onClick={(event) => {
            if (event.target != outer.current) return;
            setVisible(false)
        }}>
        <div {...props}>
            {props.children}
        </div>
    </div>
}