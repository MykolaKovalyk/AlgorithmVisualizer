class ActionLogger {
  #actionList = [];

  add(action) {
    this.#actionList.push(action);
  }

  newStep(selectedNode, selectedEdge, traversalPath, traversed) {
    this.add({
      type: "step",
      selected: selectedNode,
      selected_edge: selectedEdge,
      path: [...traversalPath],
      traversed: [...traversed],
    });
  }

  finalArray(finalArray) {
    this.add({
      type: "final_array",
      array: [...finalArray],
    });
  }

  foundCycle(traverseStack) {
    this.add({
      type: "found_cycle",
      traverse_stack: [...traverseStack],
    });
  }

  readAll() {
    const returnList = this.#actionList;
    this.#actionList = [];
    return returnList;
  }

}

export const topsort = (edges, start) => {
  const logger = new ActionLogger();

  const nodes = [];
  for (const edge of edges) {
    for (const node of edge) {
      if (nodes.includes(node)) {
        continue;
      }
      nodes.push(node);

      if (node !== start) {
        continue;
      }
      [nodes[0], nodes[nodes.length - 1]] = [nodes[nodes.length - 1], nodes[0]];
    }
  }

  const traversedNodes = [];

  for (const node of nodes) {
    if (!traversedNodes.includes(node)) {
      const visited = [];
      const traverseStack = [node];

      let currentNode = null;
      while (traverseStack.length > 0) {
        const parent_node = currentNode;
        currentNode = traverseStack[traverseStack.length - 1];
        logger.newStep(currentNode, [parent_node, currentNode], traverseStack, traversedNodes);

        let foundUnvisited = false;
        for (const edge of edges) {
          if (edge[0] === currentNode) {
            if (traverseStack.includes(edge[1])) {
              const cycle = traverseStack.slice(traverseStack.indexOf(edge[1]));
              logger.foundCycle(cycle);
              return logger.readAll();
            }
            if (!traversedNodes.includes(edge[1]) && !visited.includes(edge[1])) {
              traverseStack.push(edge[1]);
              foundUnvisited = true;
              break;
            }
          }
        }

        if (!foundUnvisited) {
          traverseStack.pop();
          traversedNodes.unshift(currentNode);
        }

        visited.push(currentNode);
      }
    }
  }

  logger.newStep(null, [], [], traversedNodes);
  logger.finalArray(traversedNodes);
  return logger.readAll();
}

export const testTopsort = () => {
  console.log(topsort([[1, 2], [1, 3], [1, 4], [3, 2], [2, 4], [3, 6], [6, 4]], 3));
}