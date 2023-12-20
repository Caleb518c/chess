import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { BISHOP, Chess, KING, QUEEN, ROOK } from "chess.ts";
import "./App.css";

export default function App() {
  const [currentPosition, setCurrentPosition] = useState(new Chess());

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
          blackMaterial += 1;
          break;
        case "b":
          blackMaterial += 3;
          break;
        case "n":
          blackMaterial += 3;
          break;
        case "r":
          blackMaterial += 5;
          break;
        case "q":
          blackMaterial += 9;
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
          whiteMaterial += 1;
          break;
        case "B":
          whiteMaterial += 3;
          break;
        case "N":
          whiteMaterial += 3;
          break;
        case "R":
          whiteMaterial += 5;
          break;
        case "Q":
          whiteMaterial += 9;
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
