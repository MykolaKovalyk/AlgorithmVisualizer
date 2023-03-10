import styles from "./Header.module.css"
import NavLink from "./basic/NavLink"

const LINKEDIN = "https://www.linkedin.com/in/mykola-kovalyk/"

export default function Header(props) {
    return <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
            <h5 style={
                {
                    margin: "0 20px"
                }}>made by</h5>
            <h2 style={
                {
                    color: "#6F8FAF",
                    cursor: "pointer"
                }}
                onClick={() => window.open(LINKEDIN, "_blank")}>
                Kovalyk Mykola
            </h2>
        </div>
        <div className={styles.title}>
            <h1>
                Algorithm Visualizer
            </h1>
        </div>
        <div className={styles.navigation}>
            <NavLink className={styles.link} link="/topological-sort">Topological Sorting</NavLink>
            <NavLink className={styles.link} link="/avl-tree">AVL Tree</NavLink>
        </div>
    </div>
}