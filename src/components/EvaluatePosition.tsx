import { Chess, Piece, Move, Square, Color } from "chess.js";
import {
  blackPawnSquares,
  whitePawnSquares,
  blackBishopSquares,
  whiteBishopSquares,
  blackKnightSquares,
  whiteKnightSquares,
  blackRookSquares,
  whiteRookSquares,
  blackQueenSquares,
  whiteQueenSquares,
  blackKingSquaresEarlyAndMiddleGame,
  whiteKingSquaresEarlyAndMiddleGame,
  blackKingSquaresEndGame,
  whiteKingSquaresEndGame,
} from "../index";

const initializeZobrist = (): Map<string, number> => {
  const zobristTable = new Map<string, number>();
  for (let position = 0; position < 64; position++) {
    zobristTable.set(
      `${position}_P`,
      Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    );
    zobristTable.set(
      `${position}_p`,
      Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    );
  }
  return zobristTable;
};

const zobristTable = initializeZobrist();

const generatePawnHashKey = (fen: string): number => {
  let key: number = 0;
  const fenParts = fen.split(" ");
  const fenBoard = fenParts[0];
  let rank = 7;
  let file = 0;

  // Iterate over the FEN board positions
  for (let i = 0; i < fenBoard.length; i++) {
    const char = fenBoard.charAt(i);

    if (char === "/") {
      rank--;
      file = 0;
    } else if ("12345678".indexOf(char) !== -1) {
      file += parseInt(char, 10);
    } else {
      // Piece is a pawn
      if (char === "P") {
        key ^= zobristTable.get(`${rank * 8 + file}_P`)!;
      } else if (char === "p") {
        key ^= zobristTable.get(`${rank * 8 + file}_p`)!;
      }
      file++;
    }
  }

  return key;
};

const pawnHashTable = new Map<number, number>();

function evaluatePawnStructure(fen: string): number {
  let evaluation = 0;
  const whitePawns = new Set<number>();
  const blackPawns = new Set<number>();

  // Parse the FEN to collect positions of white and black pawns
  const fenParts = fen.split(" ");
  const fenBoard = fenParts[0];
  let rank = 7;
  let file = 0;

  // Iterate over the FEN board positions
  for (let i = 0; i < fenBoard.length; i++) {
    const char = fenBoard.charAt(i);

    if (char === "/") {
      rank--;
      file = 0;
    } else if ("12345678".indexOf(char) !== -1) {
      file += parseInt(char, 10);
    } else {
      // Piece is a pawn
      const position = rank * 8 + file;
      if (char === "P") {
        whitePawns.add(position);
      } else if (char === "p") {
        blackPawns.add(position);
      }
      file++;
    }
  }

  // Evaluate white pawns
  whitePawns.forEach((position) => {
    const file = position % 8;
    const rank = Math.floor(position / 8);

    // Check for doubled pawns
    let isDoubled = false;
    whitePawns.forEach((p) => {
      if (p !== position && p % 8 === file) {
        isDoubled = true;
      }
    });
    if (isDoubled) {
      evaluation -= 20; // Penalty for doubled pawn
    }

    // Check for isolated pawns
    let isIsolated = true;
    if (file > 0) {
      whitePawns.forEach((p) => {
        if (p !== position && (p % 8 === file - 1 || p % 8 === file + 1)) {
          isIsolated = false;
        }
      });
    } else if (file < 7) {
      whitePawns.forEach((p) => {
        if (p !== position && (p % 8 === file - 1 || p % 8 === file + 1)) {
          isIsolated = false;
        }
      });
    }
    if (isIsolated) {
      evaluation -= 10; // Penalty for isolated pawn
    }

    // Check for passed pawns
    let isPassed = true;
    blackPawns.forEach((p) => {
      const f = p % 8;
      const r = Math.floor(p / 8);
      if (f === file && r > rank) {
        isPassed = false;
      }
    });
    if (isPassed) {
      evaluation += 20; // Bonus for passed pawn
    }

    // Bonus for pawn chains
    let isPawnChain = false;
    if (file > 0) {
      if (whitePawns.has((rank + 1) * 8 + file - 1)) {
        isPawnChain = true;
      }
    }
    if (file < 7) {
      if (whitePawns.has((rank + 1) * 8 + file + 1)) {
        isPawnChain = true;
      }
    }
    if (isPawnChain) {
      evaluation += 5; // Bonus for pawn chain
    }
  });

  // Evaluate black pawns (similar logic, but reverse ranks)
  blackPawns.forEach((position) => {
    const file = position % 8;
    const rank = Math.floor(position / 8);

    // Check for doubled pawns
    let isDoubled = false;
    blackPawns.forEach((p) => {
      if (p !== position && p % 8 === file) {
        isDoubled = true;
      }
    });
    if (isDoubled) {
      evaluation += 20; // Penalty for doubled pawn
    }

    // Check for isolated pawns
    let isIsolated = true;
    if (file > 0) {
      blackPawns.forEach((p) => {
        if (p !== position && (p % 8 === file - 1 || p % 8 === file + 1)) {
          isIsolated = false;
        }
      });
    } else if (file < 7) {
      blackPawns.forEach((p) => {
        if (p !== position && (p % 8 === file - 1 || p % 8 === file + 1)) {
          isIsolated = false;
        }
      });
    }
    if (isIsolated) {
      evaluation += 10; // Penalty for isolated pawn
    }

    // Check for passed pawns
    let isPassed = true;
    whitePawns.forEach((p) => {
      const f = p % 8;
      const r = Math.floor(p / 8);
      if (f === file && r < rank) {
        isPassed = false;
      }
    });
    if (isPassed) {
      evaluation -= 20; // Bonus for passed pawn
    }

    // Bonus for pawn chains
    let isPawnChain = false;
    if (file > 0) {
      if (blackPawns.has((rank - 1) * 8 + file - 1)) {
        isPawnChain = true;
      }
    }
    if (file < 7) {
      if (blackPawns.has((rank - 1) * 8 + file + 1)) {
        isPawnChain = true;
      }
    }
    if (isPawnChain) {
      evaluation -= 5; // Bonus for pawn chain
    }
  });

  return evaluation;
}

