import { forwardRef } from "react"
import styles from "./Button.module.css"


const Button = forwardRef(({ className, ...props }, ref) => {
    return <button className={[styles.button, className].join(' ')} ref={ref} {...props}>
        {props.children}
    </button>
})

export default Button