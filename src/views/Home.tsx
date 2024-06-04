import { Link } from "react-router-dom";
import { testLogo } from "../index";

const Home = () => (
  <section className="homeContainer">
    <img src={testLogo} alt="" />
    <h1>Enough Monkeys</h1>
    <p>
      A chess engine written in React & Typescript that runs entirely in your
      browser.
    </p>
    <button>
      <Link to="/Game" className="playNowButton">
        Play Now
      </Link>
    </button>
  </section>
);

export { Home };
