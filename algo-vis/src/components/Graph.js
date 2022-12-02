import { useRef } from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose"
import { topsort } from "../requests";
import GraphView from "./GraphView";

cytoscape.use(fcose);


export default function Graph(props) {

    const graphViewInterface = useRef()
    const interfaceObj = useRef()
    const data = useRef()

    const initializeInterfaceObject = () => {
        interfaceObj.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
            getGraph: () => data.current,
            initializeGraph: (edges) => {
                let nodes = []
                for(let edge of edges) {
                    for(let edgeNode of edge) {
                        if(!nodes.includes(edgeNode)) {
                            nodes.push(edgeNode)
                        }
                    }
                }
                graphViewInterface.current.addActions([{ action: "set", graph: {nodes, edges} }])
            },
            generateGraph: (countOfNodes, countOfEdges) => {
                data.current = generateGraph(countOfNodes, countOfEdges)
                graphViewInterface.current.addActions([{ action: "set", graph: data.current }])
                return data.current;
            },
            topsort: (startNode) => { startTopSort(data.current, startNode, graphViewInterface) }
        }
        props.getInterfaceObject(interfaceObj.current)

        return interfaceObj.current
    }


    let style = props.style || {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "fcose",
        animate: true
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
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        },
        {
            selector: '.selectedEdge',
            style: {
                'line-color': "black",
            }
        },
        {
            selector: '.traversed',
            style: {
                'background-color': "yellow",
            }
        },
        {
            selector: '.path',
            style: {
                'border-color': "orange",
                'border-width': 3,
            }
        },
        {
            selector: '.selected',
            style: {
                'border-color': "black",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        },
        {
            selector: '.finished',
            style: {
                'background-color': "#AFE1AF",
                'border-width': 2,
            }
        },
        {
            selector: '.cycle',
            style: {
                'color': 'white',
                'background-color': "#880808",
            }
        }]

    return <GraphView
        stylesheet={stylesheet}
        style={style}
        layout={layout}
        getInterfaceObject={(obj) => { graphViewInterface.current = obj; initializeInterfaceObject() }}
        visualizationDuration={props.visualizationDuration}
        actionHandler={actionHandler} 
        actionHandlerArgs={{ onNewTraversedArray: props.onNewTraversedArray }}/>;
}




function generateGraph(countOfNodes, countOfConnections) {
    let nodes = []
    for (let i = 0; i < countOfNodes; i++) {
        nodes.push(i)
    }

    function includesEdge(arrayOfEdges, edge) {
        if (!edge) return false

        for (let edgeInArray of arrayOfEdges) {
            if (edgeInArray[0] === edge[0] && edgeInArray[1] === edge[1]) {
                return true
            }
        }

        return false
    }

    let edges = []
    for (let i = 0; i < countOfConnections; i++) {
        let newEdge = null

        do {
            let node1Index = Math.floor(Math.random() * (nodes.length - 1))
            let node2Index = node1Index + 1 + Math.floor(Math.random() * (nodes.length - node1Index - 1))
            newEdge = [nodes[node1Index], nodes[node2Index]]
        } while (includesEdge(edges, newEdge))

        edges.push(newEdge)
    }

    return { nodes, edges }
}

async function startTopSort(graph, startNode, controlObj) {
    let data = await topsort(graph.edges, startNode)
    controlObj.current?.addActions(data)
}




async function actionHandler({ action, ...props }) {
    let actionType = action.action
    let visualizationDuration = props.getVisualizationDuration?.()

    let cy = props.getCy()
    if (actionType === "step") {
        let nodeClasses = {
            selected: action.selected,
            selectedEdge: action.selected_edge,
            path: action.path,
            traversed: action.traversed,
        }

        props.onNewTraversedArray?.(action.traversed)

        assignClassToNodes(nodeClasses, cy)
        if (!action.handled) await delay(visualizationDuration * 1000)
    }

    if (actionType === "set") {
        props.setGraph(convertToCyFormat(action.graph, cy))
    }

    if (actionType === "final_array") {
        clearAllClasses(cy)
        for (let cyNode of cy.elements()) {
            cyNode.addClass("finished")
        }
        if (!action.handled) await delay(visualizationDuration * 1000)
    }

    if (actionType === "found_cycle") {
        clearAllClasses(cy)
        for (let pathNode of action.traverse_stack) {
            let cyNode = cy.getElementById(pathNode)
            cyNode.addClass("cycle")
        }
        props.onNewTraversedArray?.(`Graph is not acyclic. Cycle ${action.traverse_stack} was found`)
    }

    action.handled = true
}

function convertToCyFormat(graph, cy) {

    if (!graph) {
        return {}
    }

    for (const node of cy.elements()) {
        node.removeClass(node.classes())
    }

    let elements = []

    if (graph.nodes) {
        for (const node of graph.nodes) {
            elements.push({ data: { id: node, label: `${node}` }, classes: null })
        }
    }

    if (graph.edges) {
        for (const edge of graph.edges) {
            elements.push({ data: { id: `${edge[0]} ${edge[1]}`, source: edge[0], target: edge[1] } })
        }
    }

    return elements;
}

function assignClassToNodes(nodeClasses, cy) {
    clearAllClasses(cy)

    let selected = cy.getElementById(nodeClasses.selected)
    selected.removeClass("path")
    selected.addClass("selected")

    let selectedEdge = cy.getElementById(`${nodeClasses.selectedEdge[0]} ${nodeClasses.selectedEdge[1]}`)
    selectedEdge.addClass("selectedEdge")

    for (let pathNode of nodeClasses.path) {
        if (pathNode !== parseInt(selected.id())) {
            let cyNode = cy.getElementById(pathNode)
            cyNode.addClass("path")
        }
    }

    for (let pathNode of nodeClasses.traversed) {
        let cyNode = cy.getElementById(pathNode)
        cyNode.removeClass(cyNode.classes())
        cyNode.addClass("traversed")
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
