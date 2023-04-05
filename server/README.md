# Visualizer Server

In older versions, the algorithms were simulated on flask backend (which is stored in this folder), and their actions were serialized and sent to the react server. In newer versions this was removed as a redundancy, during the task of porting the web app to GitHub Pages.

## How to run

### Create environment

Run command line in the project folder, and from there, run:

- `python -m venv env `
- `source env/bin/activate` (on POSIX)
- `call ./env/Scripts/activate.bat` (on Windows **Command Prompt**, <ins>not PowerShell</ins>)
- `pip install -r requirements.txt`

### Run server

Run:

- `python server/main.py`