import Graph from "react-graph-vis";

export default function AVLTree(props) {

    let processed_nodes = []
    if(!(props.nodes == null)) {
        for(const node of props.nodes) {
            processed_nodes.push({ id: node,  label: `Node ${node}`, title: `node ${node} tootip text`})
        }
    }
    
    let processed_edges = []
    if(!(props.edges == null)) {
        for(const edge of props.edges) {
            processed_edges.push({ from: edge[0], to: edge[1] })
        }
    }

    const options = {
        layout: {
            hierarchical: {
                direction: "UD",
                sortMethod: "directed",
            },
        },
        edges: {
            color: "#000000",
        },
        height: "500px",
    };

    const graph = {
        nodes: processed_nodes,
        edges: processed_edges,
    };

    return <Graph graph={graph} options={options}/>;
}