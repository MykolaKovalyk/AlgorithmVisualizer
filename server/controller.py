import json
from main import app
from flask import request, abort
from time import sleep
from avl_tree.avl_tree import AVLTree;
from topsort.topsort import topsort
import sys
import traceback
import threading
import time

global_lock =  threading.Lock()
structures = {}



@app.route('/avl/', methods=['GET'])
def get_tree():
    global_lock.acquire()

    try:
        identifier = int(request.args.get("identifier"))

        create_tree_if_not_present(identifier)

        saved_data = structures[identifier]
        avl_tree = saved_data["tree"]
        saved_data["last_modified"] = time.time()
        return avl_tree.to_json()
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)
    finally:
        collect_dead_entries()
        global_lock.release()

@app.route('/avl/<key>', methods=['GET'])
def get_tree_item(key):
    global_lock.acquire()

    try:
        identifier = int(request.args.get("identifier"))
        key = int(key)

        create_tree_if_not_present(identifier)

        saved_data = structures[identifier]
        avl_tree = saved_data["tree"]
        item = avl_tree[key]
        saved_data["last_modified"] = time.time()
        return json.dumps(avl_tree.get_actions())
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)
    finally:
        collect_dead_entries()
        global_lock.release()

@app.route('/avl/insert', methods=['POST'])
def insert():
    global_lock.acquire()

    try:
        data = request.json
        identifier = data["identifier"]
        key = data["key"]

        if not isinstance(key, int):
            raise Exception("Key should be of type int")
        if key < 0:
            raise Exception("Key value can't be less than 0")

        create_tree_if_not_present(identifier)

        saved_data = structures[identifier]
        avl_tree = saved_data["tree"]
        avl_tree.append(key, None)
        saved_data["last_modified"] = time.time()
        return json.dumps(avl_tree.get_actions())
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)
    finally:
        collect_dead_entries()
        global_lock.release()

@app.route('/avl/clear', methods=['DELETE'])
def clear_tree():
    global_lock.acquire()

    try:
        data = request.json
        identifier = data["identifier"]

        del structures[identifier]

        return 'OK'
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)
    finally:
        collect_dead_entries()
        global_lock.release()


@app.route('/avl/remove', methods=['DELETE'])
def delete_item():
    global_lock.acquire()

    try:
        data = request.json
        identifier = data["identifier"]
        key = data["key"]

        saved_data = structures[identifier]
        tree = saved_data["tree"]
        tree.remove(key)
        saved_data["last_modified"] = time.time()

        return json.dumps(tree.get_actions())
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)
    finally:
        collect_dead_entries()
        global_lock.release()

@app.route('/topsort', methods=['POST'])
def topological_sort():
    try:
        data = request.json

        start = data["start"]
        edges = data["edges"]

        output, logger = topsort(edges, start)

        return json.dumps(logger.read_all())
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)








@app.route('/get-example', methods=['GET'])
def get_example():
    password = request.args.get("password")

    return person

@app.route('/post-example', methods=['POST'])
def post_example():
    data = request.json
    some_random_field = data["some_random_field"]

    if "Received arror" == True:
        abort(400, "Error message")

    return 'OK'




def create_tree_if_not_present(identifier):
    if not identifier in structures:
        structures[identifier] = {
                "tree": AVLTree(),
                "last_modified": time.time()
            }


def collect_dead_entries():

    for identifier in list(structures.keys()):
        print(structures[identifier])
        if time.time() - structures[identifier]["last_modified"] > 60:
            del structures[identifier]

