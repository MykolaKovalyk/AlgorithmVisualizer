import styles from "./Button.module.css"


const Button = ({className, ...props}) => {
    return (
        <button className={[styles.button, className].join(' ')} {...props}>{props.children}</button>
    );
}

export default Button;