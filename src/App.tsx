import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, PAWN } from "chess.ts";
import "./App.css";

export default function App() {
  const [currentPosition, setCurrentPosition] = useState(new Chess());

  // --- Piece-Square Tables ---
  // These tables map out a chess board from white's perspective reading each square
  // left to right, then top to bottom, just like FEN notation would.
  // The tables themselves and their descriptions are pulled directly from the
  // chessprogramming wiki page: https://www.chessprogramming.org/Simplified_Evaluation_Function#Piece-Square_Tables
  // *Note*: My auto formatting fucks up how the arrays look visually, but their contents
  // are still identical to how they would look on a chessboad.

  // "For pawns we simply encourage the pawns to advance. Additionally we try to
  // discourage the engine from leaving central pawns unmoved. The problem I could
  // see here is that this is contradictory to keeping pawns in front of the king.
  // We also ignore the factor whether the pawn is passed or not. So more advanced
  // evaluation is called for, especially that "pawns are soul of the game"."
  const blackPawnSquares: number[] = [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0,
    -10, -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10,
    20, 30, 30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0,
    0,
  ];

  const whitePawnSquares: number[] = [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
    20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5,
    -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0,
    0,
  ];

  // With knights we simply encourage them to go to the center. Standing on the edge
  // is a bad idea. Standing in the corner is a terrible idea. Probably it was Tartakover
  // who said that "one piece stands badly, the whole game stands badly". And knights move slowly.
  const blackKnightSquares: number[] = [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
    5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20,
    20, 15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20,
    -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ];

  const whiteKnightSquares: number[] = [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
    0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
    20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
    -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ];

  // We avoid corners and borders. Additionally we prefer squares like b3, c4, b5, d3
  // and the central ones. Moreover, I wouldn't like to exchange white bishop at d3 (or c3)
  //  for black knight at e4, so squares at c3 (f3) have value of 10. As a result white bishop
  // at d3 (c3) is worth (330+10) and black knight at e4 is worth (320+20). So the choice of
  // whether to exchange or not should depend on other issues. On the contrary white bishop
  // at e4 (330+10) would be captured by black knight from f6 (320+10). White bishop at g5 (330+5)
  // won't capture black knight at f6 (320+10).
  const blackBishopSquares: number[] = [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10,
    10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10,
    5, 5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20,
    -10, -10, -10, -10, -10, -10, -20,
  ];

  const whiteBishopSquares: number[] = [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10,
    0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20,
    -10, -10, -10, -10, -10, -10, -20,
  ];

  // The only ideas which came to my mind was to centralize, occupy the 7th rank,
  // and avoid a, h columns (in order not to defend pawn b3 from a3). So generally
  // this is Gerbil like. (https://www.chessprogramming.org/Gerbil)
  const blackRookSquares: number[] = [
    0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
    -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  const whiteRookSquares: number[] = [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
    -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
    0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ];

  // Generally with queen I marked places where I wouldn't like to have a queen.
  // Additionally I slightly marked central squares to keep the queen in the centre
  // and b3, c2 squares (Paweł's suggestion). The rest should be done by tactics.
  const blackQueenSquares: number[] = [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 5, 0, 0, 0, 0, -10, -10, 5, 5,
    5, 5, 5, 0, -10, 0, 0, 5, 5, 5, 5, 0, -5, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0,
    5, 5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ];

  const whiteQueenSquares: number[] = [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
    5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5,
    5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ];

  // --- Note about the king ---
  // Different tables are used for the opening and middle game, and the end game.
  // The first priortises king saftey by castling, and the second priortises king activity.

  // Additionally we should define where the ending begins. For me it might be either if:
  // 1. Both sides have no queens or
  // 2. Every side which has a queen has additionally no other pieces or one minorpiece maximum.

  const blackKingSquaresEarlyAndMiddleGame: number[] = [
    20, 30, 10, 0, 0, 10, 30, 20, 20, 20, 0, 0, 0, 0, 20, 20, -10, -20, -20,
    -20, -20, -20, -20, -10, -20, -30, -30, -40, -40, -30, -30, -20, -30, -40,
    -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30,
    -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
  ];

  const whiteKingSquaresEarlyAndMiddleGame: number[] = [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
    -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
    -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ];

  const blackKingSquaresEndGame: number[] = [
    -50, -30, -30, -30, -30, -30, -30, -50, -30, -30, 0, 0, 0, 0, -30, -30, -30,
    -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10,
    30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -20, -10,
    0, 0, -10, -20, -30, -50, -40, -30, -20, -20, -30, -40, -50,
  ];

  const whiteKingSquaresEndGame: number[] = [
    -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30,
    -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30,
    0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
  ];

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    const move = currentPosition.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move) {
      setCurrentPosition(new Chess(currentPosition.fen()));
      computerMove();
      return true;
    } else {
      return false;
    }
  };

  const minimax = (
    position: Chess,
    depth: number,
    maximizingPlayer: boolean
  ): number => {
    console.log("Entered minimax");
    console.log("Depth: " + depth);

    // Quits the search and returns the best eval if either:
    // 1. The game is over (checkmate, or draw)
    // 2. We hit the end of the specified depth
    if (depth === 0 || position.gameOver()) {
      return evaluate(position.fen());
    }

    // If it is white to move
    if (maximizingPlayer) {
      let maxScore: number = Number.MIN_SAFE_INTEGER;
      for (const move of position.moves()) {
        // Creates a copy of the current position and makes the current move
        let childPosition: Chess = new Chess(position.fen());
        childPosition.move(move);
        // Runs minimax on the child position to find the score
        let score: number = minimax(childPosition, depth - 1, false);
        maxScore = Math.max(maxScore, score);
      }
      return maxScore;
    } else {
      let minScore: number = Number.MAX_SAFE_INTEGER;
      for (const move of position.moves()) {
        // Creates a copy of the current position and makes the current move
        let childPosition: Chess = new Chess(position.fen());
        childPosition.move(move);
        // Runs minimax on the child position to find the score
        let score: number = minimax(childPosition, depth - 1, true);
        minScore = Math.min(minScore, score);
      }
      return minScore;
    }
    console.error(
      "Something has gone horribly wrong and the top case of recursion was never hit"
    );
    return -1;
  };

  const computerMove = () => {
    const bestScore: number = minimax(currentPosition, 2, true);

    for (const move of currentPosition.moves()) {
      let childPosition: Chess = new Chess(currentPosition.fen());
      childPosition.move(move);
      if (evaluate(childPosition.fen()) === bestScore) {
        currentPosition.move(move);
        setCurrentPosition(new Chess(currentPosition.fen()));
        return;
      }
    }
  };

  // This returns a number representing the eval of the current position
  // A larger number means white it better, and a smaller number means black is better
  const evaluate = (fen: string): number => {
    const blackMaterial = getBlackMaterial(fen);
    const whiteMaterial = getWhiteMaterial(fen);
    const blackPieceSquareEval = pieceSquareEval(fen, false);
    const whitePieceSquareEval = pieceSquareEval(fen, true);

    return (
      whiteMaterial -
      blackMaterial +
      whitePieceSquareEval -
      blackPieceSquareEval
    );
  };

  // This function eventually needs to be changed to handle the end game positioning of the king
  const pieceSquareEval = (
    positionFen: string,
    whiteToMove: boolean
  ): number => {
    // I know this doesn't look ideal, but it is done to make sure that the
    // useState for the current position isn't fucked up accidentally.
    const positionObj = new Chess(positionFen);

    let totalBoardPieceSquareScore = 0;

    const files: string = "abcdefgh";
    const ranks: string = "12345678";
    let iterator: number = 0;

    if (whiteToMove) {
      for (const file of files) {
        for (const rank of ranks) {
          const square: string = file + rank;
          const pieceOnSquare = positionObj.get(square);
          if (pieceOnSquare && pieceOnSquare.color === "w") {
            switch (pieceOnSquare.type) {
              case "p":
                totalBoardPieceSquareScore += blackPawnSquares[iterator];
                break;
              case "n":
                totalBoardPieceSquareScore += blackKnightSquares[iterator];
                break;
              case "b":
                totalBoardPieceSquareScore += blackBishopSquares[iterator];
                break;
              case "r":
                totalBoardPieceSquareScore += blackRookSquares[iterator];
                break;
              case "q":
                totalBoardPieceSquareScore += blackQueenSquares[iterator];
                break;
              case "k":
                totalBoardPieceSquareScore +=
                  blackKingSquaresEarlyAndMiddleGame[iterator];
                break;
              default:
                break;
            }
          }
          iterator++;
        }
      }
    } else {
      for (const file of files) {
        for (const rank of ranks) {
          const square: string = file + rank;
          const pieceOnSquare = positionObj.get(square);

          if (pieceOnSquare && pieceOnSquare.color === "b") {
            switch (pieceOnSquare.type) {
              case "p":
                totalBoardPieceSquareScore += blackPawnSquares[iterator];
                break;
              case "n":
                totalBoardPieceSquareScore += blackKnightSquares[iterator];
                break;
              case "b":
                totalBoardPieceSquareScore += blackBishopSquares[iterator];
                break;
              case "r":
                totalBoardPieceSquareScore += blackRookSquares[iterator];
                break;
              case "q":
                totalBoardPieceSquareScore += blackQueenSquares[iterator];
                break;
              case "k":
                totalBoardPieceSquareScore +=
                  blackKingSquaresEarlyAndMiddleGame[iterator];
                break;
              default:
                break;
            }
          }
          iterator++;
        }
      }
    }
    return totalBoardPieceSquareScore;
  };

  const getBlackMaterial = (fen: string): number => {
    let blackPieces: string = "";

    for (let i = 0; i < fen.length; i++) {
      const char = fen.charAt(i);

      if (char === " ") {
        // This stops the counting when the end of the peices are reached
        break;
      }

      if (/[a-z]/.test(char)) {
        blackPieces += char;
      }
    }

    let blackMaterial: number = 0;

    for (let i = 0; i < blackPieces.length; i++) {
      switch (blackPieces.charAt(i)) {
        case "p":
          blackMaterial += 100;
          break;
        case "n":
          blackMaterial += 320;
          break;
        case "b":
          blackMaterial += 330;
          break;
        case "r":
          blackMaterial += 500;
          break;
        case "q":
          blackMaterial += 900;
          break;
        case "k":
          blackMaterial += 20000;
          break;
        default:
          break;
      }
    }
    return blackMaterial;
  };

  const getWhiteMaterial = (fen: string): number => {
    let whitePieces: string = "";

    for (let i = 0; i < fen.length; i++) {
      const char = fen.charAt(i);

      if (char === " ") {
        // This stops the counting when the end of the peices are reached
        break;
      }

      if (/[A-Z]/.test(char)) {
        whitePieces += char;
      }
    }

    let whiteMaterial: number = 0;

    for (let i = 0; i < whitePieces.length; i++) {
      switch (whitePieces.charAt(i)) {
        case "P":
          whiteMaterial += 100;
          break;
        case "N":
          whiteMaterial += 320;
          break;
        case "B":
          whiteMaterial += 330;
          break;
        case "R":
          whiteMaterial += 500;
          break;
        case "Q":
          whiteMaterial += 900;
          break;
        case "K":
          whiteMaterial += 20000;
          break;
        default:
          break;
      }
    }
    return whiteMaterial;
  };

  return (
    <div className="board">
      <Chessboard
        id="BasicBoard"
        position={currentPosition.fen()}
        onPieceDrop={onDrop}
      />
    </div>
  );
}
