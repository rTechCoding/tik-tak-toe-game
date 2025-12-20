
let board = Array(9).fill(null);
let isXNext = true;
let winner = null;
let mode = null;
let difficulty = null;
let scores = { X: 0, O: 0, draws: 0 };
let playerXName = "Player X";
let playerOName = "Player O";

function selectMode(m) {
    mode = m;
    modeScreen.classList.add('hidden');
    playerNamePopup.classList.remove('hidden');
    playerXInput.value = "";
    playerOInput.value = "";

    if (m === 'vsComputer') {
        popupTitle.textContent = "Enter Your Name";
        playerOInput.classList.add('hidden');
    } else {
        popupTitle.textContent = "Enter Player Names";
        playerOInput.classList.remove('hidden');
    }
}

function confirmNames() {
    let valid = true;

    const xInput = document.getElementById('playerXInput');
    const oInput = document.getElementById('playerOInput');

    const errorX = document.getElementById('errorX');
    const errorO = document.getElementById('errorO');

    // Reset
    errorX.style.display = 'none';
    errorO.style.display = 'none';
    xInput.style.border = '';
    oInput.style.border = '';

    // Validate Player X
    if (xInput.value.trim() === '') {
        errorX.style.display = 'block';
        xInput.style.border = '2px solid red';
        valid = false;
    }

    // Validate Player O (only in 2 player mode)
    if (mode === '2player' && oInput.value.trim() === '') {
        errorO.style.display = 'block';
        oInput.style.border = '2px solid red';
        valid = false;
    }

    if (!valid) return;

    // Assign names
    playerXName = xInput.value.trim();
    playerOName = mode === 'vsComputer'
        ? 'Computer'
        : oInput.value.trim();

    document.getElementById('playerNamePopup').classList.add('hidden');

    document.getElementById('playerXLabel').textContent = playerXName;
    document.getElementById('playerOLabel').textContent = playerOName;

    if (mode === 'vsComputer') {
        document.getElementById('difficultyScreen').classList.remove('hidden');
    } else {
        startGame();
    }
}


function selectDifficulty(selectedDifficulty) {
    difficulty = selectedDifficulty;
    document.getElementById('difficultyScreen').classList.add('hidden');
    document.getElementById('playerOLabel').textContent = 'Computer';
    startGame();
}

function backToMode() {
    document.getElementById('difficultyScreen').classList.add('hidden');
    document.getElementById('modeScreen').classList.remove('hidden');
}

function startGame() {
    document.getElementById('gameScreen').classList.remove('hidden');
    renderBoard();
    updateStatus();
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (board[i]) {
            cell.textContent = board[i];
            cell.classList.add('filled', board[i].toLowerCase());
        }
        cell.onclick = () => handleClick(i);
        boardEl.appendChild(cell);
    }

    if (winner && winner.line) {
        winner.line.forEach(idx => {
            boardEl.children[idx].classList.add('winning');
        });
    }
}

function handleClick(index) {
    if (board[index] || winner) return;

    board[index] = isXNext ? 'X' : 'O';
    checkWinner();
    isXNext = !isXNext;
    renderBoard();
    updateStatus();

    if (mode === 'vsComputer' && !isXNext && !winner) {
        setTimeout(makeComputerMove, 500);
    }
}

