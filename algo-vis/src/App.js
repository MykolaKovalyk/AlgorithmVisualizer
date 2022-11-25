import './App.css';
import AVLTree from './components/AVLTree';
import Graph from './components/Graph';
import { Route, Routes } from "react-router-dom"
import Home from './components/Home';

function App() {
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
          <AVLTree
            nodes={[1, 2, 3, 4, 5]}
            edges={[
              [1, 2],
              [1, 3],
              [2, 4],
              [2, 5],
            ]}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
