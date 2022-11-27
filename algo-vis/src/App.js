import './App.css';
import AVLTree from './components/AVLTree';
import Graph from './components/Graph';
import { Route, Routes } from "react-router-dom"
import Home from './components/Home';
import { avlClear, avlGetItem, avlInsert, avlRemove, getTree } from './requests';
import { useEffect, useRef, useState } from 'react';

const identifier = 15

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {

  const input = useRef()


  const [graph, setGraph] = useState({
    nodes: [],
    edges: []
  })

  useEffect(() => {
    async function tree() {
      let tree = await getTree(identifier)
      setGraph(tree)
    }
    tree()
  }, [])


  async function find() {
    let input_value = parseInt(input.current.value)
    let data = await avlGetItem(identifier, input_value)

    for(let action of data) {
      if(action.key) {
        setGraph({...graph, selected: action.key})
        await delay(500)
      }
      if(action.action == "error") {
        setGraph({...graph, selected: null})
      }
    }
  }
  

  async function append() {
    let input_value = parseInt(input.current.value)
    let data = await avlInsert({identifier: identifier, key: input_value})

    for(let action of data) {
      if(action.key) {
        setGraph({...graph, selected: action.key})
        await delay(500)
      }
      if(action.tree) {
        setGraph(action.tree)
        await delay(1000)
      }
    }
    
    setGraph(data[data.length - 1].tree)
  }

  async function remove() {
    let input_value = parseInt(input.current.value)
    let data = await avlRemove({identifier: identifier, key: input_value})
    
    for(let action of data) {
      if(action.key) {
        setGraph({...graph, selected: action.key})
        await delay(500)
      }
      if(action.tree) {
        setGraph(action.tree)
        await delay(1000)
      }
    }

    setGraph(data[data.length - 1].tree)
  }

  function clear() {
    avlClear(identifier)
    setGraph({
      nodes: [],
      edges: [],
      selected: null
    })
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <Home/>
        } />
        <Route path="/topological-sort" element={
          <Graph
            nodes={[1, 2, 3, 4, 5]}
            edges={[
              [2, 4],
              [2, 5],
              [1, 2],
              [1, 3],
            ]}
          />
        } />
        <Route path="/avl-tree" element={
          <>
            <button onClick={find}>find</button>
            <button onClick={append}>insert</button>
            <button onClick={remove}>remove</button>
            <button onClick={clear}>clear</button>
            <input ref={input}/>

            <AVLTree
              nodes={graph.nodes}
              edges={graph.edges}
              selected={graph.selected}
            />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
