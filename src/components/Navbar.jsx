import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow">
      <h1 className="text-2xl font-bold">🎮 NeuroPlay</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <Link to="/scoreboard" className="hover:text-blue-400">Scoreboard</Link>
      </div>
    </nav>
  );
}
