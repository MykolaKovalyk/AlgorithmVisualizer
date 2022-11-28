from typing import Any, List, Tuple, Callable, Dict

class ActionLogger:
    def __init__(self):
        self._action_list = []

    def add(self, action: Any):
        self._action_list.append(action)

    def new_step(self, selected_node, traversal_path, traversed):
        self.add({"action": "step",  "selected": selected_node, "path": traversal_path, "traversed": traversed})

    def final_array(self, final_array):
        self.add({"action": "final_array",  "array": final_array})


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
            backtracked_way = []
            visited = []
            traverse_stack = [node]

            while len(traverse_stack) > 0:
                current_node = traverse_stack[-1]

                logger.new_step(current_node, traverse_stack, traversed_nodes)

                found_unvisited = False
                for edge in edges:
                    if edge[0] == current_node:
                        if edge[1] not in traversed_nodes and edge[1] not in visited:
                            traverse_stack.append(edge[1])
                            found_unvisited = True
                            break

                if not found_unvisited:
                    traverse_stack.pop()
                    traversed_nodes.insert(0, current_node)
                
                visited.append(current_node)
    

    logger.final_array(traversed_nodes)

    return traversed_nodes, logger


if __name__ ==  "__main__":
    print(topsort([[1, 2],  [1, 3], [1, 4], [3, 2], [2, 4], [3, 6], [6, 4]], 3))



