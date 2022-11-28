import { useEffect, useState } from "react";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export default function AVLTree(props) {

    const [cy, setCy] = useState()


    let elements = []
    if (props.nodes) {

        for (const node of props.nodes) {
            elements.push({ data: { id: node, label: `${node}` } })
        }
    }

    if (props.edges) {
        for (const edge of props.edges) {
            elements.push({ data: { source: edge[0], target: edge[1] } })
        }
    }

    let style = {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "dagre",
        animate: true
    }

    let stylesheet = [
        {
            selector: 'node',
            style: {
                content: 'data(id)',
            }
        },
        {
            selector: 'edge',
            style: {
            }
        },
        {
            selector: '.selection',
            style: {
                'background-color': props.selectedColor,
            }
        }]

    useEffect(() => {
        let layoutObject = cy?.elements().makeLayout(layout);
        layoutObject?.run()
    }, [JSON.stringify(props)])

    cy?.nodes().ungrabify()

    if (cy) {
        for(let element of cy.elements()) {
            if(element.id() == props.selected) {
                element.addClass("selection")
            } else {
                element.removeClass("selection")
            }
        }
    }

    return <CytoscapeComponent elements={elements} stylesheet={stylesheet} style={style} layout={layout} cy={setCy} />;
}