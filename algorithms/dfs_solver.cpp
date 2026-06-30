#include "dfs_solver.hpp"
#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm> // For std::reverse
#include "json.hpp"

// Implements a recursive Depth-First Search (DFS) solver.
// Helper to check if a cell is valid to move to.
bool DFSSolver::isValid(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height &&
           maze[y][x] == 0 && !visited[y][x];
}

// The core recursive DFS function.
bool DFSSolver::solveRecursive(int x, int y) {
        // --- RECURSIVE STACK GROWS ---
        // Each call to solveRecursive(x, y) adds a new frame to the call stack,
        // storing the state (x, y, and local variables) for this level of the search.

        // Mark the current cell as visited to avoid cycles.
        visited[y][x] = true;

        // Record the steps for visualization.
        steps.push_back({ "visit", x, y });
        steps.push_back({ "current", x, y });

        // Base Case: If we've reached the end of the maze, we've found a solution.
        if (x == end.x && y == end.y) {
            solution_path.push_back({x, y});
            return true; // Signal that the path is found.
        }

        // Explore neighbors in 4 directions (up, down, left, right).
        for (int i = 0; i < 4; i++) {
            int newX = x + dx[i];
            int newY = y + dy[i];

            // Check if the neighbor is a valid move.
            if (isValid(newX, newY)) {
                // --- RECURSIVE CALL ---
                // Here, the DFS goes one step deeper into the maze.
                // If the recursive call finds the end, it will return true.
                if (solveRecursive(newX, newY)) {
                    // If the deeper call was successful, it means the current cell (x, y)
                    // is part of the correct path. Add it to our solution path.
                    solution_path.push_back({x, y});
                    return true; // Propagate the success signal up the call stack.
                }
            }
        }

        // --- BACKTRACKING (UNWINDING) HAPPENS HERE ---
        // If the loop completes without finding a path, it means this cell (x, y) is a dead end.
        // The function will return `false`, and the call stack unwinds.
        // The execution returns to the previous stack frame (the cell that called this one).
        // NOTE: We do NOT unmark `visited[y][x] = false`. For finding a single path,
        // once a cell is explored and found to be a dead end, we never need to visit it again.
        // Unmarking is only necessary if you need to find ALL possible paths.
        steps.push_back({ "backtrack", x, y });
        return false; // Signal that this path was a dead end.
    }

// Public method to solve the maze from an input file.
nlohmann::json DFSSolver::solve(const std::string& inputFile) {
        nlohmann::json result;

        // Read and parse the input JSON file.
        std::ifstream file(inputFile);
        if (!file.is_open()) {
            result["error"] = "Could not open input file";
            return result;
        }
        nlohmann::json input;
        file >> input;

        width = input["width"].get<int>();
        height = input["height"].get<int>();
        start = {input["start"]["x"].get<int>(), input["start"]["y"].get<int>()};
        end = {input["end"]["x"].get<int>(), input["end"]["y"].get<int>()};

        // Initialize maze and visited grid.
        maze = input["maze"].get<std::vector<std::vector<int>>>();
        visited.assign(height, std::vector<bool>(width, false));

        // Start the recursive search from the start point.
        bool found = solveRecursive(start.x, start.y);

        // If a solution was found, the path is built backwards, so we reverse it.
        if (found) {
            std::reverse(solution_path.begin(), solution_path.end());
            // Add the final solution path to the visualization steps.
            for(const auto& p : solution_path) {
                steps.push_back({ "solution", p.x, p.y });
            }
        }

        // Build the final JSON result.
        result["found"] = found;
        result["pathLength"] = found ? static_cast<int>(solution_path.size()) : 0;
        
        int visited_count = 0;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (visited[y][x]) {
                    visited_count++;
                }
            }
        }
        result["cellsVisited"] = visited_count;

        nlohmann::json jsonSteps = nlohmann::json::array();
        for (const auto& step : steps) {
            jsonSteps.push_back({
                {"action", step.action},
                {"x", step.x},
                {"y", step.y}
            });
        }
        result["steps"] = jsonSteps;

        return result;
    }


// int main(int argc, char* argv[]) {
//     if (argc != 2) {
//         std::cerr << "Usage: " << argv[0] << " <input_file>" << std::endl;
//         return 1;
//     }
    
//     DFSSolver solver;
//     nlohmann::json result = solver.solve(argv[1]);
    
//     // Output result as JSON
//     std::cout << result.dump();
    
//     return 0;
// }