function makeComputerMove() {
    const emptySquares = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

    if (emptySquares.length === 0) return;

    let moveIndex;

    // Easy: 70% random
    if (difficulty === 'easy' && Math.random() < 0.7) {
        moveIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
    // Medium: 40% random
    else if (difficulty === 'medium' && Math.random() < 0.4) {
        moveIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
    // Smart move
    else {
        moveIndex = findBestMove(emptySquares);
    }

    handleClick(moveIndex);
}

function findBestMove(emptySquares) {
    // Try to win
    for (let idx of emptySquares) {
        const testBoard = [...board];
        testBoard[idx] = 'O';
        if (checkWinnerForBoard(testBoard) === 'O') {
            return idx;
        }
    }

    // Block player
    for (let idx of emptySquares) {
        const testBoard = [...board];
        testBoard[idx] = 'X';
        if (checkWinnerForBoard(testBoard) === 'X') {
            return idx;
        }
    }

    // Take center
    if (board[4] === null) return 4;

    // Take corner
    const corners = [0, 2, 6, 8].filter(idx => board[idx] === null);
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Take any
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}

function checkWinner() {
    const result = checkWinnerForBoard(board);
    if (result) {
        if (result === 'draw') {
            winner = { winner: 'draw', line: null };
            scores.draws++;
        } else {
            const lines = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            for (let line of lines) {
                const [a, b, c] = line;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    winner = { winner: board[a], line: line };
                    if (result === 'X') scores.X++;
                    else scores.O++;
                    break;
                }
            }
        }
        updateScores();
    }
}

function checkWinnerForBoard(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
        const [a, b, c] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }

    if (squares.every(square => square !== null)) {
        return 'draw';
    }

    return null;
}

function updateStatus() {
    const statusEl = document.getElementById('status');

    if (winner) {
        if (winner.winner === 'draw') {
            statusEl.textContent = "It's a Draw! 🤝";
            statusEl.style.color = '#6b7280';
        } else {
            const winnerName =
                winner.winner === 'X'
                    ? playerXName
                    : (mode === 'vsComputer' ? 'Computer' : playerOName);

            statusEl.textContent = `${winnerName} Wins! 🎉`;
            statusEl.style.color = winner.winner === 'X' ? '#2563eb' : '#dc2626';
        }
    } else {
        const currentPlayer = isXNext
            ? `${playerXName} Turn`
            : (mode === 'vsComputer' ? "Computer Turn" : `${playerOName} Turn`);

        statusEl.textContent = currentPlayer;
        statusEl.style.color = isXNext ? '#2563eb' : '#dc2626';
    }
}


function updateScores() {
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    document.getElementById('scoreDraws').textContent = scores.draws;
}

function resetGame() {
    board = Array(9).fill(null);
    isXNext = true;
    winner = null;
    renderBoard();
    updateStatus();
}

function changeMode() {
    board = Array(9).fill(null);
    isXNext = true;
    winner = null;
    mode = null;
    difficulty = null;
    scores = { X: 0, O: 0, draws: 0 };

    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('modeScreen').classList.remove('hidden');
    updateScores();
}

// back button name
function backFromNamePopup() {
    // Hide name popup
    document.getElementById('playerNamePopup').classList.add('hidden');

    // Clear input fields & errors
    document.getElementById('playerXInput').value = '';
    document.getElementById('playerOInput').value = '';

    const errorX = document.getElementById('errorX');
    const errorO = document.getElementById('errorO');

    if (errorX) errorX.style.display = 'none';
    if (errorO) errorO.style.display = 'none';

    // Reset input borders
    document.getElementById('playerXInput').style.border = '';
    document.getElementById('playerOInput').style.border = '';

    // Go back to mode selection
    document.getElementById('modeScreen').classList.remove('hidden');

    // Hide difficulty screen if it was opened
    document.getElementById('difficultyScreen').classList.add('hidden');

    // Reset mode selection
    mode = null;
}


/* Disable Right Click */
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

/* Disable DevTools key shortcuts */
document.addEventListener('keydown', function (e) {

    // F12
    if (e.key === "F12") {
        e.preventDefault();
        return false;
    }

    // Ctrl + Shift + I / J / C
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
    }

    // Ctrl + U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        return false;
    }

    // Ctrl + S (Save Page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        return false;
    }
});

/* Extra: Detect DevTools open (basic) */
setInterval(() => {
    const threshold = 160;
    if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
    ) {
        document.body.innerHTML = "<h2 style='text-align:center;margin-top:20%;'>⚠ Developer Tools Detected</h2>";
    }
}, 1000);