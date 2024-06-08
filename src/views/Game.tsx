import { useState, useEffect } from "react";
import Chessboard from "chessboardjsx";
import { Chess, Move, Square } from "chess.js";

import { evaluate } from "../index";

const Game = () => {
  const [currentPosition, setCurrentPosition] = useState(new Chess());
  const [moveList, setMoveList] = useState<Move[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [startingSquare, setStartingSquare] = useState<string>("");
  const [targetSquare, setTargetSquare] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);

  useEffect(() => {
    console.log("Computer is thinking!");
  }, [isThinking]);

  const onSquareRightClick = (square: string) => {
    setSelectedSquare(square);
  };

  // This removes the highlighted square when you click on a new square
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

  interface onDropParams {
    sourceSquare: string;
    targetSquare: string;
  }

  const onDrop = async ({
    sourceSquare,
    targetSquare,
  }: onDropParams): Promise<boolean> => {
    try {
      const postionTestCopy = new Chess(currentPosition.fen());
      postionTestCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch (e) {
      return false;
    }

    const move = currentPosition.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move) {
      colorLastMove(move);
      setCurrentPosition(new Chess(currentPosition.fen()));

      setTimeout(() => {
        if (currentPosition.isCheckmate()) {
          if (currentPosition.turn() === "b") {
            window.alert("You win!");
          } else {
            window.alert("You lose...");
          }
        }
      }, 100);

      setTimeout(() => {
        setIsThinking(true);
        computerMove();
        setIsThinking(false);
      }, 100);

      return true;
    } else {
      return false;
    }
  };

  const computerMove = async (): Promise<void> => {
    // console.log("All legal moves: " + currentPosition.moves());

    return new Promise((resolve) => {
      const findBestMove = (position: Chess, depth: number): string => {
        let { move } = alphaBetaMax(position, depth, -Infinity, Infinity);
        console.log("Best move: " + move);
        // @ts-ignore
        return move;
      };

      currentPosition.move(findBestMove(currentPosition, 4));
      // colorLastMove(moveObj);
      setCurrentPosition(new Chess(currentPosition.fen()));
      resolve();
    });
  };

  const alphaBetaMax = (
    position: Chess,
    depth: number,
    alpha: number,
    beta: number
  ): { score: number; move: string | null } => {
    if (depth === 0 || position.isGameOver()) {
      return { score: evaluate(position.fen()), move: null };
    }

    let maxScore = -Infinity;
    let bestMove = null;

    for (const move of position.moves()) {
      let childPosition: Chess = new Chess(position.fen());
      let moveObj = childPosition.move(move);
      let { score } = alphaBetaMin(childPosition, depth - 1, alpha, beta);
      if (score >= beta) {
        return { score: beta, move: null }; // fail hard beta-cutoff
      }
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score; // alpha acts like max in MiniMax
      }
    }
    return { score: maxScore, move: bestMove };
  };

  const alphaBetaMin = (
    position: Chess,
    depth: number,
    alpha: number,
    beta: number
  ): { score: number; move: string | null } => {
    if (depth === 0 || position.isGameOver()) {
      return { score: evaluate(position.fen()), move: null };
    }

    let minScore = Infinity;
    let bestMove = null;

    for (const move of position.moves()) {
      let childPosition: Chess = new Chess(position.fen());
      childPosition.move(move);
      let { score } = alphaBetaMax(childPosition, depth - 1, alpha, beta);
      if (score <= alpha) {
        return { score: alpha, move: null }; // fail hard alpha-cutoff
      }
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      if (score < beta) {
        beta = score; // beta acts like min in MiniMax
      }
    }
    return { score: minScore, move: bestMove };
  };

  // --- Utility methods for moves ---

  const isACapture = (move: string): boolean => {
    if (/x/.test(move)) {
      return true;
    } else {
      return false;
    }
  };

  const pieceWasHanging = (positionFen: string, square: Square): boolean => {
    let tempPosition: Chess = new Chess(positionFen);
    const attackingColor = "w";

    if (tempPosition.isAttacked(square, attackingColor) === false) {
      return true;
    } else return false;
  };

  return (
    <div className="mainContainer">
      <nav>
        <img src="public\smallLogo.png" alt="" />
      </nav>
      <div className="board">
        <Chessboard
          width={800}
          position={currentPosition.fen()}
          onDrop={onDrop}
          darkSquareStyle={{ backgroundColor: "#92afb5" }}
          lightSquareStyle={{ backgroundColor: "white" }}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          squareStyles={Object.assign(
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
