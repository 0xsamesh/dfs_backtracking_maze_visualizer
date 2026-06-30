#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <chrono>
#include <thread>
#include <random>
#include <iomanip>
#include <cstdlib>
#include <limits> // Required for numeric_limits
#include <algorithm> // Required for shuffle
#include <iterator>  // Required for begin and end

#include "json.hpp"
#include "algorithms/dfs_solver.hpp"
#include "algorithms/backtrack_solver.hpp"

#ifdef _WIN32
#include <windows.h>
#endif

using json = nlohmann::json;
using namespace std;

// Enum to identify which algorithm to use
enum class Algorithm {
    DFS,       // Your recursive DFS in dfs_solver.cpp
    BACKTRACK  // Your iterative backtracking solver in backtrack_solver.cpp
};

class Maze {
private:
    int width, height;
    Point start, end;
    vector<vector<int>> grid;
    int animation_speed_ms;
    Algorithm current_algorithm;

public:
    Maze() : animation_speed_ms(50), current_algorithm(Algorithm::DFS) {
        ifstream f("input.txt");
        if (f.good()) {
            loadFromFile("input.txt");
        } else {
            // If no input.txt, create a small default maze
            generateNewMaze(15, 9);
        }
    }

    void generateNewMaze(int w, int h) {
        width = w;
        height = h;
        // The generator requires start/end points to be at odd coordinates to be solvable.
        start = {1, 1};
        // Find the largest odd coordinate within the bounds for the end point.
        int end_x = (w - 1) % 2 == 0 ? w - 2 : w - 3;
        int end_y = (h - 1) % 2 == 0 ? h - 2 : h - 3;
        // Ensure end points are valid and not less than start.
        if (end_x < 1) end_x = 1;
        if (end_y < 1) end_y = 1;
        end = {end_x, end_y};
        generateRandom();
    }

    void carve(int x, int y, mt19937& g) {
        grid[y][x] = 0; // Mark as path

        int dirs[] = {0, 1, 2, 3};
        shuffle(std::begin(dirs), std::end(dirs), g);

        for (int dir : dirs) {
            int nx = x, ny = y;
            int wall_x = x, wall_y = y;

            if (dir == 0) { ny -= 2; wall_y -= 1; }      // North
            else if (dir == 1) { ny += 2; wall_y += 1; } // South
            else if (dir == 2) { nx += 2; wall_x += 1; } // East
            else { nx -= 2; wall_x -= 1; }               // West

            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && grid[ny][nx] == 1) {
                grid[wall_y][wall_x] = 0;
                carve(nx, ny, g);
            }
        }
    }

    void generateRandom() {
        grid.assign(height, vector<int>(width, 1));
        
        random_device rd;
        mt19937 g(rd());

        carve(start.x, start.y, g);

        grid[start.y][start.x] = 0;
        grid[end.y][end.x] = 0;
    }

    void clearMaze() {
        grid.assign(height, vector<int>(width, 0));
    }

    void printMaze(const vector<Point>& path = {}, const Point* current = nullptr, const vector<vector<bool>>* visited = nullptr) {
        #ifdef _WIN32
            system("cls");
        #else
            system("clear");
        #endif

        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                bool is_path = false;
                for (const auto& p : path) {
                    if (p.x == x && p.y == y) {
                        is_path = true;
                        break;
                    }
                }

                if (x == start.x && y == start.y) {
                    cout << "S ";
                } else if (x == end.x && y == end.y) {
                    cout << "E ";
                } else if (is_path) {
                    cout << "$ "; // Solution path
                } else if (current && current->x == x && current->y == y) {
                    cout << "@ "; // Current solving position
                } else if (grid[y][x] == 1) {
                    cout << "# "; // Wall
                } else if (visited && (*visited)[y][x]) {
                    cout << "& "; // Visited but not path
                } else {
                    cout << ". "; // Open space
                }
            }
            cout << endl;
        }
    }

    void saveToTempFile(const string& filename) {
        json j;
        j["width"] = width;
        j["height"] = height;
        j["start"] = {{"x", start.x}, {"y", start.y}};
        j["end"] = {{"x", end.x}, {"y", end.y}};
        j["maze"] = grid;
        
        ofstream file(filename);
        file << setw(4) << j << endl;
    }

    void animateConsoleSolution() {
        string temp_filename = "temp_maze.json";
        saveToTempFile(temp_filename);

        json result;
        if (current_algorithm == Algorithm::DFS) {
            DFSSolver solver;
            result = solver.solve(temp_filename);
        } else { // BACKTRACK
            BacktrackSolver solver;
            result = solver.solve(temp_filename);
        }

        if (result.contains("error")) {
            cout << "An error occurred: " << result["error"].get<string>() << endl;
            return;
        }

        vector<vector<bool>> visited(height, vector<bool>(width, false));
        vector<Point> current_path; // Represents the current path being explored

        for (const auto& step : result["steps"]) {
            Point current_pos = {step["x"].get<int>(), step["y"].get<int>()};
            string action = step["action"].get<string>();

            if (action == "visit") {
                visited[current_pos.y][current_pos.x] = true;
                current_path.push_back(current_pos); // Add to current path
            } else if (action == "backtrack") {
                // When backtracking, remove the node from our path to visualize the "undo"
                if (!current_path.empty()) {
                    current_path.pop_back();
                }
            }
            printMaze(current_path, &current_pos, &visited);
            this_thread::sleep_for(chrono::milliseconds(animation_speed_ms));
        }

        if (result["found"].get<bool>()) {
            cout << "\nSolution Found!" << endl;
        } else {
            cout << "\nSolution not found." << endl;
        }
    }

    void saveToFile(const string& filename) {
        saveToTempFile(filename);
        cout << "Maze saved to " << filename << endl;
    }

    void loadFromFile(const string& filename) {
        ifstream file(filename);
        if (!file.is_open()) {
            cout << "Error: Could not open file " << filename << endl;
            return;
        }
        json j;
        file >> j;
        width = j["width"];
        height = j["height"];
        start = {j["start"]["x"], j["start"]["y"]};
        end = {j["end"]["x"], j["end"]["y"]};
        grid = j["maze"].get<vector<vector<int>>>();
        cout << "Maze loaded from " << filename << endl;
    }

    void setAnimationSpeed(int speed) {
        animation_speed_ms = speed;
    }

    int getAnimationSpeed() const {
        return animation_speed_ms;
    }

    void setAlgorithm(Algorithm algo) {
        current_algorithm = algo;
    }

    string getAlgorithmName() const {
        if (current_algorithm == Algorithm::DFS) {
            return "DFS (Recursive)";
        } else {
            return "Backtrack";
        }
    }
};

