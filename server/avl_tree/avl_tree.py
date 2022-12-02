from __future__ import annotations
from typing import Any, List, Tuple, Callable, Dict
NULL = None

class AVLTree:

    class Node:

        def __init__(self, key: Any):

            self.key = key
            self.value = None

            self.left = None
            self.right = None
            self.parent = None

            self.height = 1

        def is_right(self):
            if self.parent is NULL:
                return None

            return self is self.parent.right

        def get_balance(self):
            return self.left.height - self.right.height

    def __init__(self):

        global NULL

        if NULL is None:
            NULL = AVLTree.Node(None)
            NULL.height = 0

        self.root = NULL
        self._size = 0
        self._logger = ActionLogger(self)

    def __getitem__(self, key):

        found_node = self._find_node_by_key(key)
        return found_node.value if found_node is not NULL else None

    def __setitem__(self, key: Any, value: Any):
        found_node = self._add_or_find_node_by_key(key, new_only=False)
        found_node.value = value

    def __str__(self):

        final_string = ""

        for item in self._to_list_of_nodes():

            current_parent = item.parent
            identation = 0
            while current_parent is not NULL:
                identation += 1
                current_parent = current_parent.parent

            final_string += f"\n{'-' * identation} {'r' if item.is_right() else 'l'} [{hash(item.key)}] {item.key}"

        return final_string

    def insert(self, key: Any, value: Any):
        node = self._find_node_by_key(key)

        if node is NULL:
            raise ValueError(f'Entry with the key "{key}" was not found.')
        
        node.value = value
    
    def append(self, key: Any, value: Any):
        node = self._add_or_find_node_by_key(key, new_only=True)
        node.value = value

    def remove(self, key: Any) -> Any:

        found_node = self._find_node_by_key(key)

        if found_node is NULL:
            return None

        value = found_node.value
        self._remove_node(found_node)
        return value

    def remove_by(self, predicate: Callable[[Any, Any], bool]) -> List[(Any, Any)]:

        list_to_remove = self.get_by(predicate)

        for key, item in list_to_remove:
            self.remove(key)

        return list_to_remove

    def get_by(self, predicate: Callable[[Any, Any], bool]) -> List[(Any, Any)]:
        return [(x.key, x.value) for x in self._to_list_of_nodes() if predicate(x.key, x.value)]

    def top_to_bottom_list(self) -> List[(Any, Any)]:
        return [(x.key, x.value) for x in self._to_list_of_nodes()]

    def size(self) -> int:
        return self._size

    def _to_list_of_nodes(self) -> List[AVLTree.Node]:
        result = []

        self._to_list_of_nodes_and_edges(result, None)

        return result

    def _to_list_of_nodes_and_edges(self, result_nodes: List[Any], result_edges: List[Any]) -> Tuple[List[AVLTree.Node], List[Tuple[AVLTree.Node, AVLTree.Node]]]:
        if self.root is NULL:
            return [], []
        
        traversal_queue = [self.root]

        while len(traversal_queue) > 0:
            
            current_node = traversal_queue.pop(0)
            if result_nodes is not None:
                result_nodes.append(current_node)
            if result_edges is not None:
                if current_node is not NULL and current_node is not None:
                    if current_node.parent is not NULL:
                        result_edges.append((current_node.parent, current_node))

            if current_node.left is not NULL:
                traversal_queue.append(current_node.left)
            if current_node.right is not NULL:
                traversal_queue.append(current_node.right)
        
        return result_nodes, result_edges

    def to_json(self) -> Dict[str, List[Any]]:
        nodes = []
        edges = []
        self._to_list_of_nodes_and_edges(nodes, edges)
        nodes = [node.key for node in nodes] if nodes is not None else None
        edges = [(parent.key, child.key) for parent, child in edges] if edges is not None else None

        return_dict = {
            "nodes": nodes,
            "edges": edges
        }

        return return_dict


    def _find_node_by_key(self, key: Any) -> AVLTree.Node:

        current_node = self.root

        while current_node is not NULL and key != current_node.key:
            
            # notify about search
            self._logger.mark_nodes([current_node.key], "search", f"Searching for node {key} at {current_node.key}...")

            right_node = hash(key) > hash(current_node.key)
            current_node = current_node.right if right_node else current_node.left

        if current_node is not NULL:
            # notify which node the search is finished at
            self._logger.mark_nodes([current_node.key], "found", f"Node {key} was found!")
        else:
            # notify that node was not found
            self._logger.error(f"Node with the key {key} was not found.")


        return current_node

    def _add_or_find_node_by_key(self, key: Any, new_only: bool) -> AVLTree.Node:

        current_node = self.root
        node_parent = NULL
        right_node = False
        
        while current_node is not NULL and key != current_node.key:

            # notify about search
            self._logger.mark_nodes([current_node.key], "search", f"Searching for node {key} at {current_node.key}...")

            node_parent = current_node
            right_node = hash(key) > hash(current_node.key)
            current_node = current_node.right if right_node else current_node.left


        if current_node is not NULL:

            # notify that node with the specified key was found
            self._logger.mark_nodes([current_node.key], "found", f"Node {key} was found!")
            
            if new_only:
                error_message = f'Entry with the key "{key}" already exists.'
                
                # notify that node already exists, if the task was to create a new one
                self._logger.error(error_message)
                
                raise ValueError(error_message)

        if current_node is NULL:
            current_node = self._new_node(key)

            if self.root is NULL:
                self.root = current_node
            else:
                if right_node:
                    node_parent.right = current_node
                else:
                    node_parent.left = current_node
                current_node.parent = node_parent

            self._size += 1

            # new node was created, notify about it
            self._logger.refresh_state()
            self._logger.mark_nodes([current_node.key], "new_node", f"Node {key} was created!")

            self._fixup(current_node.parent)

        return current_node

    def _new_node(self, key):
        new_node = AVLTree.Node(key)
        new_node.left = new_node.right = new_node.parent = NULL

        return new_node

    def _remove_node(self, node_to_remove: AVLTree.Node) -> AVLTree.Node:
        prune_node = self._replace_node(node_to_remove)
        fixup_node = prune_node.parent

        self._prune_leaf_node(prune_node)

        self._fixup(fixup_node)

    def _replace_node(self, node_to_replace: AVLTree.Node) -> AVLTree.Node:

        replacement = node_to_replace

        if node_to_replace.right is not NULL:
            replacement = self._find_the_smallest_node_in_the_branch(node_to_replace.right)
        elif node_to_replace.left is not NULL:
            replacement = self._find_the_biggest_node_in_the_branch(node_to_replace.left)
        
        if node_to_replace is replacement:
            return node_to_replace

        # log node replacement
        self._logger.mark_nodes([node_to_replace.key, replacement.key], "replacement", f"Node {node_to_replace.key} is replaced by {replacement.key}...")

        node_to_replace.key, replacement.key = replacement.key, node_to_replace.key
        node_to_replace.value, replacement.value = replacement.value, node_to_replace.value

        # log new tree with replaced node
        self._logger.refresh_state()

        return replacement


    def _prune_leaf_node(self, node_to_prune: AVLTree.Node) -> None:
        
        replacement = node_to_prune.left if node_to_prune.left is not NULL else node_to_prune.right
        if node_to_prune.parent is NULL:
            self.root = replacement
        else:
            if node_to_prune.is_right():
                node_to_prune.parent.right = replacement
            else:
                node_to_prune.parent.left = replacement
            if replacement is not NULL:
                replacement.parent = node_to_prune.parent

        self._size -= 1

        # log node replacement
        self._logger.mark_nodes([node_to_prune.key], "removal", f"Node {node_to_prune.key} can be safely removed")
        self._logger.refresh_state()



    def get_max_depth(self):
        depth = 0
        for node in self._to_list_of_nodes():
            if node.left != NULL and node.right != NULL:
                continue

            current_depth = 1
            while node.parent is not NULL:
                node = node.parent
                current_depth += 1
            
            if current_depth > depth:
                depth =  current_depth

        return depth

    def get_min_depth(self):
        depth = self.get_max_depth()
        for node in self._to_list_of_nodes():
            if node.left != NULL and node.right != NULL:
                continue

            current_depth = 1
            while node.parent is not NULL:
                node =  node.parent
                current_depth += 1
            
            if current_depth < depth:
                depth = current_depth

        return depth


    def _fixup(self, node: AVLTree.Node): 
        
        while node is not NULL:

            node.height = 1 + max(node.left.height, node.right.height)

            balanceFactor = node.get_balance()

            # notify which node the search is finished at
            if(abs(balanceFactor) > 1):
                self._logger.mark_nodes([node.key], "fixup", f"Balance factor: {balanceFactor}, Node {node.key} needs fixing!")
            else:
                self._logger.mark_nodes([node.key], "fixup_traversal", f"Balance factor: {balanceFactor}, Node {node.key} doesn't need fixing. Next...")



            if balanceFactor > 1:
                if node.left.get_balance() < 0:
                    self._left_rotate(node.left)
                
                node = self._right_rotate(node)
            elif balanceFactor < -1:
                if node.right.get_balance() > 0:
                    self._right_rotate(node.right)
                
                node = self._left_rotate(node)
            
            node = node.parent



    def _left_rotate(self, node):  
        #        *
        #     /     \
        #    2       5
        #  /   \   /   \
        # 1     3 4     6

        #      |
        #      v

        #           5
        #        /     \
        #       *       6
        #     /   \  
        #    2     4
        #   / \
        #  1   3

        was_right = node.is_right()

        right_node = node.right
        right_left_node = node.right.left
        parent_node = node.parent

        right_node.left = node
        node.right = right_left_node
        
        if parent_node is not NULL:
            if was_right:
                parent_node.right = right_node
            else:
                parent_node.left =  right_node
        else:
            self.root = right_node

        right_node.parent = parent_node
        node.parent = right_node
        right_left_node.parent = node

        node.height = 1 + max(node.left.height, node.right.height)
        right_node.height = 1 + max(right_node.left.height, right_node.right.height)

        # log the rotation
        self._logger.mark_nodes([node.key], "rotation", f"Rotate {node.key} left...")
        self._logger.refresh_state()
        
        return right_node

    def _right_rotate(self, node):

        #        *
        #     /     \
        #    2       5
        #  /   \   /   \
        # 1     3 4     6

        #      |
        #      v

        #           2
        #        /     \
        #       1       *
        #             /   \ 
        #            3     5
        #                 / \
        #                4   6

        was_right = node.is_right()

        left_node = node.left
        left_right_node = node.left.right
        parent_node = node.parent

        left_node.right = node
        node.left = left_right_node
        
        if parent_node is not NULL:
            if was_right:
                parent_node.right = left_node
            else:
                parent_node.left =  left_node
        else:
            self.root = left_node

        left_node.parent = parent_node
        node.parent = left_node
        left_right_node.parent = node

        node.height = 1 + max(node.left.height, node.right.height)
        left_node.height = 1 + max(left_node.left.height, left_node.right.height)

        # log the rotation
        self._logger.mark_nodes([node.key], "rotation", f"Rotate {node.key} right...")
        self._logger.refresh_state()
        
        return left_node

    def _find_the_smallest_node_in_the_branch(self, node: AVLTree.Node) -> AVLTree.Node:

        current_node = node
        while current_node.left is not NULL:
            self._logger.mark_nodes([current_node.key], "search", f"Searching for the smallest node in the branch, currently at {current_node.key}...")
            current_node = current_node.left

        self._logger.mark_nodes([current_node.key], "found", f"Smallest node in the branch is {current_node.key}!")

        return current_node

    def _find_the_biggest_node_in_the_branch(self, node: AVLTree.Node) -> AVLTree.Node:

        current_node = node
        while current_node.right is not NULL:
            self._logger.mark_nodes([current_node.key], "search", f"Searching for the biggest node in branch, currently at {current_node.key}...")
            current_node = current_node.right
        
        self._logger.mark_nodes([current_node.key], "found", f"Biggest node in the branch is {current_node.key}!")

        return current_node


    def get_actions(self) -> List[Any]:
        return self._logger.read_all()


class ActionLogger:


    def __init__(self, tree):
        self._action_list = []
        self.tree = tree

    def add(self, action: Any):
        self._action_list.append(action)

    def final_tree(self):
        self.add({"action": "final_tree", "message": "Done!" })


    def mark_nodes(self, nodes, reason, message=None):
        self.add(
            {
                    "action": "mark_nodes", 
                    "nodes": nodes,
                    "reason": reason,
                    "message": message
            })
    
    def refresh_state(self):
        self.add(
            {
                    "action": "refresh_state",
                    "tree": self.tree.to_json()
            })

    def error(self, error_message):
        self.add({"action": "error", "message": error_message})

    def read_all(self) -> List[Any]:
        self.final_tree()
        return_list = self._action_list
        self._action_list = []
        return return_list