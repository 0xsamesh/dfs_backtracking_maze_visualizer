#ifndef DFS_SOLVER_HPP
#define DFS_SOLVER_HPP

#include "common.hpp"
#include "json.hpp"
#include <string>
#include <vector>

class DFSSolver {
public:
    nlohmann::json solve(const std::string& inputFile);

private:
    std::vector<std::vector<int>> maze;
    std::vector<std::vector<bool>> visited;
    int width, height;
    Point start, end;
    std::vector<Step> steps;
    std::vector<Point> solution_path;

    int dx[4] = {0, 1, 0, -1};
    int dy[4] = {-1, 0, 1, 0};

    bool isValid(int x, int y);
    bool solveRecursive(int x, int y);
};

#endif // DFS_SOLVER_HPP
