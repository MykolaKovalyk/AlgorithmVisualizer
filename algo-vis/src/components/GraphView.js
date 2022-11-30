import { useEffect, useState, useRef } from "react";
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

    useEffect(() => {
        eventHandler.current = new EventHandler(
            async (action) => 
                await props.actionHandler(
                    {
                        visualizationSpeed: props.visualizationSpeed,
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
            getCy: () => cyRef.current,
            setGraph: setGraph,
            getGraph: () => graphRef.current
        })

        return () => eventHandler.current.stop()
    }, [])

    useEffect(() => {
        if(!props.layout) return;

        let layoutObject = cy?.elements().makeLayout(props.layout);
        layoutObject?.run()
    }, [JSON.stringify(graph)])


    return <CytoscapeComponent 
                elements={graph} 
                stylesheet={props.stylesheet}
                style={props.style} 
                layout={props.layout}
                cy={setCy}
            />;
}