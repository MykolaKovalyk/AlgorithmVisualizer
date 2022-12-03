import { useRef } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import GraphView from "./GraphView";
import { avlClear, avlGetItem, avlInsert, avlRemove, getTree } from "../requests";

cytoscape.use(dagre);




export default function AVLTree({ style, visualizationDuration, getInterface, ...props }) {

    const identifier = 15
    const graphViewInterface = useRef()
    const thisInterface = useRef()

    const initializeInterfaceObject = async () => {
        thisInterface.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
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
                graphViewInterface.current.reset()
                graphViewInterface.current.addActions([{ type: "set", tree: [] }])
            },
            test: async (numberAdded, numberRemoved) => {
                let newNodes = []
                for (let i = 0; i < numberAdded; i++) {
                    newNodes.push(i)
                }

                newNodes.sort(() => Math.random() - 0.5)
                for (let newNode of newNodes) {
                    let data = await avlInsert({ identifier: identifier, key: newNode })
                    graphViewInterface.current.addActions(data)
                }

                newNodes.sort(() => Math.random() - 0.5)
                for (let i = 0; i < numberRemoved; i++) {
                    let data = await avlRemove({ identifier: identifier, key: newNodes[i] })
                    graphViewInterface.current.addActions(data)
                }
            }
        }
        getInterface(thisInterface.current)
        graphViewInterface.current.addActions([{ type: "set", tree: await getTree(identifier) }])

        graphViewInterface.current.getCy().nodes().ungrabify()

        return thisInterface.current
    }


    let viewportStyle = style || {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "dagre",
        animate: true,
        animationDuration: visualizationDuration * 750
    }

    let stylesheet = [
        {
            selector: 'node',
            style: {
                content: 'data(id)',
                "background-color": "white",
                "border-color": "black",
                'border-width': 2,
                "text-valign": "center",
                "text-halign": "center"
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': "lightblue",
            }
        },
        {
            selector: '.new_node',
            style: {
                'background-color': "#2AAA8A",
            }
        },
        {
            selector: '.removal',
            style: {
                'color': 'white',
                'background-color': "#880808",
            }
        },
        {
            selector: '.search',
            style: {
                'border-color': "black",
                'background-color': "black",
                'color': "white",
                'border-width': 3,
            }
        },
        {
            selector: '.found',
            style: {
                'background-color': "#AFE1AF",
                'border-width': 2,
            }
        },
        {
            selector: '.rotation',
            style: {
                'border-color': "orange",
                'border-width': 2,
            }
        },
        {
            selector: '.replacement',
            style: {
                'border-color': "orange",
                'border-width': 3,
            }
        },
        {
            selector: '.fixup_traversal',
            style: {
                'border-color': "black",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        },
        {
            selector: '.fixup',
            style: {
                'border-color': "orange",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        }]

    return <GraphView
        stylesheet={stylesheet}
        style={viewportStyle}
        layout={layout}
        getInterface={(interfceObj) => { graphViewInterface.current = interfceObj; initializeInterfaceObject() }}
        visualizationDuration={visualizationDuration}
        actionHandler={actionHandler}
        actionHandlerArgs={{ onMessage: props.onMessage }} />;
}



async function actionHandler({ getCy, setGraph, getGraph, action, ...props }) {
    let actionType = action.type
    let visualizationDuration = props.getVisualizationDuration?.()


    if (action.old_tree) {
        setGraph(action.old_tree)
    }
    action.old_tree = getGraph()

    if (action.message) {
        props.onMessage?.(action.message)
    }

    let cy = getCy()

    if (actionType === "mark_nodes") {
        assignClassToNodes(action.nodes, action.reason, cy)
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 500)
    }


    if (actionType === "refresh_state") {
        setGraph(convertTreeToCytoscapeElements(action.tree, cy))
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "final_tree") {
        clearAllClasses(cy)
        if (action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
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
    clearAllClasses(cy)

    let elements = []
    for (const node of nodesWithClass) {
        const cyNode = cy.getElementById(node)
        cyNode.addClass(classes)
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