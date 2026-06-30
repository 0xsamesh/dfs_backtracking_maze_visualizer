const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Maze solving endpoint
app.post('/solve', async (req, res) => {
    try {
        const { maze, width, height, start, end, algorithm } = req.body;
        
        // Validate input
        if (!maze || !width || !height || !start || !end || !algorithm) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Create temporary maze file
        const mazeData = {
            width,
            height,
            start,
            end,
            maze
        };
        
        const tempFile = path.join(__dirname, 'temp_maze.json');
        await fs.writeFile(tempFile, JSON.stringify(mazeData));
        
        // Choose algorithm executable
        const algorithmFile = 'main_solver'; // Use unified solver for both algorithms
        const executablePath = path.join(__dirname, 'algorithms', algorithmFile);
        
        // Execute C++ solver
        const result = await executeAlgorithm(executablePath, tempFile, algorithm);
        
        // Clean up temporary file
        try {
            await fs.unlink(tempFile);
        } catch (err) {
            console.warn('Could not delete temporary file:', err.message);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error solving maze:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Execute algorithm function
function executeAlgorithm(executablePath, inputFile, algorithm = 'dfs') {
    return new Promise((resolve, reject) => {
        const process = spawn(executablePath, [inputFile, algorithm]);
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Algorithm failed with code ${code}: ${stderr}`));
                return;
            }
            
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (parseError) {
                reject(new Error(`Failed to parse algorithm output: ${parseError.message}`));
            }
        });
        
        process.on('error', (error) => {
            reject(new Error(`Failed to execute algorithm: ${error.message}`));
        });
        
        // Set timeout for long-running algorithms
        setTimeout(() => {
            process.kill();
            reject(new Error('Algorithm execution timeout'));
        }, 30000); // 30 seconds timeout
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
