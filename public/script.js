const socket = io();
const chess = new Chess();
const boardElements = document.querySelector(".chessboard");

let draggerPiece = null;
let source = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElements.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, sqrIndex) => {
      const squareElement = document.createElement("div");

      squareElement.classList.add(
        "square",
        (rowIndex + sqrIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = sqrIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggerPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: sqrIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggerPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggerPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });

      boardElements.appendChild(squareElement);
    });
  });


  if (playerRole === 'b'){
    boardElements.classList.add("flipped");
  }
  else{
    boardElements.classList.remove('flipped')
  }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move", move)
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙ ",  
        r: "♜",  
        n: "♞",  
        b: "♝",  
        q: "♛",  
        k: "♚",  
        P: "♙",  
        R: "♖",  
        N: "♘",  
        B: "♗",  
        Q: "♕",  
        K: "♔",  
    };

    return unicodePieces[piece.type] || "";
};


socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});
socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});
socket.on("boardState", function(fen) {
    chess.load(fen);
    renderBoard();
})
socket.on("move", function(move) {
    chess.move(move);
    renderBoard();
})
renderBoard();
