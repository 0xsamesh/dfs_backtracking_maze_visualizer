# DFS & Backtracking Maze Solver

An interactive, browser-based tool that visualizes how **Depth-First Search (DFS)** and **Backtracking** explore and solve a 2D maze — built to *explain* the algorithms visually, not just produce an answer. Runs entirely client-side: no server, no build step.

---

## What it does

Pick an algorithm, generate or edit a maze, and watch it solve step by step:

- **DFS (Depth First Search)** — dives deep down one path, backs up on dead ends
- **Backtracking (Recursive)** — DFS that un-visits cells as it retreats, shown for contrast

The page links to two companion views that make the *theory* visible:

- **DFS Tree Visualization** (`dfs_tree.html`) — renders the search as an actual node tree (A→B→C…), with purple arrows showing exactly where DFS backtracks up the branches. This is the standout view for understanding *why* DFS backtracks.
- **Complexity Analysis** (`complexity_analysis.html`) — time/space breakdown of the algorithms.

Other teaching features built into the maze view:

- **Call-stack X-ray** — renders the live recursion stack as `dfs(x, y)` frames so you can watch it grow and unwind
- **DFS Weakness Demo** — a spiral maze where Start and End are close but DFS wanders far, demonstrating that **DFS does not find the shortest path**
- **Drag-to-reorder direction priority** — change the order DFS tries Up/Down/Left/Right and watch the path change
- **Step mode** — advance one step at a time

---

## Run it

It's pure client-side — just open the file in a browser:

```
index.html
```

No install, no server, no build step.

---

## C++ implementation

A standalone C++ version of the solvers is included under `algorithms/` (DFS and backtracking), plus `main.cpp` which reads a maze from `input.txt`. Compile with:

```bash
cd algorithms
./compile.sh
```

(The C++ build uses the vendored [nlohmann/json](https://github.com/nlohmann/json) single-header `json.hpp` for maze I/O.)

---

## Layout

```
index.html                 interactive demo (DFS + Backtracking)
dfs_tree.html              search-tree visualization
complexity_analysis.html   complexity breakdown
script.js                  DFS/backtracking engine, call-stack view, weakness demo
style.css
server.js                  optional Express server (not needed for index.html)
main.cpp  json.hpp  input.txt   C++ entry point + sample maze
algorithms/                C++ DFS / backtracking source
```

---

## Tech stack

Vanilla JavaScript · HTML · CSS · C++ (solver source)
