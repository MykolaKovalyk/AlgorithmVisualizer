from __future__ import annotations
from typing import Any, List, Tuple, Callable
from action_logger import ActionLogger

NULL = None

class BinaryTree:

    class Node:

        def __init__(self, key: Any):

            self.key = key
            self.value = None

            self.left = None
            self.right = None
            self.parent = None

            self.height = 1

        def set_left(self, new_left_node: BinaryTree.Node) -> BinaryTree.Node:
            old_node = self.left
            if self.left is not NULL:
                self.left.parent = NULL

            self.left = new_left_node

            if self.left is not NULL:
                self.left.parent = self

            return old_node

        def set_right(self, new_right_node: BinaryTree.Node) -> BinaryTree.Node:
            old_node = self.right
            if self.right is not NULL:
                self.right.parent = NULL

            self.right = new_right_node

            if self.right is not NULL:
                self.right.parent = self

            return old_node

        def is_right(self):
            if self.parent is NULL:
                return None

            return self is self.parent.right

        def get_balance(self):
            return self.left.height - self.right.height

    def __init__(self):

        global NULL

        if NULL is None:
            NULL = BinaryTree.Node(None)
            NULL.height = 0

        self.root = NULL
        self._size = 0
        self._logger = ActionLogger()

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

    def _to_list_of_nodes(self) -> List[BinaryTree.Node]:
        result = []

        def save_children(node: BinaryTree.Node):
            if node.left is not NULL:
                result.append(node.left)
                save_children(node.left)
            if node.right is not NULL:
                result.append(node.right)
                save_children(node.right)

        if self.root is NULL:
            return result

        result.append(self.root)
        save_children(self.root)

        return result

    def _to_list_of_edges(self) -> List[BinaryTree.Node]:
        pass

    def _find_node_by_key(self, key: Any) -> BinaryTree.Node:

        current_node = self.root

        while current_node is not NULL and key != current_node.key:
            right_node = hash(key) > hash(current_node.key)
            current_node = current_node.right if right_node else current_node.left

        return current_node

    def _add_or_find_node_by_key(self, key: Any, new_only: bool) -> BinaryTree.Node:

        current_node = self.root
        node_parent = NULL
        right_node = False
        
        while current_node is not NULL and key != current_node.key:

            # notify about search
            self._logger.add({"action": "select", "node": current_node.key, "color": "yellow"})

            node_parent = current_node
            right_node = hash(key) > hash(current_node.key)
            current_node = current_node.right if right_node else current_node.left

        if current_node is not NULL:

            # notify that node with the specified key was found
            self._logger.add({"action": "select", "node": current_node.key, "color": "red"})
            
            if new_only:
                error_message = f'Entry with the key "{key}" already exists.'
                
                # notify that node already exists, if the task was to create a new one
                self._logger.add({"action": "error", "message": error_message})
                
                raise ValueError(error_message)

        if current_node is NULL:
            current_node = self._new_node(key)

            if self.root is NULL:
                self.root = current_node
            elif right_node:
                node_parent.set_right(current_node)
            else:
                node_parent.set_left(current_node)

            # new node was created, notify about it
            self._logger.add({"action": "new_node", "edge": [node_parent.key,current_node.key]})
            
            self._size += 1
            self._fixup(current_node)

        return current_node

    def _new_node(self, key):
        new_node = BinaryTree.Node(key)
        new_node.left = new_node.right = new_node.parent = NULL

        return new_node

    def _replace_node(self, node_to_replace: BinaryTree.Node) -> BinaryTree.Node:

        replacement = node_to_replace

        if node_to_replace.right is not NULL:
            replacement = self._find_the_smallest_node_in_the_branch(node_to_replace.right)
        elif node_to_replace.left is not NULL:
            replacement = self._find_the_biggest_node_in_the_branch(node_to_replace.left)

        node_to_replace.key = replacement.key
        node_to_replace.value = replacement.value

        return replacement

    def _prune_leaf_node(self, node_to_prune: BinaryTree.Node) -> None:
        if node_to_prune.parent is NULL:
            self._root = NULL
        else:
            replacement = node_to_prune.left if node_to_prune.left is not NULL else node_to_prune.right
            if node_to_prune.is_right():
                node_to_prune.parent.set_right(replacement)
            else:
                node_to_prune.parent.set_left(replacement)
        
        self._size -= 1

    def _remove_node(self, node_to_remove: BinaryTree.Node) -> BinaryTree.Node:
        prune_node =  self._replace_node(node_to_remove)
        fixup_node = prune_node.parent.parent

        self._prune_leaf_node(prune_node)

        if fixup_node is not NULL and fixup_node is not None:
            self._fixup(fixup_node)

    def get_max_depth(self):
        depth = 0
        for node in self._to_list_of_nodes():
            current_depth = 1
            while node.parent is not NULL:
                node =  node.parent
                current_depth += 1
            
            if current_depth > depth:
                depth =  current_depth

        return depth

    def _fixup(self, node: BinaryTree.Node): 
        
        while node is not NULL:
            node.height = 1 + max(node.left.height, node.right.height)

            balanceFactor = node.get_balance()

            if balanceFactor > 1:
                if node.left.get_balance() >= 0:
                    return self._right_rotate(node)
                else:
                    node.left = self._left_rotate(node.left)
                    return self._right_rotate(node)
            if balanceFactor < -1:
                if node.right.get_balance() <= 0:
                    return self._left_rotate(node)
                else:
                    node.right = self._right_rotate(node.right)
                    return self._left_rotate(node)
            
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

        # log the rotation
        self._logger.add(
            {
                "action": "rotate", 
                "remove_edges": 
                [
                    [node.parent.key, node.key],
                    [node.key, node.right.key],
                    [node.right.key, node.right.left.key]
                ],
                "add_edges": [
                    [node.parent.key, node.right.key],
                    [node.right.key, node.key],
                    [node.key, node.right.left.key]
                ]
            })


        right_node = node.right
        node.right = right_node.left
        if right_node.left != NULL:
            right_node.left.parent = node

        right_node.parent = node.parent
        if node.parent == NULL:
            self.root = right_node
        elif node == node.parent.left:
            node.parent.left = right_node
        else:
            node.parent.right = right_node
        right_node.left = node
        node.parent = right_node

        node.height = 1 + max(node.left.height, node.right.height)
        right_node.height = 1 + max(right_node.left.height, right_node.right.height)

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

        # log the rotation
        self._logger.add(
            {
                "action": "rotate", 
                "remove_edges": 
                [
                    [node.parent.key, node.key],
                    [node.key, node.left.key],
                    [node.left.key, node.left.right.key]
                ],
                "add_edges": [
                    [node.parent.key, node.left.key],
                    [node.left.key, node.key],
                    [node.key, node.left.right.key]
                ]
            })


        left_node = node.left
        node.left = left_node.right
        if left_node.right != NULL:
            left_node.right.parent = node

        left_node.parent = node.parent
        if node.parent == NULL:
            self.root = left_node
        elif node == node.parent.right:
            node.parent.right = left_node
        else:
            node.parent.left = left_node
        left_node.right = node
        node.parent = left_node

        node.height = 1 + max(node.left.height, node.right.height)
        left_node.height = 1 + max(left_node.left.height, left_node.right.height)

        return left_node

    def _find_the_smallest_node_in_the_branch(self, node: BinaryTree.Node) -> BinaryTree.Node:

        current_node = node
        while current_node.left is not NULL:
            current_node = current_node.left

        return current_node

    def _find_the_biggest_node_in_the_branch(self, node: BinaryTree.Node) -> BinaryTree.Node:

        current_node = node
        while current_node.right is not NULL:
            current_node = current_node.right

        return current_node
