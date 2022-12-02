import { useNavigate } from "react-router-dom"

export default function Home() {
    const navigate = useNavigate()
    return <>
        <button onClick={() => navigate("/topological-sort")}>topsort</button>
        <button onClick={() => navigate("/avl-tree")}>avl-tree</button>
    </>

}