const pieceIsHanging = (square: Square, positionFen: string): boolean => {
  const position = new Chess(positionFen);

  if (position.get(square)) {
    const targetPiece = position.get(square);
    if (targetPiece.color === "w")
      if (position.isAttacked(square, "b")) {
        if (position.isAttacked(square, "w")) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    else {
      if (position.isAttacked(square, "w")) {
        if (position.isAttacked(square, "b")) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
};

// This returns a number representing the eval of the current position
// A larger number means white is better, and a smaller number means black is better
// eg. 25 mean white is better, and -25 mean black is better
const evaluate = (fen: string): number => {
  const blackMaterial = getBlackMaterial(fen);
  const whiteMaterial = getWhiteMaterial(fen);
  const blackPieceSquareEval = pieceSquareEval(fen, false);
  const whitePieceSquareEval = pieceSquareEval(fen, true);
  const pawnStructureEval = evaluatePawnStructure(fen);

  const materialWeight: number = 2;
  const pieceSquareEvalWeight: number = 1;
  const pawnStructureEvalWeight: number = 1;

  console.log("Material:" + (whiteMaterial - blackMaterial));
  console.log(
    "Piece square eval:" + (whitePieceSquareEval - blackPieceSquareEval)
  );
  console.log("Pawn struct. eval:" + pawnStructureEval);

  return (
    (whiteMaterial - blackMaterial) * materialWeight +
    (whitePieceSquareEval - blackPieceSquareEval) * pieceSquareEvalWeight
    // pawnStructureEval * pawnStructureEvalWeight
  );
};

// This function eventually needs to be changed to handle the end game positioning of the king
const pieceSquareEval = (positionFen: string, whiteToMove: boolean): number => {
  const positionObj = new Chess(positionFen);

  let totalBoardPieceSquareScore = 0;

  const files: string = "abcdefgh";
  const ranks: string = "12345678";
  let iterator: number = 0;

  if (whiteToMove) {
    for (const file of files) {
      for (const rank of ranks) {
        const square: Square = (file + rank) as Square;
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
        const square: Square = (file + rank) as Square;
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

export { evaluate, pieceIsHanging };
