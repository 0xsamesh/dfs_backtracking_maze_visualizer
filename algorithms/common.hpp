#ifndef COMMON_HPP
#define COMMON_HPP

#include <string>
#include <vector>

// Represents a point in the maze.
struct Point {
    int x, y;
    Point(int x = 0, int y = 0) : x(x), y(y) {}
};

// Represents a single step in the solving process for visualization.
struct Step {
    std::string action; // e.g., "visit", "current", "backtrack", "solution"
    int x, y;
};

#endif // COMMON_HPP
