import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BubbleMath from "./games/BubbleMath/BubbleMath";
import InvisibleWall from "./games/InvisibleWall/InvisibleWall";
import MemoryMatrix from "./games/MemoryMatrix/MemoryMatrix";
import QuickFireMath from "./games/QuickFireMath/QuickFireMath";
import Scoreboard from "./pages/Scoreboard";
import About from "./pages/About";
import Privacy from "./pages/Privacy";

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white text-2xl">
      <p>{title} Coming Soon...</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/bubble-math" element={<BubbleMath />} />
  <Route path="/invisible-wall" element={<InvisibleWall />} />
  <Route path="/memory-matrix" element={<MemoryMatrix />} />
  <Route path="/quick-math" element={<QuickFireMath />} />
  <Route path="/scoreboard" element={<Scoreboard />} />
  <Route path="/about" element={<About />} />
  <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}
