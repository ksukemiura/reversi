document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const BOARD_SIZE = 8;
    const EMPTY = 0;
    const BLACK = 1;
    const WHITE = 2;
    
    // Game state variables
    let board = [];
    let currentPlayer = BLACK;
    let gameOver = false;
    
    // DOM elements
    const boardElement = document.getElementById('board');
    const currentTurnElement = document.getElementById('current-turn');
    const blackCountElement = document.getElementById('black-count');
    const whiteCountElement = document.getElementById('white-count');
    const resetButton = document.getElementById('reset-button');
    const gameOverElement = document.getElementById('game-over');
    const winnerElement = document.getElementById('winner');
    const playAgainButton = document.getElementById('play-again');
    
    // Initialize game
    initializeGame();
    
    // Event listeners
    resetButton.addEventListener('click', initializeGame);
    playAgainButton.addEventListener('click', initializeGame);
    
    // Initialize the game
    function initializeGame() {
        // Create and initialize the game board
        board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
        
        // Set up the initial position
        board[3][3] = WHITE;
        board[3][4] = BLACK;
        board[4][3] = BLACK;
        board[4][4] = WHITE;
        
        // Set the starting player
        currentPlayer = BLACK;
        gameOver = false;
        
        // Clear the game over screen
        gameOverElement.classList.add('hidden');
        
        // Update the turn indicator
        updateTurnIndicator();
        
        // Render the board
        renderBoard();
        
        // Update the score
        updateScore();
        
        // Show valid moves
        showValidMoves();
    }
    
    // Render the board
    function renderBoard() {
        // Clear the board element
        boardElement.innerHTML = '';
        
        // Create cells for each position
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add a disc if there's one at this position
                if (board[row][col] !== EMPTY) {
                    const disc = document.createElement('div');
                    disc.classList.add('disc');
                    disc.classList.add(board[row][col] === BLACK ? 'black' : 'white');
                    cell.appendChild(disc);
                }
                
                // Add click event listener
                cell.addEventListener('click', () => handleCellClick(row, col));
                
                // Add the cell to the board
                boardElement.appendChild(cell);
            }
        }
    }
    
    // Handle cell click
    function handleCellClick(row, col) {
        // Ignore clicks if the game is over or if the move is invalid
        if (gameOver || !isValidMove(row, col, currentPlayer)) {
            return;
        }
        
        // Make the move
        makeMove(row, col, currentPlayer);
        
        // Switch players
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        
        // Update the turn indicator
        updateTurnIndicator();
        
        // Check if the next player has any valid moves
        if (!hasValidMoves(currentPlayer)) {
            // If not, switch back to the previous player
            currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
            
            // Check if the previous player has any valid moves
            if (!hasValidMoves(currentPlayer)) {
                // If not, the game is over
                endGame();
            } else {
                // Update the turn indicator again
                updateTurnIndicator();
            }
        }
        
        // Show valid moves for the current player
        showValidMoves();
    }
    
    // Check if a move is valid
    function isValidMove(row, col, player) {
        // If the cell is not empty, it's not a valid move
        if (board[row][col] !== EMPTY) {
            return false;
        }
        
        // Direction vectors for all 8 directions
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        // The opponent's disc color
        const opponent = player === BLACK ? WHITE : BLACK;
        
        // Check if there's at least one direction where we can flip discs
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            let foundOpponent = false;
            
            // Keep moving in this direction until we hit the edge or an empty cell
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                if (board[r][c] === EMPTY) {
                    // If we hit an empty cell, this direction doesn't work
                    break;
                } else if (board[r][c] === opponent) {
                    // If we hit an opponent's disc, we might be able to flip discs in this direction
                    foundOpponent = true;
                } else if (board[r][c] === player) {
                    // If we hit our own disc and we've also seen opponent discs, this is a valid move
                    if (foundOpponent) {
                        return true;
                    }
                    // Otherwise, this direction doesn't work
                    break;
                }
                
                // Move to the next cell in this direction
                r += dr;
                c += dc;
            }
        }
        
        // If we haven't found any direction where we can flip discs, this move is invalid
        return false;
    }
    
    // Make a move
    function makeMove(row, col, player) {
        // Place the player's disc at the specified position
        board[row][col] = player;
        
        // Direction vectors for all 8 directions
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        // The opponent's disc color
        const opponent = player === BLACK ? WHITE : BLACK;
        
        // Check each direction and flip discs if needed
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            let discsToFlip = [];
            
            // Keep moving in this direction until we hit the edge or an empty cell
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                if (board[r][c] === EMPTY) {
                    // If we hit an empty cell, this direction doesn't work
                    discsToFlip = [];
                    break;
                } else if (board[r][c] === opponent) {
                    // If we hit an opponent's disc, we might be able to flip it
                    discsToFlip.push([r, c]);
                } else if (board[r][c] === player) {
                    // If we hit our own disc, we can flip all opponent discs in between
                    break;
                }
                
                // Move to the next cell in this direction
                r += dr;
                c += dc;
            }
            
            // If we hit our own disc, flip all opponent discs in between
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                for (const [flipRow, flipCol] of discsToFlip) {
                    board[flipRow][flipCol] = player;
                }
            }
        }
        
        // Update the board
        renderBoard();
        
        // Update the score
        updateScore();
    }
    
    // Check if a player has any valid moves
    function hasValidMoves(player) {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (isValidMove(row, col, player)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Show valid moves for the current player
    function showValidMoves() {
        // Remove the 'valid-move' class from all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('valid-move');
        });
        
        // Add the 'valid-move' class to cells that are valid moves for the current player
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (isValidMove(row, col, currentPlayer)) {
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('valid-move');
                }
            }
        }
    }
    
    // Update the turn indicator
    function updateTurnIndicator() {
        currentTurnElement.textContent = currentPlayer === BLACK ? 'Black' : 'White';
    }
    
    // Update the score
    function updateScore() {
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] === BLACK) {
                    blackCount++;
                } else if (board[row][col] === WHITE) {
                    whiteCount++;
                }
            }
        }
        
        blackCountElement.textContent = blackCount;
        whiteCountElement.textContent = whiteCount;
    }
    
    // End the game
    function endGame() {
        gameOver = true;
        
        // Count discs
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] === BLACK) {
                    blackCount++;
                } else if (board[row][col] === WHITE) {
                    whiteCount++;
                }
            }
        }
        
        // Determine the winner
        let winnerText;
        if (blackCount > whiteCount) {
            winnerText = 'Black wins!';
        } else if (whiteCount > blackCount) {
            winnerText = 'White wins!';
        } else {
            winnerText = 'It\'s a tie!';
        }
        
        // Update the winner text
        winnerElement.textContent = `${blackCount} - ${whiteCount}. ${winnerText}`;
        
        // Show the game over screen
        gameOverElement.classList.remove('hidden');
    }
});