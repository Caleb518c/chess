import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Piece, Move, PartialMove } from "chess.ts";

import { evaluate } from "../index";

const Game = () => {
  const [currentPosition, setCurrentPosition] = useState(new Chess());
  const [moveList, setMoveList] = useState<Move[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [startingSquare, setStartingSquare] = useState<string>("");
  const [targetSquare, setTargetSquare] = useState<string>("");

  const onSquareRightClick = (square: string) => {
    setSelectedSquare(square);
  };

  const onSquareClick = (square: string) => {
    setSelectedSquare("");
  };

  const colorLastMove = (move: Move) => {
    setSelectedSquare(""); //This just removes any squares the user colored
    setStartingSquare(move.from);
    setTargetSquare(move.to);
    appendMoveList(move);
  };

  const appendMoveList = (move: Move) => {
    moveList.push(move);
  };

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    console.error("All legal moves: " + currentPosition.moves());

    const move = currentPosition.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (move) {
      // window.alert(move.to);
      // // @ts-ignore
      // if (currentPosition.isPromotion(move.to)) {
      //   // @ts-ignore
      //   currentPosition.put({ type: "q", color: "w" }, move.to);
      // }

      const childPosition = new Chess(currentPosition.fen());
      colorLastMove(move);

      if (isACapture(move.san)) {
        if (pieceIsHanging(childPosition.fen(), move.san)) {
        }
      }

      // This is for the failsafe below
      const currentPositionCopy: Chess = new Chess(currentPosition.fen());

      setCurrentPosition(new Chess(currentPosition.fen()));
      computerMove();

      // This acts as a failsafe in the case where the computer doesn't play a move for some reason,
      // which it likes to do and I have no idea why...
      if (currentPosition.fen() === currentPositionCopy.fen()) {
        console.error("No move selected. First legal move played instead.");
        currentPosition.move(currentPosition.moves()[0]);
        setCurrentPosition(new Chess(currentPosition.fen()));
      }
      return true;
    } else {
      return false;
    }
  };

  const computerMove = () => {
    const bestScore: number = alphaBetaMax(
      currentPosition,
      2,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    );

    console.log("All legal moves: " + currentPosition.moves());

    for (const move of currentPosition.moves()) {
      let childPosition: Chess = new Chess(currentPosition.fen());
      childPosition.move(move);

      console.warn("Move: " + move);
      console.log("Is a capture: " + isACapture(move));
      console.log(
        "Is hanging: " +
          pieceIsHanging(
            childPosition.fen(),
            move.replace(/[pnbrqkPNBRQKx+#]/g, "")
          )
      );

      // This forces to engine to take a piece if it is hanging
      if (isACapture(move) && pieceIsHanging(childPosition.fen(), move)) {
        // This ignore doesn't matter because you can't even enter the if statement if move is null
        // @ts-ignore
        const moveObj: Move = currentPosition.move(move);
        colorLastMove(moveObj);
        setCurrentPosition(new Chess(currentPosition.fen()));
        return;
      }

      if (evaluate(childPosition.fen()) === bestScore) {
        // Same as above
        // @ts-ignore
        const moveObj: Move = currentPosition.move(move);
        colorLastMove(moveObj);
        setCurrentPosition(new Chess(currentPosition.fen()));
        return;
      }
    }
  };

  const alphaBetaMax = (
    position: Chess,
    depth: number,
    alpha: number,
    beta: number
  ): number => {
    if (depth === 0 || position.gameOver()) {
      return evaluate(position.fen());
    }

    for (const move of position.moves()) {
      let childPosition: Chess = new Chess(position.fen());
      childPosition.move(move);
      let score: number = alphaBetaMin(childPosition, depth - 1, alpha, beta);
      if (score >= beta) {
        return beta; // fail hard beta-cutoff
      }
      if (score > alpha) {
        alpha = score; // alpha acts like max in MiniMax
      }
    }
    return alpha;
  };

  const alphaBetaMin = (
    position: Chess,
    depth: number,
    alpha: number,
    beta: number
  ): number => {
    if (depth === 0 || position.gameOver()) {
      return evaluate(position.fen());
    }

    for (const move of position.moves()) {
      let childPosition: Chess = new Chess(position.fen());
      childPosition.move(move);
      let score: number = alphaBetaMax(childPosition, depth - 1, alpha, beta); // Corrected order of arguments
      if (score <= alpha) {
        return alpha; // fail hard alpha-cutoff
      }
      if (score < beta) {
        beta = score; // beta acts like min in MiniMax
      }
    }
    return beta;
  };

  // --- Utility methods for moves ---

  const isACapture = (move: string): boolean => {
    if (/x/.test(move)) {
      return true;
    } else {
      return false;
    }
  };

  // *NOTE* - This function only works if there is a valid capture to take the piece in question
  const pieceIsHanging = (positionFen: string, square: string): boolean => {
    let position: Chess = new Chess(positionFen);

    // const square: string = captureMove.replace(/[pnbrqkPNBRQK]/g, "");

    for (const followUpMove of position.moves()) {
      const tempPosition = new Chess(position.fen());
      const followUpMoveObj = tempPosition.move(followUpMove);

      if (followUpMoveObj)
        if (
          followUpMoveObj.captured !== undefined ||
          (followUpMoveObj.captured !== null &&
            followUpMoveObj.san.includes(square))
        ) {
          return false;
        }
    }
    return true;
  };

  return (
    <div className="mainContainer">
      <nav>
        <img src="public\smallLogo.png" alt="" />
      </nav>
      <div className="board">
        <Chessboard
          id="BasicBoard"
          customDarkSquareStyle={{ backgroundColor: "#92afb5" }}
          customLightSquareStyle={{ backgroundColor: "white" }}
          position={currentPosition.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customSquareStyles={Object.assign(
            {},
            selectedSquare
              ? {
                  [selectedSquare]: {
                    backgroundColor: "rgba(255, 255, 0, 0.4)",
                  },
                }
              : {},
            startingSquare
              ? {
                  [startingSquare]: {
                    backgroundColor: "rgba(70, 195, 206, 0.6)",
                  },
                }
              : {},
            targetSquare
              ? {
                  [targetSquare]: {
                    backgroundColor: "rgba(70, 195, 206, 0.6)",
                  },
                }
              : {}
          )}
        />
      </div>
      {/* <aside className="movesContainer">
        <div className="moveList">
          {moveList.map((move, index) => (
            <div key={index} className="move">
              <p>{index + 1}:</p>
              <p>
                {move.piece === "p"
                  ? move.from
                  : move.piece.toUpperCase() + move.from}
              </p>
              <p>
                {move.piece === "p"
                  ? move.to
                  : move.piece.toUpperCase() + move.to}
              </p>
            </div>
          ))}
        </div>
      </aside> */}
    </div>
  );
};

export { Game };
