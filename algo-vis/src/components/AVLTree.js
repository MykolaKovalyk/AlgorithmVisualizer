import { useEffect, useState, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./utilities/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from 'cytoscape-dagre';
import GraphView from "./GraphView";
import { avlClear, avlGetItem, avlInsert, avlRemove, getTree } from "../requests";

cytoscape.use(dagre);




export default function AVLTree(props) {

    const identifier = 15
    const visualizationSpeed = 0.25
    const graphViewInterface = useRef()
    const interfaceObj = useRef()
    const data = useRef()


    const initializeInterfaceObject = async () => {
        interfaceObj.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            insert: async (node) => {
                let data = await avlInsert({ identifier: identifier, key: node })
                graphViewInterface.current.addActions(data)
            },
            remove: async (node) => {
                let data = await avlRemove({ identifier: identifier, key: node })
                graphViewInterface.current.addActions(data)
            },
            find: async (node) => {
                let data = await avlGetItem(identifier, node)
                graphViewInterface.current.addActions(data)
            },
            clear: async () => {
                await avlClear(identifier)
                graphViewInterface.current.addActions([{ action: "set", tree: [] }])
            },
            test: async () => {
                let newNodes = []

                for (let i = 0; i < 50; i++) {
                    newNodes.push(i)
                }

                newNodes.sort(() => Math.random() - 0.5)

                for (let newNode of newNodes) {
                    let data = await avlInsert({ identifier: identifier, key: newNode })
                    graphViewInterface.current.addActions(data)
                }

                newNodes = newNodes.filter(() => Math.random() > 0.8)

                for (let newNode of newNodes) {
                    let data = await avlRemove({ identifier: identifier, key: newNode })
                    graphViewInterface.current.addActions(data)
                }
            }
        }
        props.getInterfaceObject(interfaceObj.current)
        graphViewInterface.current.addActions([{action: "set", tree: await getTree(identifier)}])

        graphViewInterface.current.getCy().nodes().ungrabify()

        return interfaceObj.current
    }



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
                "text-valign": "center",
                "text-halign": "center"
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


    return <GraphView
        stylesheet={stylesheet}
        style={style}
        layout={layout}
        getInterfaceObject={(obj) => { graphViewInterface.current = obj; initializeInterfaceObject() }}
        visualizationSpeed={visualizationSpeed}
        actionHandler={actionHandler} />;
}



async function actionHandler({ getCy, setGraph, getGraph, action, ...props }) {
    let actionType = action.action
    let visualizationSpeed = props.visualizationSpeed

    if(action.old_tree) {
        setGraph(action.old_tree)
    }
    action.old_tree = getGraph()

    let cy = getCy()

    if (actionType === "select_node") {
        assignClassToNodes([action.key], [action.color], cy)
        if (!action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "new_node") {
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        if (!action.handled) await delay(visualizationSpeed * 500)

        assignClassToNodes([action.key], ["green"], cy)
        if (!action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "remove_node") {
        assignClassToNodes([action.key], ["red"], cy)
        if (!action.handled) await delay(visualizationSpeed * 500)

        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        if (!action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "replace_node") {
        assignClassToNodes([action.replacement, action.to_replace], ["orange"], cy)
        if (!action.handled) await delay(visualizationSpeed * 500)

        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        if (!action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "rotate_node") {
        assignClassToNodes([action.key], ["orange"], cy)
        if (!action.handled) await delay(visualizationSpeed * 500)

        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        if (!action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "final_tree") {
        clearAllClasses(cy)
        if (action.handled) await delay(visualizationSpeed * 500)
    }

    if (actionType === "set") {
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
    }

    action.handled = true
}

function convertTreeToCytoscapeElements(tree, cy) {

    if (!tree) {
        return {}
    }



    for (const node of cy.elements()) {
        node.removeClass(node.classes())
    }

    let elements = []

    if (tree.nodes) {
        for (const node of tree.nodes) {
            elements.push({ data: { id: node, label: `${node}` }, classes: null })
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
        if (nodesWithClass.includes(parseInt(node.id()))) {
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