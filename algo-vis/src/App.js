import './App.css';
import AVLTree from './components/AVLTree';
import Graph from './components/Graph';
import { Route, Routes, useLocation } from "react-router-dom"
import Home from './components/Home';
import { avlClear, avlGetItem, avlInsert, avlRemove, getTree, topsort } from './requests';
import { useEffect, useRef, useState } from 'react';

const identifier = 15


function App() {

  const input = useRef()
  const treeControl = useRef()
  const graphControl = useRef()

  function initializeGraph() {
    graphControl.current.generateGraph()
  }

  function topsort() {
    graphControl.current.topsort()
  }


  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <Home />
        } />
        <Route path="/topological-sort" element={
          <div style={{ height: "600px" }}>
            <button onClick={topsort}>find</button>
            <button onClick={() => graphControl.current.pause()}>pause</button>
            <button onClick={() => graphControl.current.resume()}>resume</button>
            <button onClick={() => graphControl.current.stepBack()}>back</button>
            <button onClick={() => graphControl.current.stepForward()}>forward</button>
            <Graph
              getInterfaceObject={(object) => { graphControl.current = object; initializeGraph() }}
            />
          </div>
        } />
        <Route path="/avl-tree" element={
          <>
            <button onClick={() => treeControl.current.pause()}>pause</button>
            <button onClick={() => treeControl.current.resume()}>resume</button>
            <button onClick={() => treeControl.current.stepBack()}>back</button>
            <button onClick={() => treeControl.current.stepForward()}>forward</button>
            <button onClick={() => treeControl.current.find(parseInt(input.current.value))}>find</button>
            <button onClick={() => treeControl.current.insert(parseInt(input.current.value))}>insert</button>
            <button onClick={() => treeControl.current.remove(parseInt(input.current.value))}>remove</button>
            <button onClick={() => treeControl.current.clear()}>clear</button>
            <button onClick={() => treeControl.current.test()}>test</button>

            <input ref={input} />

            <div style={{ height: "600px" }}>
              <AVLTree
                getInterfaceObject={(object) => { treeControl.current = object }}
              />
            </div>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
