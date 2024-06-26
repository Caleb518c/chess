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
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10,
  -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30,
  30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0,
];

const whitePawnSquares: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10,
  0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];

// With knights we simply encourage them to go to the center. Standing on the edge
// is a bad idea. Standing in the corner is a terrible idea. Probably it was Tartakover
// who said that "one piece stands badly, the whole game stands badly". And knights move slowly.
const blackKnightSquares: number[] = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
  5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20,
  15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const whiteKnightSquares: number[] = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
  0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20,
  15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
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
  10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5,
  5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

const whiteBishopSquares: number[] = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0,
  -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
];

// The only ideas which came to my mind was to centralize, occupy the 7th rank,
// and avoid a, h columns (in order not to defend pawn b3 from a3). So generally
// this is Gerbil like. (https://www.chessprogramming.org/Gerbil)
const blackRookSquares: number[] = [
  0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
  5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const whiteRookSquares: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
];

// Generally with queen I marked places where I wouldn't like to have a queen.
// Additionally I slightly marked central squares to keep the queen in the centre
// and b3, c2 squares (Paweł's suggestion). The rest should be done by tactics.
const blackQueenSquares: number[] = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 5, 0, 0, 0, 0, -10, -10, 5, 5,
  5, 5, 5, 0, -10, 0, 0, 5, 5, 5, 5, 0, -5, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0, 5,
  5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
];

const whiteQueenSquares: number[] = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5,
  5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
];

// --- Note about the king ---
// Different tables are used for the opening and middle game, and the end game.
// The first priortises king saftey by castling, and the second priortises king activity.

// Additionally we should define where the ending begins. For me it might be either if:
// 1. Both sides have no queens or
// 2. Every side which has a queen has additionally no other pieces or one minorpiece maximum.

const blackKingSquaresEarlyAndMiddleGame: number[] = [
  20, 30, 10, 0, 0, 10, 30, 20, 20, 20, 0, 0, 0, 0, 20, 20, -10, -20, -20, -20,
  -20, -20, -20, -10, -20, -30, -30, -40, -40, -30, -30, -20, -30, -40, -40,
  -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40,
  -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
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

export {
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
};
