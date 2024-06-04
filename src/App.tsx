import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Home, Game } from "./index";
import "./styles/App.css";

export default function App() {
  return (
    <Router>
      <main>
        <nav className="navBar">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="Game">Play</Link>
            </li>
            <li>About</li>
          </ul>
        </nav>
        <Routes>
          <Route index path="/" Component={Home}></Route>
          <Route path="/Game" Component={Game}></Route>
        </Routes>
      </main>
    </Router>
  );
}
