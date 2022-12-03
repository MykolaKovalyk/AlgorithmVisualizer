import { useEffect, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./utilities/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import fcose from "cytoscape-fcose"

cytoscape.use(fcose);

export default function GraphView({ getInterface, visualizationDuration, actionHandler, actionHandlerArgs, ...props }) {

    const thisInterface = useRef()
    const eventHandler = useRef()
    const animationStepDuration = useRef()

    const [graph, setGraph, graphRef] = useStateRef()
    const [cy, setCy, cyRef] = useStateRef()

    animationStepDuration.current = visualizationDuration

    useEffect(() => {
        eventHandler.current = new EventHandler(handleAction)

        eventHandler.current.start()

        thisInterface.current = {
            addActions: eventHandler.current.addEvents.bind(eventHandler.current),
            pauseHandler: eventHandler.current.pause.bind(eventHandler.current),
            resumeHandler: eventHandler.current.resume.bind(eventHandler.current),
            stepBack: eventHandler.current.back.bind(eventHandler.current),
            stepForward: eventHandler.current.forward.bind(eventHandler.current),
            reset: eventHandler.current.dropBufferedEvents.bind(eventHandler.current),
            getCy: () => cyRef.current,
            getHandler: () => eventHandler.current,
            setGraph: setGraph,
            getGraph: () => graphRef.current
        }

        getInterface(thisInterface.current)
        return () => eventHandler.current.stop()
    }, [])

    useEffect(() => {
        if (!props.layout) return;

        let layoutObject = cy?.elements().makeLayout(props.layout);
        layoutObject?.run()
    }, [JSON.stringify(graph)])


    return <CytoscapeComponent
        elements={graph}
        stylesheet={props.stylesheet}
        style={props.style}
        layout={props.layout}
        maxZoom={2}
        minZoom={0.25}
        cy={setCy}
    />;


    function handleAction(action) {
        return actionHandler(
            {
                getVisualizationDuration: () => { return animationStepDuration.current },
                action: action,
                getCy: thisInterface.current.getCy,
                setGraph: thisInterface.current.setGraph,
                getGraph: thisInterface.current.getGraph,
                ...actionHandlerArgs
            })
    }
}