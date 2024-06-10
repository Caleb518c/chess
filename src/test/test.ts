import { Square } from "chess.js";
import { isTypeOnlyImportOrExportDeclaration } from "typescript";
import { evaluate, pieceIsHanging } from "../index"; 

const App = require('./App.tsx');

test('pieceIsHanging Test', () => {
    const e4: Square = "e4" as Square; 
    expect(pieceIsHanging(e4, "rnbqkbnr/p1pppppp/8/1p6/4P3/8/PPPP1PPP/RNBQKBNR w KQkq b6 0 2")).toBe(false);
  });

export {};