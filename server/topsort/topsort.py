from typing import Any, List, Tuple, Callable, Dict

class ActionLogger:
    def __init__(self):
        self._action_list = []

    def add(self, action: Any):
        self._action_list.append(action)

    def new_step(self, selected_node, selected_edge, traversal_path, traversed):
        self.add({"action": "step",  "selected": selected_node, "selected_edge": selected_edge, "path": list(traversal_path), "traversed": list(traversed)})

    def final_array(self, final_array):
        self.add({"action": "final_array",  "array": final_array})
    
    def found_cycle(self, traverse_stack):
        self.add({"action": "found_cycle", "traverse_stack": traverse_stack})


    def read_all(self) -> List[Any]:
        return_list = self._action_list
        self._action_list = []
        return return_list

def topsort(edges, start):
    
    logger =  ActionLogger()

    nodes = []
    for edge in edges:
        for node in edge: 
            if node in nodes:
                continue
            nodes.append(node)
            
            if node != start:
                continue
            nodes[0], nodes[-1] = nodes[-1], nodes[0]
    
    traversed_nodes = []


    for node in nodes:
        if node not in traversed_nodes:
            visited = []
            traverse_stack = [node]

            current_node = None
            while len(traverse_stack) > 0:
                parent_node = current_node
                current_node = traverse_stack[-1]
                logger.new_step(current_node,[parent_node, current_node], traverse_stack, traversed_nodes)



                found_unvisited = False
                for edge in edges:
                    if edge[0] == current_node:
                        if edge[1] in traverse_stack:
                            logger.found_cycle(traverse_stack)
                            return None, logger
                        if edge[1] not in traversed_nodes and edge[1] not in visited:
                            traverse_stack.append(edge[1])
                            found_unvisited = True
                            break

                if not found_unvisited:
                    traverse_stack.pop()
                    traversed_nodes.insert(0, current_node)
                
                visited.append(current_node)
    
    logger.new_step(None, [], [], traversed_nodes)
    logger.final_array(traversed_nodes)

    return traversed_nodes, logger


if __name__ ==  "__main__":
    print(topsort([[1, 2],  [1, 3], [1, 4], [3, 2], [2, 4], [3, 6], [6, 4]], 3))



