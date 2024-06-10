import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// -----------Exports-------------

export { evaluate, pieceIsHanging } from "./components/EvaluatePosition";
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
} from "./components/PieceSquareTables";

// View Component Exports
export { Home } from "./views/Home";
export { Game } from "./views/Game";

// Image Exports
export { default as testLogo } from "./images/testLogo.png";
