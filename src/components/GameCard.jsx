import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function GameCard({ title, description, link }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center border border-white/20 hover:border-blue-400 transition-all"
    >
      <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-gray-300 mb-4 text-sm">{description}</p>
      <Link to={link} className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600">
        Play
      </Link>
    </motion.div>
  );
}
