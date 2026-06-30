#include <iostream>
#include "common.hpp"
#include "dfs_solver.cpp"
#include "backtrack_solver.cpp"
#include "json.hpp"

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <input_file> <algorithm>" << std::endl;
        return 1;
    }

    std::string input_file = argv[1];
    std::string algorithm = argv[2];

    nlohmann::json result;

    if (algorithm == "dfs") {
        DFSSolver solver;
        result = solver.solve(input_file);
    } else if (algorithm == "backtrack") {
        BacktrackSolver solver;
        result = solver.solve(input_file);
    } else {
        std::cerr << "Unknown algorithm: " << algorithm << std::endl;
        return 1;
    }

    std::cout << result.dump(4) << std::endl;
    return 0;
}
