import './App.css';
import AVLTree from './components/AVLTree';
import Graph, {generateGraph} from './components/Graph';
import { Route, Routes, useLocation } from "react-router-dom"
import Home from './components/Home';
import { avlClear, avlGetItem, avlInsert, avlRemove, getTree, topsort } from './requests';
import { useEffect, useRef, useState } from 'react';

const identifier = 15

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {

  const input = useRef()
  const addActions = useRef()
  const addActionsGraph = useRef()
  const location = useLocation();



  const [graph, setGraph] = useState()

  useEffect(() => {
    async function tree() {
      let tree = await getTree(identifier)
      addActions.current?.([{action: "set", tree:tree}])
    }
    tree()

    let newGraph = generateGraph(20, 40)
    setGraph(newGraph)

    addActionsGraph.current?.([{action: "set", graph: newGraph}])

  }, [location.key])


  async function find() {
    let input_value = parseInt(input.current.value)
    let data = await avlGetItem(identifier, input_value)

    addActions.current(data)
  }
  
  async function testAppend() {
    let newNodes = []

    for(let i = 0; i < 50;  i++) {
      newNodes.push(i)
    }

    newNodes.sort(() => Math.random() - 0.5)

    for(let newNode of newNodes) {
      let data = await avlInsert({identifier: identifier, key: newNode})
      addActions.current(data)
    }

    newNodes = newNodes.filter(() => Math.random() > 0.8)

    for(let newNode of newNodes) {
      let data = await avlRemove({identifier: identifier, key: newNode})
      addActions.current(data)
    }
  }

  async function append() {
    let input_value = parseInt(input.current.value)
    let data = await avlInsert({identifier: identifier, key: input_value})

    
    addActions.current(data)
  }

  async function remove() {
    let input_value = parseInt(input.current.value)
    let data = await avlRemove({identifier: identifier, key: input_value})

    addActions.current(data)

  }

  function clear() {
    avlClear(identifier)
    addActions.current([{action: "set", tree: {}}])
  }

  async function startTopSort() {
    let data = await topsort(graph.edges, 4)
    addActionsGraph.current(data)
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <Home/>
        } />
        <Route path="/topological-sort" element={
          <div style={{height: "600px"}}>
            <button onClick={startTopSort}>find</button>
            <Graph
            getAddActions={(addActionsCbck)=> { addActionsGraph.current = addActionsCbck} }
            />
          </div>
        } />
        <Route path="/avl-tree" element={
          <>
            <button onClick={find}>find</button>
            <button onClick={append}>insert</button>
            <button onClick={remove}>remove</button>
            <button onClick={clear}>clear</button>
            <button onClick={testAppend}>test</button>
            
            <input ref={input}/>

            <div style={{height: "600px"}}>
            <AVLTree
              getAddActions={(addActionsCbck)=> { addActions.current = addActionsCbck} }
            />
            </div>

          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
