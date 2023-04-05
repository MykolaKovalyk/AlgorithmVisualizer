import { useRef } from "react"
import cytoscape from "cytoscape"
import fcose from "cytoscape-fcose"
import { topsort } from "../algorithms/topsort"
import GraphView from "./GraphView"
import { toCytoscapeElements, assignClassesToElements, clearAllClasses, delay } from "./HelperFunctions"


const MAX_COUNT_OF_NODES = 1000
const MAX_COUNT_OF_EDGES_PER_NODE = 999

cytoscape.use(fcose)


export default function Graph(props) {

    const graphViewInterface = useRef()
    const thisInterface = useRef()
    const data = useRef({ nodes: [], edges: [] })


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
                'target-arrow-color': 'black',
                'target-arrow-shape': 'chevron',
                'curve-style': 'bezier'
            }
        },
        {
            selector: '.selected_edge',
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
        getInterface={(interfceObj) => {
            graphViewInterface.current = interfceObj
            initializeInterfaceObject()
        }}
        visualizationDuration={props.visualizationDuration}
        actionHandler={actionHandler}
        actionHandlerArgs={{ onMessage: props.onMessage }} />


    function initializeInterfaceObject() {
        thisInterface.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
            clear: () => {
                graphViewInterface.current.reset()
                data.current = { nodes: [], edges: [] }
                graphViewInterface.current.addActions([{ type: "set", graph: data.current }])
            },
            getGraph: () => data.current,
            setGraph: (edges) => {
                let nodes = []
                for (let edge of edges) {
                    for (let edgeNode of edge) {
                        if (!nodes.includes(edgeNode)) {
                            nodes.push(edgeNode)
                        }
                    }
                }

                checkDataValidity(nodes, edges)
                data.current = { nodes, edges }

                graphViewInterface.current.addActions([{ type: "set", graph: data.current }])
            },
            generateGraph: (countOfNodes, minCountOfEdges, maxCountOfEdges) => {
                let { nodes, edges } = generateGraph(countOfNodes, minCountOfEdges, maxCountOfEdges)

                checkDataValidity(nodes, edges)
                data.current = { nodes, edges }

                graphViewInterface.current.addActions([{ type: "set", graph: data.current }])
                return data.current
            },
            topsort: (startNode) => { topologicalSort(data.current, startNode, graphViewInterface) }
        }

        graphViewInterface.current.addActions([{ type: "set", graph: { nodes: [], edges: [] } }])
        props.getInterfaceObject(thisInterface.current)

        return thisInterface.current
    }

    function checkDataValidity(nodes, edges) {

        if (nodes.length > MAX_COUNT_OF_NODES) {
            throw new Error(`Count of nodes can't be greater than ${MAX_COUNT_OF_NODES}`)
        }

        let edgeCountPerNode = {}


        for (let node of nodes) {
            edgeCountPerNode[node] = 0
        }

        for (let node of nodes) {
            for (let edge of edges) {
                if (edge[0] === node) {
                    edgeCountPerNode[edge[0]]++
                } else if (edge[1] === node) {
                    edgeCountPerNode[edge[1]]++
                }
            }
        }

        for (let node in edgeCountPerNode) {
            if (edgeCountPerNode[node] > MAX_COUNT_OF_EDGES_PER_NODE) {
                throw new Error(`Count of edges per single node can't be greater than ${MAX_COUNT_OF_EDGES_PER_NODE}`)
            }
        }
    }

    function generateGraph(countOfNodes, minCountOfEdgesPerNode, maxCountOfEdgesPerNode) {
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

        for (let sourceNodeIndex = 0; sourceNodeIndex < nodes.length; sourceNodeIndex++) {
            let countOfEdges = Math.min(
                minCountOfEdgesPerNode + Math.floor(Math.random() * (maxCountOfEdgesPerNode - minCountOfEdgesPerNode)),
                nodes.length - sourceNodeIndex - 1
            )

            for (let i = 0; i < countOfEdges; i++) {
                let newEdge = null
                do {
                    let targetNodeIndex = sourceNodeIndex + 1 + Math.floor(Math.random() * (nodes.length - sourceNodeIndex - 1))
                    newEdge = [nodes[sourceNodeIndex], nodes[targetNodeIndex]]
                } while (includesEdge(edges, newEdge))
                edges.push(newEdge)
            }
        }

        return { nodes, edges }
    }

    async function topologicalSort(graph, startNode, controlObj) {
        let data = topsort(graph.edges, startNode)
        controlObj.current?.addActions(data)
    }
}


async function actionHandler({ getCy, setGraph, getVisualizationDuration, action, ...props }) {
    let actionType = action.type
    let visualizationDuration = getVisualizationDuration()
    let cy = getCy()


    if (actionType === "set") {
        clearAllClasses(cy)
        setGraph(toCytoscapeElements(action.graph, true))
    }

    if (actionType === "step") {
        clearAllClasses(cy)

        assignClassesToElements([action.selected], "selected", cy)
        assignClassesToElements([`${action.selected_edge[0]} ${action.selected_edge[1]}`], "selected_edge", cy)
        assignClassesToElements(action.traversed, "traversed", cy)

        if (action.path) {
            assignClassesToElements(action.path.filter((element) => element !== action.selected), "path", cy)
        }

        props.onMessage?.(JSON.stringify(action.traversed))

        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "final_array") {
        clearAllClasses(cy)
        for (let cyNode of cy.elements()) {
            cyNode.addClass("finished")
        }
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "found_cycle") {
        clearAllClasses(cy)
        assignClassesToElements(action.traverse_stack, "cycle", cy)
        props.onMessage?.(`Graph is not acyclic. Cycle [${action.traverse_stack}] was found`)
    }


    action.handled = true
}
