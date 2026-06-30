#!/bin/bash

# Compile the C++ maze solver.
# main_solver.cpp #includes the solver .cpp files and the vendored json.hpp,
# so it is compiled as a single translation unit (no extra files / libraries needed).

echo "Compiling maze solver..."
g++ -std=c++17 -o main_solver main_solver.cpp

if [ $? -eq 0 ]; then
    echo "Compiled successfully -> ./main_solver"
    echo ""
    echo "Usage:"
    echo "  ./main_solver <input_file.json> <dfs|backtrack>"
    echo ""
    echo "Example:"
    echo "  ./main_solver ../input.txt dfs"
else
    echo "Compilation failed."
    exit 1
fi
