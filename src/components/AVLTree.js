import { useRef } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import GraphView from "./GraphView";
import { getTree, avlFind, avlInsert, avlRemove, avlClear } from "../algorithms/tree";
import { toCytoscapeElements, assignClassesToElements, clearAllClasses, delay } from "./HelperFunctions"


cytoscape.use(dagre);


export default function AVLTree({ style, visualizationDuration, getInterface, ...props }) {

    const graphViewInterface = useRef()
    const thisInterface = useRef()


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


    async function initializeInterfaceObject() {
        thisInterface.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
            insert: (node) => {
                let data = avlInsert(node)
                graphViewInterface.current.addActions(data)
            },
            remove: (node) => {
                let data = avlRemove(node)
                graphViewInterface.current.addActions(data)
            },
            find: (node) => {
                let data = avlFind(node)
                graphViewInterface.current.addActions(data)
            },
            clear: () => {
                avlClear()
                graphViewInterface.current.reset()
                graphViewInterface.current.addActions([{ type: "set", tree: [] }])
            },
            test: (numberAdded, numberRemoved) => {
                let newNodes = []
                for (let i = 0; i < numberAdded; i++) {
                    newNodes.push(i)
                }

                newNodes.sort(() => Math.random() - 0.5)
                for (let newNode of newNodes) {
                    let data = avlInsert(newNode)
                    graphViewInterface.current.addActions(data)
                }

                newNodes.sort(() => Math.random() - 0.5)
                for (let i = 0; i < numberRemoved; i++) {
                    let data = avlRemove(newNodes[i])
                    graphViewInterface.current.addActions(data)
                }
            }
        }
        getInterface(thisInterface.current)

        graphViewInterface.current.addActions([{ type: "set", tree: getTree() }])

        graphViewInterface.current.getCy().nodes().ungrabify()

        return thisInterface.current
    }
}


async function actionHandler({ getCy, setGraph, getGraph, action, ...props }) {
    let actionType = action.type
    let visualizationDuration = props.getVisualizationDuration?.()
    let cy = getCy()


    if (action.old_tree) {
        setGraph(action.old_tree)
    }
    action.old_tree = getGraph()

    if (action.message) {
        props.onMessage?.(action.message)
    }


    if (actionType === "mark_nodes") {
        clearAllClasses(cy)
        assignClassesToElements(action.nodes, action.reason, cy)
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 500)
    }

    if (actionType === "refresh_state") {
        setGraph(toCytoscapeElements(action.tree))
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "final_tree") {
        clearAllClasses(cy)
        if (action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "set") {
        setGraph(toCytoscapeElements(action.tree))
    }


    action.handled = true
}