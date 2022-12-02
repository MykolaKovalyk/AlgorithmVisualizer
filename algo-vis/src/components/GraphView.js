import { useEffect, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./utilities/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import fcose from "cytoscape-fcose"

cytoscape.use(fcose);

export default function GraphView(props) {

    const [graph, setGraph, graphRef] = useStateRef()
    const [cy, setCy, cyRef] = useStateRef()
    const eventHandler = useRef()
    const visualizationDuration = useRef()

    visualizationDuration.current = props.visualizationDuration

    useEffect(() => {
        eventHandler.current = new EventHandler(
            async (action) =>
                await props.actionHandler(
                    {
                        getVisualizationDuration: () => { return visualizationDuration.current },
                        action: action,
                        getCy: () => cyRef.current,
                        setGraph: setGraph,
                        getGraph: () => graphRef.current,
                        ...props.actionHandlerArgs
                    }))

        eventHandler.current.start()

        props.getInterfaceObject?.({
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
        })

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
}