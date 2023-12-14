"use strict";

const createTetrisGame = () => {
  const canvas = document.querySelector("#tetrisCanvas");
  const context = canvas.getContext("2d");
  const blockSize = 30;
  const rows = canvas.height / blockSize;
  const cols = canvas.width / blockSize;

  let board = Array.from({ length: rows }, () => Array(cols).fill(0));
  let score = 0;
  let currentPiece = null;
  let currentPieceColor = null;
  let currentPieceX = null;
  let currentPieceY = null;
  let isPaused = false;
  let moveDownInterval;

  const drawSquare = (x, y, color) => {
    context.fillStyle = color;
    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    context.strokeStyle = "#555";
    context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
  };

  const drawBoard = () => {
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          drawSquare(colIndex, rowIndex, cell);
        }
      });
    });
  };

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawCurrentPiece();
    document.querySelector(
      "#score"
    ).innerText = `Кількість набраних балів: ${score}`;
  };

  const drawCurrentPiece = () => {
    if (currentPiece) {
      currentPiece.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          if (col) {
            drawSquare(
              currentPieceX + colIndex,
              currentPieceY + rowIndex,
              currentPieceColor
            );
          }
        });
      });
    }
  };

  const moveDown = () => {
    if (!isPaused) {
      currentPieceY++;
      if (collision()) {
        currentPieceY--;
        mergePiece();
        removeCompletedRows();
        spawnPiece();
      }
    }
    draw();
  };

  const moveLeft = () => {
    if (!isPaused) {
      currentPieceX--;
      if (collision()) {
        currentPieceX++;
      }
    }
    draw();
  };

  const moveRight = () => {
    if (!isPaused) {
      currentPieceX++;
      if (collision()) {
        currentPieceX--;
      }
    }
    draw();
  };

  const rotatePiece = (clockwise = true) => {
    if (!isPaused) {
      const newPiece = clockwise
        ? rotate(currentPiece)
        : rotate(rotate(rotate(currentPiece)));
      if (!collision(newPiece)) {
        currentPiece = newPiece;
      }
    }
    draw();
  };

  const collision = (piece = currentPiece) => {
    return piece.some((row, rowIndex) =>
      row.some(
        (col, colIndex) =>
          col &&
          (currentPieceY + rowIndex >= rows ||
            currentPieceX + colIndex < 0 ||
            currentPieceX + colIndex >= cols ||
            board[currentPieceY + rowIndex][currentPieceX + colIndex] !== 0)
      )
    );
  };

  const mergePiece = () => {
    currentPiece.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col) {
          if (board[currentPieceY + rowIndex]) {
            board[currentPieceY + rowIndex][currentPieceX + colIndex] =
              currentPieceColor;
          }
        }
      });
    });
  };

  const removeCompletedRows = () => {
    for (let row = rows - 1; row >= 0; row--) {
      if (board[row] && board[row].every((cell) => cell !== 0)) {
        board.splice(row, 1);
        board.unshift(Array(cols).fill(0));
        score += 100;
      }
    }
  };

  const rotate = (piece) => {
    return piece[0].map((_, i) => piece.map((row) => row[i]).reverse());
  };

  const spawnPiece = () => {
    const pieces = [
      [[1, 1, 1, 1]],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 1],
        [0, 0, 1],
      ],
    ];
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = randomPiece;
    currentPieceColor = `rgb(${Math.random() * 255},${Math.random() * 255},${
      Math.random() * 255
    })`;
    currentPieceX = Math.floor((cols - currentPiece[0].length) / 2);
    currentPieceY = 0;
    if (collision()) {
      alert(`Гра завершилась! Твої бали: ${score}`);
      resetGame();
    }
  };

  const resetGame = () => {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    spawnPiece();
    resumeGame();
  };

  const togglePause = () => {
    isPaused = !isPaused;
  };

  const pauseGame = () => {
    clearInterval(moveDownInterval);
  };

  const resumeGame = () => {
    moveDownInterval = setInterval(moveDown, 1000);
  };

  const handlePauseToggle = () => {
    togglePause();
    if (isPaused) {
      pauseGame();
    } else {
      resumeGame();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Escape") {
      handlePauseToggle();
    } else if (!isPaused) {
      switch (event.key) {
        case "ArrowUp":
          rotatePiece();
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case " ":
          rotatePiece();
          break;
      }
    }
  };

  const initialize = () => {
    document.addEventListener("keydown", handleKeyPress);
    spawnPiece();
    resumeGame();
    draw();
  };

  return {
    initialize,
  };
};

const tetrisGame = createTetrisGame();
tetrisGame.initialize();
