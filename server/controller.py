import json
from main import app
from flask import request, abort
from time import sleep
from avl_tree.avl_tree import AVLTree;
from topsort.topsort import topsort
import sys
import traceback

structures = {}



@app.route('/avl/', methods=['GET'])
def get_tree():    

    try:
        identifier = int(request.args.get("identifier"))
        
        if not identifier in structures:
            structures[identifier] = AVLTree()

        avl_tree = structures[identifier]
        return avl_tree.to_json()
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)

@app.route('/avl/<key>', methods=['GET'])
def get_tree_itme(key):    

    try:
        identifier = int(request.args.get("identifier"))
        key = int(key)

        if not identifier in structures:
            structures[identifier] = AVLTree()

        avl_tree = structures[identifier]
        item = avl_tree[key]
        return avl_tree.get_actions()
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)

@app.route('/avl/insert', methods=['POST'])
def insert():
    try:
        data = request.json
        indentification = data["identifier"]

        if indentification not in structures:
            structures[indentification] = AVLTree()

        avl_tree = structures[indentification]
        avl_tree.append(data["key"], None)
        
        return avl_tree.get_actions()
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)

@app.route('/avl/clear', methods=['DELETE'])
def clear_tree():
    try:
        data = request.json
        identifier = data["identifier"]

        del structures[identifier]

        return 'OK'
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)


@app.route('/avl/remove', methods=['DELETE'])
def delete_item():
    try:
        data = request.json
        identifier = data["identifier"]
        key = data["key"]

        tree: AVLTree = structures[identifier]
        tree.remove(key)

        return tree.get_actions() 
    except Exception as e:
        print(traceback.format_exc())
        abort(400, e)

@app.route('/topsort', methods=['POST'])
def topsort():
    try:
        data = request.json

        start = data["start"]
        edges = data["edges"]
        
        output, logger = topsort(edges, start)

        return logger.read_all()
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