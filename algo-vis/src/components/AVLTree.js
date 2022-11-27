import { useEffect, useState} from "react";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from 'cytoscape-dagre';

cytoscape.use( dagre );

export default function AVLTree(props) {

    const [cy, setCy] = useState()


    let elements = []
    if(props.nodes) {

        for(const node of props.nodes) {
            elements.push({data: { id: node,  label: `${node}`}, selected: props?.selected === node })
        }
    }

    if(props.edges) {
        for(const edge of props.edges) {
            elements.push({data:{source: edge[0], target: edge[1] }})
        }
    }

    let style = {
        position: "absolute",
        width: "100%",
        height: "500px"
    }

    let layout = {
        name: "dagre",
        animate: true    
    }

    useEffect(() => {
        let layoutObject = cy?.elements().makeLayout(layout);
        layoutObject?.run()
    }, [JSON.stringify(props)])
    
    cy?.nodes().ungrabify()

    return <CytoscapeComponent elements={elements} style={style} layout={layout} cy={setCy}/>;
}