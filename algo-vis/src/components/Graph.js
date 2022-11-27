import { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

export default function Graph(props) {

    const [cy, setCy] =  useState()

    let elements = []
    if(props.nodes) {
        for(const node of props.nodes) {
            elements.push({data: { id: node,  label: `${node}`}})
        }
    }

    if(props.edges) {
        for(const edge of props.edges) {
            elements.push({data:{ id: `${edge[0]}_${edge[1]}`, source: edge[0], target: edge[1] }})
        }
    }
    console.log(cy);

    let style = {
        position: "absolute",
        width: "100%",
        height: "500px"
    }

    let layout = {
        name: "cose"
    }

    return <CytoscapeComponent elements={elements} style={style} layout={layout} cy={setCy}/>;
}