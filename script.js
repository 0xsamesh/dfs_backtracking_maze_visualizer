class MazeSolver {
    constructor() {
        this.maze = [];
        this.width = 20;
        this.height = 20;
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 500; // milliseconds
        this.algorithm = 'dfs';
        this.editMode = false;
        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 19, y: 19 };

        // Performance tracking
        this.startTime = 0;
        this.cellsVisited = 0;
        this.algorithmSteps = 0;
        this.pathLength = 0;

        // Stack for visualization — tracks actual recursion path order
        this.stack = [];
        this.recursionPath = [];

        // Step mode tracking
        this.currentSolution = null;
        this.currentStepIndex = 0;

        this.initializeElements();
        this.setupEventListeners();
        this.setupDirectionPriority();
        this.generateMaze();
        this.renderMaze();
    }

    initializeElements() {
        // Control elements
        this.startBtn = document.getElementById('start-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.newMazeBtn = document.getElementById('new-maze-btn');
        this.algorithmSelect = document.getElementById('algorithm-select');
        this.speedSlider = document.getElementById('speed-slider');
        this.widthInput = document.getElementById('width-input');
        this.heightInput = document.getElementById('height-input');
        this.generateMazeBtn = document.getElementById('generate-maze-btn');
        this.weaknessBtn = document.getElementById('weakness-btn');
        this.clearMazeBtn = document.getElementById('clear-maze-btn');
        this.editModeCheckbox = document.getElementById('edit-mode-checkbox');
        this.saveMazeBtn = document.getElementById('save-maze-btn');
        this.loadMazeBtn = document.getElementById('load-maze-btn');
        this.downloadFilesBtn = document.getElementById('download-files-btn');
        this.fileInput = document.getElementById('file-input');

        // Status elements
        this.algorithmStatus = document.getElementById('algorithm-status');
        this.currentCell = document.getElementById('current-cell');
        this.stackSize = document.getElementById('stack-size');
        this.cellsVisitedEl = document.getElementById('cells-visited');
        this.solutionFound = document.getElementById('solution-found');

        // Performance elements
        this.perfCellsVisited = document.getElementById('perf-cells-visited');
        this.perfSteps = document.getElementById('perf-steps');
        this.perfPathLength = document.getElementById('perf-path-length');
        this.perfTime = document.getElementById('perf-time');
        this.perfTotalSteps = document.getElementById('perf-total-steps');
        this.perfFinalPath = document.getElementById('perf-final-path');

        // Stack state
        this.stackContent = document.getElementById('stack-content');

        // Maze grid
        this.mazeGrid = document.getElementById('maze-grid');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startSolving());
        this.stepBtn.addEventListener('click', () => this.stepSolving());
        this.resetBtn.addEventListener('click', () => this.resetMaze());
        this.newMazeBtn.addEventListener('click', () => this.generateNewMaze());

        this.algorithmSelect.addEventListener('change', (e) => {
            this.algorithm = e.target.value;
            // Reset visualization when switching algorithms
            this.resetMazeVisualization();
            this.resetStats();
            this.updateStatus();
        });

        this.speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = 1100 - (parseInt(e.target.value) * 100);
        });

        this.widthInput.addEventListener('change', (e) => {
            this.width = Math.max(3, Math.min(30, parseInt(e.target.value)));
            this.endPos = { x: this.width - 1, y: this.height - 1 };
            this.generateMaze();
            this.renderMaze();
            this.resetStats();
        });

        this.heightInput.addEventListener('change', (e) => {
            this.height = Math.max(3, Math.min(30, parseInt(e.target.value)));
            this.endPos = { x: this.width - 1, y: this.height - 1 };
            this.generateMaze();
            this.renderMaze();
            this.resetStats();
        });

        this.generateMazeBtn.addEventListener('click', () => this.generateRandomMaze());
        if (this.weaknessBtn) this.weaknessBtn.addEventListener('click', () => this.generateWeaknessMaze());
        this.clearMazeBtn.addEventListener('click', () => this.clearMaze());

        this.editModeCheckbox.addEventListener('change', (e) => {
            this.editMode = e.target.checked;
        });

        this.saveMazeBtn.addEventListener('click', () => this.saveMaze());
        this.loadMazeBtn.addEventListener('click', () => this.loadMaze());
        this.downloadFilesBtn.addEventListener('click', () => this.downloadProjectFiles());

        this.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
    }

    generateMaze() {
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = {
                    type: 'path',
                    visited: false,
                    inSolution: false,
                    isStart: x === 0 && y === 0,
                    isEnd: x === this.width - 1 && y === this.height - 1
                };
            }
        }

        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: this.width - 1, y: this.height - 1 };
        this.maze[0][0].isStart = true;
        this.maze[this.height - 1][this.width - 1].isEnd = true;
    }

    generateRandomMaze() {
        this.generateMaze();

        // Add random walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.maze[y][x].isStart && !this.maze[y][x].isEnd) {
                    if (Math.random() < 0.3) {
                        this.maze[y][x].type = 'wall';
                    }
                }
            }
        }

        this.renderMaze();
    }

    clearMaze() {
        this.generateMaze();
        this.renderMaze();
        this.resetStats();
    }

    generateWeaknessMaze() {
        // Force 20x20 for this specific demo
        this.width = 20;
        this.height = 20;
        this.widthInput.value = 20;
        this.heightInput.value = 20;
        this.generateMaze();

        // Fill board with walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x].type = 'wall';
                this.maze[y][x].isStart = false;
                this.maze[y][x].isEnd = false;
            }
        }

        // Set Start and End exactly like the screenshot
        this.startPos = { x: 0, y: 8 };
        this.endPos = { x: 10, y: 9 };
        this.maze[8][0].isStart = true;
        this.maze[9][10].isEnd = true;

        // Overriding start and end Pos to match EXACTLY what the user asked for:
        // "start and end should be in the same row... just 3 or 2 block... apply the dfs weakness logic here"
        this.maze[8][0].isStart = false;
        this.maze[9][10].isEnd = false;

        // Let's set S at (0, 8) and E at (4, 8)
        this.startPos = { x: 0, y: 8 };
        this.endPos = { x: 4, y: 8 };
        this.maze[8][0].isStart = true;
        this.maze[8][4].isEnd = true;

        // Helper to carve path
        const carve = (x, y) => { this.maze[y][x].type = 'path'; };

        carve(0, 8); // Start

        // Up column 0
        for (let y = 8; y >= 1; y--) carve(0, y);
        // Right along row 1
        for (let x = 0; x <= 18; x++) carve(x, 1);
        // Down column 18
        for (let y = 1; y <= 3; y++) carve(18, y);
        // Left along row 3
        for (let x = 18; x >= 2; x--) carve(x, 3);
        // Down column 2
        for (let y = 3; y <= 5; y++) carve(2, y);
        // Right along row 5
        for (let x = 2; x <= 16; x++) carve(x, 5);
        // Down column 16
        for (let y = 5; y <= 7; y++) carve(16, y);
        // Left along row 7
        for (let x = 16; x >= 4; x--) carve(x, 7);
        // Down column 4 to reach End
        for (let y = 7; y <= 8; y++) carve(4, y);


        // Add the small gap directly between Start and End to show they are close
        // (1, 8) and (2, 8) are path. (3, 8) is NOT carved, so it stays a WALL.
        carve(1, 8);
        carve(2, 8);

        // Add the blue distraction dead-ends from the screenshot
        carve(2, 1); carve(2, 0);                    // dead end up
        carve(6, 1); carve(6, 2); carve(5, 2);       // dead end down
        carve(18, 1); carve(19, 1); carve(19, 0);    // corner dead end
        carve(16, 3); carve(16, 2); carve(15, 2);    // dead end up
        carve(2, 4); carve(1, 4);                    // dead end left
        carve(8, 5); carve(8, 6);                    // dead end down
        carve(16, 6); carve(17, 6);                  // dead end right

        // Add some random noise at the bottom to match the screenshot's messy bottom area
        for (let y = 11; y < 20; y++) {
            for (let x = 0; x < 20; x++) {
                if (Math.random() < 0.15) carve(x, y);
            }
        }

        // Ensure start and end are walkable
        this.maze[8][0].type = 'path';
        this.maze[9][10].type = 'path';

        this.renderMaze();
        this.resetStats();

        if (this.algorithmStatus) {
            this.algorithmStatus.textContent = "DFS Weakness Spiral Loaded";
            this.algorithmStatus.style.color = "var(--accent-ruby)";
        }
    }

    generateNewMaze() {
        this.resetMaze();
        this.generateRandomMaze();
    }

    renderMaze() {
        this.mazeGrid.innerHTML = '';
        this.mazeGrid.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
        this.mazeGrid.style.gridTemplateRows = `repeat(${this.height}, 1fr)`;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                this.updateCellAppearance(cell, x, y);

                cell.addEventListener('click', () => this.handleCellClick(x, y));

                this.mazeGrid.appendChild(cell);
            }
        }
    }

    updateCellAppearance(cell, x, y) {
        const mazeCell = this.maze[y][x];

        cell.className = 'maze-cell';
        cell.textContent = '';

        if (mazeCell.isStart) {
            cell.classList.add('start');
            cell.textContent = 'S';
        } else if (mazeCell.isEnd) {
            cell.classList.add('end');
            cell.textContent = 'E';
        } else if (mazeCell.type === 'wall') {
            cell.classList.add('wall');
        } else {
            cell.classList.add('path');
        }

        // Add visited/solution highlighting but don't override start/end styling
        if (mazeCell.inSolution && !mazeCell.isStart && !mazeCell.isEnd) {
            cell.classList.add('solution');
        } else if (mazeCell.visited && !mazeCell.isStart && !mazeCell.isEnd) {
            cell.classList.add('visited');
        }
    }

    handleCellClick(x, y) {
        if (!this.editMode || this.isRunning) return;

        const cell = this.maze[y][x];
        if (cell.isStart || cell.isEnd) return;

        cell.type = cell.type === 'wall' ? 'path' : 'wall';
        this.renderMaze();
    }

    async startSolving() {
        if (this.isRunning) return;

        // Reset maze state before starting new solution
        this.resetMazeVisualization();

        this.isRunning = true;
        this.startTime = Date.now();
        this.resetStats();
        this.updateStatus();
        this.updateControls();

        try {
            const solution = await this.solveMaze();
            await this.displaySolution(solution);
        } catch (error) {
            console.error('Error solving maze:', error);
            this.showMessage('Error solving maze: ' + error.message, 'error');
        }

        this.isRunning = false;
        this.updateControls();
    }

    async solveMaze() {
        const width = this.width;
        const height = this.height;
        const grid = this.maze.map(row => row.map(cell => (cell.type === 'wall' ? 1 : 0)));
        const steps = [];
        // Read direction priority from the UI
        const dirs = this.getDirectionPriorityFromUI();

        const isValid = (x, y, visited) =>
            x >= 0 && x < width && y >= 0 && y < height && grid[y][x] === 0 && !visited[y][x];

        if (this.algorithm === 'dfs') {
            return this.solveDFS(grid, dirs, steps, isValid);
        } else if (this.algorithm === 'bfs') {
            return this.solveBFS(grid, dirs, steps, isValid);
        } else if (this.algorithm === 'dijkstra') {
            return this.solveDijkstra(grid, dirs, steps, isValid);
        } else if (this.algorithm === 'astar') {
            return this.solveAStar(grid, dirs, steps, isValid);
        } else {
            return this.solveBacktrack(grid, dirs, steps, isValid);
        }
    }

    solveDFS(grid, dirs, steps, isValid) {
        const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
        this.recursionPath = []; // Reset the path tracker
        // Start with no incoming direction (null) — will use default priority
        const found = this.recursiveDFS(this.startPos.x, this.startPos.y, visited, grid, dirs, steps, isValid, null);
        return { steps, found };
    }

    // Reorder directions so the incoming direction is tried FIRST (momentum)
    getDirectionsWithMomentum(dirs, incomingDir) {
        if (!incomingDir) return dirs; // No momentum yet, use default order

        // Put the incoming direction first, then the rest in original order
        const reordered = [];
        // First: continue in the same direction (momentum)
        for (const d of dirs) {
            if (d.dx === incomingDir.dx && d.dy === incomingDir.dy) {
                reordered.push(d);
                break;
            }
        }
        // Then: all other directions in their original order
        for (const d of dirs) {
            if (d.dx !== incomingDir.dx || d.dy !== incomingDir.dy) {
                reordered.push(d);
            }
        }
        return reordered;
    }

    recursiveDFS(x, y, visited, grid, dirs, steps, isValid, incomingDir) {
        visited[y][x] = true;
        // Track actual recursion order (push on entry)
        this.recursionPath.push({ x, y });
        steps.push({ action: 'visit', x, y, stack: this.getStackSnapshot() });
        steps.push({ action: 'current', x, y });

        if (x === this.endPos.x && y === this.endPos.y) {
            steps.push({ action: 'solution', x, y });
            return true;
        }

        // KEY: Try the same direction we were going FIRST (momentum/deep dive)
        const orderedDirs = this.getDirectionsWithMomentum(dirs, incomingDir);

        for (const dir of orderedDirs) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (isValid(nx, ny, visited)) {
                // Pass the direction we're moving as the new momentum
                if (this.recursiveDFS(nx, ny, visited, grid, dirs, steps, isValid, dir)) {
                    steps.push({ action: 'solution', x, y });
                    return true;
                }
                steps.push({ action: 'current', x, y });
            }
        }

        // Pop on backtrack (mirrors actual call stack behavior)
        this.recursionPath.pop();
        steps.push({ action: 'backtrack', x, y, stack: this.getStackSnapshot() });
        return false;
    }

    solveBFS(grid, dirs, steps, isValid) {
        const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
        const parent = Array.from({ length: this.height }, () => Array(this.width).fill(null));
        const queue = [{ x: this.startPos.x, y: this.startPos.y }];

        visited[this.startPos.y][this.startPos.x] = true;
        let found = false;

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            steps.push({ action: 'visit', x, y, stack: queue.slice() });
            steps.push({ action: 'current', x, y });

            if (x === this.endPos.x && y === this.endPos.y) {
                found = true;
                break;
            }

            for (const { dx, dy } of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (isValid(nx, ny, visited)) {
                    visited[ny][nx] = true;
                    parent[ny][nx] = { x, y };
                    queue.push({ x: nx, y: ny });
                }
            }
        }

        if (found) {
            let curr = { x: this.endPos.x, y: this.endPos.y };
            while (curr) {
                steps.push({ action: 'solution', x: curr.x, y: curr.y });
                curr = parent[curr.y][curr.x];
            }
        }

        return { steps, found };
    }

    solveDijkstra(grid, dirs, steps, isValid) {
        // In an unweighted grid, Dijkstra is equivalent to BFS
        // We'll implement it with a priority-queue like behavior (sorted array) to demonstrate the concept
        const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
        const dist = Array.from({ length: this.height }, () => Array(this.width).fill(Infinity));
        const parent = Array.from({ length: this.height }, () => Array(this.width).fill(null));

        dist[this.startPos.y][this.startPos.x] = 0;
        const pq = [{ x: this.startPos.x, y: this.startPos.y, d: 0 }];
        let found = false;

        while (pq.length > 0) {
            pq.sort((a, b) => a.d - b.d);
            const { x, y, d } = pq.shift();

            if (visited[y][x]) continue;
            visited[y][x] = true;

            steps.push({ action: 'visit', x, y, stack: pq.slice() });
            steps.push({ action: 'current', x, y });

            if (x === this.endPos.x && y === this.endPos.y) {
                found = true;
                break;
            }

            for (const { dx, dy } of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (isValid(nx, ny, visited)) {
                    const newDist = d + 1; // All edges weight 1
                    if (newDist < dist[ny][nx]) {
                        dist[ny][nx] = newDist;
                        parent[ny][nx] = { x, y };
                        pq.push({ x: nx, y: ny, d: newDist });
                    }
                }
            }
        }

        if (found) {
            let curr = { x: this.endPos.x, y: this.endPos.y };
            while (curr) {
                steps.push({ action: 'solution', x: curr.x, y: curr.y });
                curr = parent[curr.y][curr.x];
            }
        }

        return { steps, found };
    }

    solveAStar(grid, dirs, steps, isValid) {
        const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
        const gScore = Array.from({ length: this.height }, () => Array(this.width).fill(Infinity));
        const fScore = Array.from({ length: this.height }, () => Array(this.width).fill(Infinity));
        const parent = Array.from({ length: this.height }, () => Array(this.width).fill(null));

        const heuristic = (x, y) => Math.abs(x - this.endPos.x) + Math.abs(y - this.endPos.y);

        gScore[this.startPos.y][this.startPos.x] = 0;
        fScore[this.startPos.y][this.startPos.x] = heuristic(this.startPos.x, this.startPos.y);

        const openSet = [{ x: this.startPos.x, y: this.startPos.y, f: fScore[this.startPos.y][this.startPos.x] }];
        let found = false;

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const { x, y } = openSet.shift();

            if (visited[y][x]) continue;
            visited[y][x] = true;

            steps.push({ action: 'visit', x, y, stack: openSet.slice() });
            steps.push({ action: 'current', x, y });

            if (x === this.endPos.x && y === this.endPos.y) {
                found = true;
                break;
            }

            for (const { dx, dy } of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (isValid(nx, ny, visited)) {
                    const tentativeGScore = gScore[y][x] + 1;
                    if (tentativeGScore < gScore[ny][nx]) {
                        parent[ny][nx] = { x, y };
                        gScore[ny][nx] = tentativeGScore;
                        fScore[ny][nx] = tentativeGScore + heuristic(nx, ny);
                        openSet.push({ x: nx, y: ny, f: fScore[ny][nx] });
                    }
                }
            }
        }

        if (found) {
            let curr = { x: this.endPos.x, y: this.endPos.y };
            while (curr) {
                steps.push({ action: 'solution', x: curr.x, y: curr.y });
                curr = parent[curr.y][curr.x];
            }
        }

        return { steps, found };
    }

    solveBacktrack(grid, dirs, steps, isValid) {
        // Backtracking is essentially DFS where we visualize the un-visiting too
        const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
        this.recursionPath = []; // Reset the path tracker
        const found = this.recursiveBacktrack(this.startPos.x, this.startPos.y, visited, grid, dirs, steps, isValid);
        return { steps, found };
    }

    recursiveBacktrack(x, y, visited, grid, dirs, steps, isValid) {
        visited[y][x] = true;
        this.recursionPath.push({ x, y });
        steps.push({ action: 'visit', x, y, stack: this.getStackSnapshot() });
        steps.push({ action: 'current', x, y });

        if (x === this.endPos.x && y === this.endPos.y) {
            steps.push({ action: 'solution', x, y });
            return true;
        }

        for (const { dx, dy } of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (isValid(nx, ny, visited)) {
                if (this.recursiveBacktrack(nx, ny, visited, grid, dirs, steps, isValid)) {
                    steps.push({ action: 'solution', x, y });
                    return true;
                }
            }
        }

        // The "Backtracking" specific part: un-marking for visualization of exploration
        this.recursionPath.pop();
        steps.push({ action: 'backtrack', x, y, stack: this.getStackSnapshot() });
        visited[y][x] = false; // Actually unmark for potential other paths (classic backtracking)
        return false;
    }

    // Returns a snapshot of the current recursion path (actual call stack order)
    getStackSnapshot() {
        return this.recursionPath.map((pos, depth) => ({
            x: pos.x,
            y: pos.y,
            label: `dfs(x: ${pos.x}, y: ${pos.y})`,
            depth
        })).slice(-15); // Show last 15 calls for the presentation
    }

    async displaySolution(solution) {
        if (solution.error) {
            this.showMessage(solution.error, 'error');
            return;
        }

        // Solution steps from DFS are pushed during recursion unwinding (end→start),
        // so we reverse just those to display start→end path highlighting.
        // First, separate solution steps from the rest
        const nonSolutionSteps = [];
        const solutionSteps = [];
        for (const step of solution.steps) {
            if (step.action === 'solution') {
                solutionSteps.push(step);
            } else {
                nonSolutionSteps.push(step);
            }
        }
        solutionSteps.reverse();
        // Play all exploration steps first, then the solution path
        const orderedSteps = nonSolutionSteps.concat(solutionSteps);

        // Animate the solution path
        for (let i = 0; i < orderedSteps.length; i++) {
            const step = orderedSteps[i];

            if (step.action === 'visit') {
                this.maze[step.y][step.x].visited = true;
                this.cellsVisited++;
                // Re-render to show purple visited cell
                this.renderMaze();
            } else if (step.action === 'current') {
                // Remove previous current
                this.clearCurrentCell();
                // Set new current with golden highlight (but not for start/end)
                const mazeCell = this.maze[step.y][step.x];
                if (!mazeCell.isStart && !mazeCell.isEnd) {
                    const cell = this.getCellElement(step.x, step.y);
                    if (cell) {
                        cell.classList.add('current');
                        // Force golden color to override other styles
                        cell.style.backgroundColor = '#fbbf24';
                        cell.style.border = '2px solid #f59e0b';
                        cell.style.color = '#000000';
                        cell.style.fontWeight = 'bold';
                        cell.style.zIndex = '10';
                    }
                }
                this.currentCell.textContent = `(${step.x}, ${step.y})`;
            } else if (step.action === 'backtrack') {
                // Mark the cell as backtracked (dead end)
                const mazeCellData = this.maze[step.y][step.x];
                if (!mazeCellData.isStart && !mazeCellData.isEnd) {
                    const cell = this.getCellElement(step.x, step.y);
                    if (cell) {
                        cell.classList.remove('visited');
                        cell.classList.add('backtracked');
                    }
                }
                this.currentCell.textContent = `Backtracking from (${step.x}, ${step.y})`;
            } else if (step.action === 'solution') {
                // Mark solution in data model AND update the cell visually
                this.maze[step.y][step.x].inSolution = true;
                this.pathLength++;
                this.renderMaze();
            }

            this.algorithmSteps++;
            this.updatePerformanceMetrics();
            this.updateStackVisualization(step.stack || []);

            // Wait for animation
            await this.sleep(this.animationSpeed);
        }

        this.solutionFound.textContent = solution.found ? 'Yes' : 'No';
        this.algorithmStatus.textContent = solution.found ? 'Solution Found' : 'No Solution';

        this.updatePerformanceMetrics();
    }

    clearCurrentCell() {
        const currentCells = document.querySelectorAll('.maze-cell.current');
        currentCells.forEach(cell => {
            cell.classList.remove('current');
            // Clear inline styles
            cell.style.backgroundColor = '';
            cell.style.border = '';
            cell.style.color = '';
            cell.style.fontWeight = '';
            cell.style.zIndex = '';
        });
    }

    getCellElement(x, y) {
        return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    }

    stepSolving() {
        if (this.isRunning) return;

        if (!this.currentSolution || this.currentStepIndex >= this.currentSolution.steps.length) {
            // Start new solving process
            this.startStepSolving();
        } else {
            // Continue with next step
            this.executeNextStep();
        }
    }

    async startStepSolving() {
        // Reset maze state before starting new step solution
        this.resetMazeVisualization();

        this.isRunning = true;
        this.startTime = Date.now();
        this.resetStats();
        this.currentStepIndex = 0;
        this.updateStatus();
        this.updateControls();

        try {
            this.currentSolution = await this.solveMaze();
            if (this.currentSolution.error) {
                this.showMessage(this.currentSolution.error, 'error');
                this.isRunning = false;
                this.updateControls();
                return;
            }

            this.showMessage('Step mode ready. Click Step to advance.', 'success');
            this.isRunning = false;
            this.updateControls();
        } catch (error) {
            console.error('Error solving maze:', error);
            this.showMessage('Error solving maze: ' + error.message, 'error');
            this.isRunning = false;
            this.updateControls();
        }
    }

    executeNextStep() {
        if (!this.currentSolution || this.currentStepIndex >= this.currentSolution.steps.length) {
            this.showMessage('No more steps available', 'error');
            return;
        }

        const step = this.currentSolution.steps[this.currentStepIndex];

        if (step.action === 'visit') {
            this.maze[step.y][step.x].visited = true;
            this.cellsVisited++;
            // Re-render to show purple visited cell
            this.renderMaze();
        } else if (step.action === 'current') {
            // Remove previous current
            this.clearCurrentCell();
            // Set new current with golden highlight (but not for start/end)
            const mazeCell = this.maze[step.y][step.x];
            if (!mazeCell.isStart && !mazeCell.isEnd) {
                const cell = this.getCellElement(step.x, step.y);
                if (cell) {
                    cell.classList.add('current');
                    // Force golden color to override other styles
                    cell.style.backgroundColor = '#fbbf24';
                    cell.style.border = '2px solid #f59e0b';
                    cell.style.color = '#000000';
                    cell.style.fontWeight = 'bold';
                    cell.style.zIndex = '10';
                }
            }
            this.currentCell.textContent = `(${step.x}, ${step.y})`;
        } else if (step.action === 'backtrack') {
            // Highlight current tile during backtracking
            const mazeCell = this.maze[step.y][step.x];
            if (!mazeCell.isStart && !mazeCell.isEnd) {
                const cell = this.getCellElement(step.x, step.y);
                if (cell) {
                    cell.classList.add('current');
                    cell.style.backgroundColor = '#fbbf24';
                    cell.style.border = '2px solid #f59e0b';
                    cell.style.color = '#000000';
                    cell.style.fontWeight = 'bold';
                    cell.style.zIndex = '10';
                }
            }
            this.currentCell.textContent = `Backtracking to (${step.x}, ${step.y})`;
        } else if (step.action === 'solution') {
            this.maze[step.y][step.x].inSolution = true;
            this.pathLength++;
            // Re-render to show blue solution path
            this.renderMaze();
        }

        this.algorithmSteps++;
        this.updatePerformanceMetrics();
        this.updateStackVisualization(step.stack || []);

        this.currentStepIndex++;

        // Check if we've completed all steps
        if (this.currentStepIndex >= this.currentSolution.steps.length) {
            this.solutionFound.textContent = this.currentSolution.found ? 'Yes' : 'No';
            this.algorithmStatus.textContent = this.currentSolution.found ? 'Solution Found' : 'No Solution';
            this.showMessage('Algorithm completed!', 'success');
            this.currentSolution = null;
            this.currentStepIndex = 0;
        }

        this.updatePerformanceMetrics();
    }

    resetMaze() {
        this.isRunning = false;
        this.isPaused = false;

        // Reset step mode
        this.currentSolution = null;
        this.currentStepIndex = 0;

        this.resetMazeVisualization();
        this.resetStats();
        this.updateControls();
        this.updateStatus();
    }

    resetMazeVisualization() {
        // Clear current cell highlighting
        this.clearCurrentCell();

        // Reset maze state
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x].visited = false;
                this.maze[y][x].inSolution = false;
            }
        }

        this.renderMaze();
    }

    resetStats() {
        this.cellsVisited = 0;
        this.algorithmSteps = 0;
        this.pathLength = 0;
        this.stack = [];

        this.algorithmStatus.textContent = 'Ready';
        this.currentCell.textContent = 'None';
        this.solutionFound.textContent = 'No';

        this.updatePerformanceMetrics();
        this.updateStackVisualization([]);
    }

    updateStatus() {
        this.cellsVisitedEl.textContent = this.cellsVisited.toString();
        this.stackSize.textContent = this.stack.length.toString();
    }

    updatePerformanceMetrics() {
        const currentTime = this.isRunning ? (Date.now() - this.startTime) / 1000 : 0;

        this.perfCellsVisited.textContent = this.cellsVisited.toString();
        this.perfSteps.textContent = this.algorithmSteps.toString();
        this.perfPathLength.textContent = this.pathLength.toString();
        this.perfTime.textContent = currentTime.toFixed(2) + 's';
        this.perfTotalSteps.textContent = this.algorithmSteps.toString();
        this.perfFinalPath.textContent = this.pathLength > 0 ? this.pathLength.toString() : '-';
    }

    updateStackVisualization(stackData) {
        this.stack = stackData;
        this.stackSize.textContent = stackData.length.toString();

        if (stackData.length === 0) {
            this.stackContent.innerHTML = '<p class="empty-state">Stack is empty</p>';
            return;
        }

        const stackHtml = stackData.map((item, index) =>
            `<div class="stack-item">
                <span class="stack-depth">#${item.depth}</span>
                <span class="stack-func">${item.label}</span>
            </div>`
        ).join('');

        this.stackContent.innerHTML = stackHtml;
    }

    updateControls() {
        this.startBtn.disabled = this.isRunning;
        this.stepBtn.disabled = false; // Step button always enabled when not running continuous mode
        this.resetBtn.disabled = false;
        this.newMazeBtn.disabled = this.isRunning;
        this.generateMazeBtn.disabled = this.isRunning;
        this.clearMazeBtn.disabled = this.isRunning;
    }

    saveMaze() {
        // Prompt user for filename
        const fileName = prompt('Enter a name for your maze:', 'my_maze');
        if (!fileName) return; // User cancelled

        const mazeData = {
            maze: this.maze,
            width: this.width,
            height: this.height,
            startPos: this.startPos,
            endPos: this.endPos
        };

        const dataStr = JSON.stringify(mazeData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        // Clean filename and add .json extension if not present
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalFileName = cleanFileName.endsWith('.json') ? cleanFileName : `${cleanFileName}.json`;
        a.download = finalFileName;
        a.click();

        URL.revokeObjectURL(url);
        this.showMessage(`Maze saved as ${finalFileName}`, 'success');
    }

    loadMaze() {
        this.fileInput.click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const mazeData = JSON.parse(e.target.result);

                this.maze = mazeData.maze;
                this.width = mazeData.width;
                this.height = mazeData.height;
                this.startPos = mazeData.startPos;
                this.endPos = mazeData.endPos;

                this.widthInput.value = this.width;
                this.heightInput.value = this.height;

                this.renderMaze();
                this.resetStats();

                this.showMessage('Maze loaded successfully!', 'success');
            } catch (error) {
                this.showMessage('Error loading maze file', 'error');
            }
        };

        reader.readAsText(file);
    }

    downloadProjectFiles() {
        const bundleUrl = 'MazeSolver_Presentation_Bundle.html';
        const a = document.createElement('a');
        a.href = bundleUrl;
        a.download = 'MazeSolver_Presentation.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showMessage('Presentation Bundle downloaded!', 'success');
    }

    showMessage(text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert after header
        const header = document.querySelector('header');
        header.insertAdjacentElement('afterend', message);

        // Remove after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ─── Direction Priority UI ───────────────────────────────────────

    getDirectionPriorityFromUI() {
        const dirMap = {
            'down': { dx: 0, dy: 1, label: 'Down' },
            'right': { dx: 1, dy: 0, label: 'Right' },
            'up': { dx: 0, dy: -1, label: 'Up' },
            'left': { dx: -1, dy: 0, label: 'Left' }
        };

        const list = document.getElementById('direction-priority-list');
        if (!list) {
            // Fallback if UI not present
            return [dirMap.down, dirMap.right, dirMap.up, dirMap.left];
        }

        const items = list.querySelectorAll('.direction-item');
        return Array.from(items).map(item => dirMap[item.dataset.dir]);
    }

    setupDirectionPriority() {
        const list = document.getElementById('direction-priority-list');
        if (!list) return;

        // Arrow button click handlers
        list.addEventListener('click', (e) => {
            const btn = e.target.closest('.dir-move-btn');
            if (!btn) return;

            const item = btn.closest('.direction-item');
            const direction = btn.dataset.move; // 'up' or 'down'

            if (direction === 'up' && item.previousElementSibling) {
                list.insertBefore(item, item.previousElementSibling);
            } else if (direction === 'down' && item.nextElementSibling) {
                list.insertBefore(item.nextElementSibling, item);
            }

            this.updateDirectionRanks();
        });

        // Drag and drop handlers
        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            draggedItem = e.target.closest('.direction-item');
            if (draggedItem) {
                draggedItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        list.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
            list.querySelectorAll('.direction-item').forEach(item => {
                item.classList.remove('drag-over');
            });
            this.updateDirectionRanks();
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const target = e.target.closest('.direction-item');
            if (target && target !== draggedItem) {
                list.querySelectorAll('.direction-item').forEach(item => {
                    item.classList.remove('drag-over');
                });
                target.classList.add('drag-over');
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.direction-item');
            if (target && target !== draggedItem && draggedItem) {
                const allItems = Array.from(list.querySelectorAll('.direction-item'));
                const dragIndex = allItems.indexOf(draggedItem);
                const dropIndex = allItems.indexOf(target);

                if (dragIndex < dropIndex) {
                    list.insertBefore(draggedItem, target.nextElementSibling);
                } else {
                    list.insertBefore(draggedItem, target);
                }
            }
            this.updateDirectionRanks();
        });
    }

    updateDirectionRanks() {
        const list = document.getElementById('direction-priority-list');
        if (!list) return;
        const items = list.querySelectorAll('.direction-item');
        items.forEach((item, index) => {
            item.querySelector('.dir-rank').textContent = index + 1;
        });
    }
}

// Initialize the maze solver when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MazeSolver();
});
