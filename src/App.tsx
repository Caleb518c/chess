import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.ts";
import "./App.css";

export default function App() {
  const [currentPosition, setCurrentPosition] = useState(new Chess());

  // --- Piece-Square Tables ---
  // These tables map out a chess board from white's perspective reading each square
  // left to right, then top to bottom, just like FEN notation would.
  // The tables themselves and their descriptions are pulled directly from the
  // chessprogramming wiki page: https://www.chessprogramming.org/Simplified_Evaluation_Function#Piece-Square_Tables
  // *Note*: my auto formatting fucks up how the arrays look visually, but their contents
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

  // With knights we simply encourage them to go to the center. Standing on the edge
  // is a bad idea. Standing in the corner is a terrible idea. Probably it was Tartakover
  // who said that "one piece stands badly, the whole game stands badly". And knights move slowly.
  const blackKnightSquares: number[] = [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
    5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20,
    20, 15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20,
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

  // The only ideas which came to my mind was to centralize, occupy the 7th rank,
  // and avoid a, h columns (in order not to defend pawn b3 from a3). So generally
  // this is Gerbil like. (https://www.chessprogramming.org/Gerbil)
  const blackRookSquares: number[] = [
    0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
    -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
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

  const blackKingSquaresEndGame: number[] = [
    -50, -30, -30, -30, -30, -30, -30, -50, -30, -30, 0, 0, 0, 0, -30, -30, -30,
    -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10,
    30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -20, -10,
    0, 0, -10, -20, -30, -50, -40, -30, -20, -20, -30, -40, -50,
  ];

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    const move = currentPosition.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move) {
      setCurrentPosition(new Chess(currentPosition.fen()));
      computerMove(generateMove());
      return true;
    } else {
      return false;
    }
  };

  const generateMove = (): string => {
    let bestMove = "";
    let currentEval = evaluate(currentPosition.fen());

    const legalMoves: string[] = currentPosition.moves();

    for (let i = 0; i < legalMoves.length; i++) {
      // This has to be done so that the currentPosition object is not modified
      // THIS IS VERY IMORTANT
      // REMEMBER TO DO THIS EVERYTIME!!!
      let futurePosition = new Chess(currentPosition.fen());

      // Stops the function from returning a move if it is white to move,
      // preventing the engine from moving for the player
      if (/w/.test(futurePosition.fen())) {
        return "";
      }

      futurePosition.move(legalMoves[i]);

      if (evaluate(futurePosition.fen()) < currentEval) {
        currentEval = evaluate(futurePosition.fen());
        bestMove = legalMoves[i];
      }
    }

    // Makes the engine choose a random move in the case that all moves are equal
    if (bestMove === "") {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[randomIndex];
    } else {
      return bestMove;
    }
  };

  const computerMove = (inputMove: string) => {
    currentPosition.move(inputMove);
    setCurrentPosition(new Chess(currentPosition.fen()));
  };

  const evaluate = (fen: string) => {
    const blackMaterial = getBlackMaterial(fen);
    const whiteMaterial = getWhiteMaterial(fen);

    return whiteMaterial - blackMaterial;
  };

  const pieceSquareEval = (positionFen: string, pieceToMove: string) => {};

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