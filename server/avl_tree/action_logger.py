from __future__ import annotations
from typing import Any, List, Tuple, Callable


class ActionLogger:


    def __init__(self):
        self.action_list = []

    def add(self, action: Any):
        self.action_list.append(action)
    

    def read_all(self) -> List[Any]:
        return_list = self.action_list
        self.action_list = []
        return return_list
