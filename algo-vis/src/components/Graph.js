import { useEffect, useState, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./utilities/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import cola from "cytoscape-cola"

cytoscape.use(cola);


export default function Graph(props) {

    const [graph, setGraph, graphRef ] = useStateRef()


    const [cy, setCy, cyRef] = useStateRef()
    const eventHandler = useRef()

    useEffect(() => {
        eventHandler.current = new EventHandler(async (action) => 
            await actionHandler(() => graphRef.current, setGraph, action, () => cyRef.current))

        eventHandler.current.start()
        
        props.getAddActions?.(
            eventHandler.current.addEvents.bind(eventHandler.current))

        return () => eventHandler.current.stop()
    }, [])



    let style = {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "cola",
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
            selector: '.red',
            style: {
                'background-color': "red",
            }
        },
        {
            selector: '.green',
            style: {
                'background-color': "green",
            }
        },
        {
            selector: '.orange',
            style: {
                'background-color': "orange",
            }
        },
        {
            selector: '.yellow',
            style: {
                'background-color': "yellow",
            }
        }]

    useEffect(() => {
        let layoutObject = cy?.elements().makeLayout(layout);
        layoutObject?.run()
    }, [JSON.stringify(graph)])

    cy?.nodes().ungrabify()

    return <CytoscapeComponent elements={graph} stylesheet={stylesheet} style={style} layout={layout} cy={setCy} />;
}



async function actionHandler(getGraph, setGraph, action, getCy) {
    let actionType =  action.action

    let oldGraph = getGraph()
    let newGraph = []
    let cy = getCy()

    if(actionType === "select_node") {
        console.log(action.color)
        assignClassToNodes([action.key], [action.color], cy)
        await delay(500)
    }

    if(actionType === "new_node") {
        newGraph = usualNodesOutOfTree(action.tree, cy)
        setGraph(newGraph)
        await delay(1000)
    }

    if(actionType === "remove_node") {
        newGraph = usualNodesOutOfTree(action.tree, cy)
        setGraph(newGraph)
        await delay(1000)
    }

    if(actionType === "rotate_node") {
        assignClassToNodes([action.key], "orange", cy)
        await delay(500)
        
        newGraph = usualNodesOutOfTree(action.tree, cy)
        setGraph(newGraph)
        await delay(1000)
    }

    if(actionType === "rotate_node") {
        assignClassToNodes([action.to_replace, action.replacement], "blue", cy)
        await delay(500)
        

        newGraph = usualNodesOutOfTree(action.tree, cy)
        setGraph(newGraph)
        await delay(1000)
    }

    if(actionType === "final_tree") {
        newGraph = usualNodesOutOfTree(action.tree, cy)
        setGraph(newGraph)
        await delay(1000)
        assignClassToNodes([13], "green", cy)
    }
}

function usualNodesOutOfTree(tree, cy) {

    if (!tree) {
        return {}
    }

    for (const node of cy.elements()) {
        node.removeClass(node.classes())
    }

    let elements = []
    
    if(tree.nodes) {
        for (const node of tree.nodes) {
            elements.push({ data: { id: node, label: `${node}` }, classes: null})
        }
    }

    if (tree.edges) {
        for (const edge of tree.edges) {
            elements.push({ data: { source: edge[0], target: edge[1] } })
        }
    }

    return elements;
}

function assignClassToNodes(nodesWithClass, classes, cy) {

    let elements = []
    for (const node of cy.elements()) {
        node.removeClass(node.classes())
        if(nodesWithClass.includes(parseInt(node.id()))) {
            node.addClass(classes)
        }
        elements.push(node)
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}