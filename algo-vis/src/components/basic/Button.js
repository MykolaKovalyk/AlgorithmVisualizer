import styles from "./Button.module.css"


export default function Button({ className, ...props }) {
    return <button className={[styles.button, className].join(' ')} {...props}>
        {props.children}
    </button>
}