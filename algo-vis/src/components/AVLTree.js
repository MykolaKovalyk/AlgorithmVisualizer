import { useEffect, useState, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./utilities/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);


const visualizationSpeed = 0.25


export default function AVLTree(props) {

    const [graph, setGraph] = useState()


    const [cy, setCy, cyRef] = useStateRef()
    const eventHandler = useRef()

    useEffect(() => {
        eventHandler.current = new EventHandler(async (action) => 
            await actionHandler({
                getCy: () => cyRef.current, 
                setGraph, 
                action
            }))

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
        name: "dagre",
        animate: true,
        animationDuration: visualizationSpeed * 750
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



async function actionHandler({getCy, setGraph, action, ...props}) {
    let actionType =  action.action

    let cy = getCy()

    if(actionType === "select_node") {
        assignClassToNodes([action.key], [action.color], cy)
        await delay(visualizationSpeed*500)
    }

    if(actionType === "new_node") {
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        await delay(visualizationSpeed*500)

        assignClassToNodes([action.key], ["green"], cy)
        await delay(visualizationSpeed*500)
    }

    if(actionType === "remove_node") {
        assignClassToNodes([action.key], ["red"], cy)
        await delay(visualizationSpeed*500)
        
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        await delay(visualizationSpeed*500)
    }

    if(actionType === "replace_node") {
        assignClassToNodes([action.replacement, action.to_replace], ["orange"], cy)
        await delay(visualizationSpeed*500)

        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        await delay(visualizationSpeed*500)
    }

    if(actionType === "rotate_node") {
        assignClassToNodes([action.key], ["orange"], cy)
        await delay(visualizationSpeed*500)
        
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        await delay(visualizationSpeed*500)
    }

    if(actionType === "final_tree") {
        clearAllClasses(cy)
        await delay(visualizationSpeed*500)
    }

    if(actionType === "set") {
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
    }
}

function convertTreeToCytoscapeElements(tree, cy) {

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

function clearAllClasses(cy) {
    for (const node of cy.elements()) {
        node.removeClass(node.classes())
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}