void showMenu(const Maze& maze) {
    cout << "\n--- C++ Maze Solver ---" << endl;
    cout << "Current Algorithm: " << maze.getAlgorithmName() << endl;
    cout << "Current Speed: " << maze.getAnimationSpeed() << "ms" << endl;
    cout << "-----------------------" << endl;
    cout << "1. Select Algorithm" << endl;
    cout << "2. Solve Maze" << endl;
    cout << "3. Generate Random Maze" << endl;
    cout << "4. Clear Maze" << endl;
    cout << "5. Change Animation Speed" << endl;
    cout << "6. Load Maze from File" << endl;
    cout << "7. Save Maze to File" << endl;
    cout << "9. Exit" << endl;
    cout << "Enter your choice: ";
}

int main(int argc, char* argv[]) {
    if (argc > 1) { // Server mode for web visualizer
        string filename = argv[1];
        string algo_name = (argc > 2) ? argv[2] : "dfs";

        json result;
        if (algo_name == "backtrack") {
            BacktrackSolver solver;
            result = solver.solve(filename);
        } else {
            DFSSolver solver;
            result = solver.solve(filename);
        }
        cout << result.dump(4) << endl;
        return 0;
    }

    // Interactive Console Mode
    Maze maze;
    int choice;

    while (true) {
        maze.printMaze();
        showMenu(maze);
        cin >> choice;

        if (cin.fail()) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            choice = 0; // Invalid choice
        }

        switch (choice) {
            case 1: {
                int algo_choice;
                cout << "Select Algorithm:\n1. DFS (Recursive)\n2. Backtrack\nEnter choice: ";
                cin >> algo_choice;
                if (algo_choice == 1) {
                    maze.setAlgorithm(Algorithm::DFS);
                } else if (algo_choice == 2) {
                    maze.setAlgorithm(Algorithm::BACKTRACK);
                }
                break;
            }
            case 2:
                maze.animateConsoleSolution();
                cout << "Press Enter to continue...";
                cin.ignore();
                cin.get();
                break;
            case 3: {
                int new_width, new_height;
                cout << "Enter your width: ";
                cin >> new_width;
                cout << "Enter your height: ";
                cin >> new_height;

                if (cin.fail() || new_width < 3 || new_height < 3) {
                    cout << "Invalid dimensions. Please enter values greater than 2." << endl;
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    this_thread::sleep_for(chrono::seconds(2));
                } else {
                    maze.generateNewMaze(new_width, new_height);
                }
                break;
            }
            case 4:
                maze.clearMaze();
                break;
            case 5: {
                int speed;
                cout << "Enter animation speed in ms (e.g., 50): ";
                cin >> speed;
                if (!cin.fail() && speed > 0) {
                    maze.setAnimationSpeed(speed);
                }
                break;
            }
            case 6: {
                string filename;
                cout << "Enter filename to load: ";
                cin >> filename;
                maze.loadFromFile(filename);
                break;
            }
            case 7: {
                string filename;
                cout << "Enter filename to save: ";
                cin >> filename;
                maze.saveToFile(filename);
                break;
            }
            case 9:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice. Please try again." << endl;
                this_thread::sleep_for(chrono::seconds(1));
                break;
        }
    }

    return 0;
}