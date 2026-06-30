#include "backtrack_solver.hpp"
#include <fstream>
#include <algorithm> // For std::reverse
#include <iostream>

// Helper to check if a cell is valid to move to.
bool BacktrackSolver::isValid(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height &&
           maze[y][x] == 0 && !visited[y][x];
}

// Private helper method containing the core iterative solving logic.
bool BacktrackSolver::solveWithBacktracking() {
    std::vector<std::vector<Point>> parent(height, std::vector<Point>(width, {-1, -1}));
    
    std::stack<Point> s;
    s.push(start);
    visited[start.y][start.x] = true;
    steps.push_back({ "visit", start.x, start.y });
    steps.push_back({ "current", start.x, start.y });

    while (!s.empty()) {
        Point current = s.top();

        if (current.x == end.x && current.y == end.y) {
            Point p = end;
            while (!(p.x == start.x && p.y == start.y)) {
                solution_path.push_back(p);
                p = parent[p.y][p.x];
            }
            solution_path.push_back(start);
            std::reverse(solution_path.begin(), solution_path.end());
            return true;
        }

        bool found_neighbor = false;
        for (int i = 0; i < 4; i++) {
            int newX = current.x + dx[i];
            int newY = current.y + dy[i];

            if (isValid(newX, newY)) {
                visited[newY][newX] = true;
                parent[newY][newX] = current;
                s.push({newX, newY});
                steps.push_back({ "visit", newX, newY });
                steps.push_back({ "current", newX, newY });
                found_neighbor = true;
                break;
            }
        }

        if (!found_neighbor) {
            steps.push_back({ "backtrack", current.x, current.y });
            s.pop();
        }
    }

    return false;
}

// Public interface to solve the maze from an input file.
nlohmann::json BacktrackSolver::solve(const std::string& inputFile) {
    nlohmann::json result;

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
    maze = input["maze"].get<std::vector<std::vector<int>>>();
    visited.assign(height, std::vector<bool>(width, false));
    
    // Clear previous results
    steps.clear();
    solution_path.clear();

    bool found = solveWithBacktracking();

    if (found) {
        for (const auto& p : solution_path) {
            steps.push_back({ "solution", p.x, p.y });
        }
    }

    result["found"] = found;
    result["pathLength"] = found ? static_cast<int>(solution_path.size()) : 0;

    int visited_count = 0;
    for (int r = 0; r < height; ++r) {
        for (int c = 0; c < width; ++c) {
            if (visited[r][c]) {
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
