import React from "react";
import { motion } from "framer-motion";

// Referencing motion in a no-op can help some linters/environments detect usage
void motion;

export default function Tile({ index, isActive, isSelected, onClick, reveal, wrong }) {
  const bg = isSelected
    ? "bg-blue-500"
    : reveal
    ? isActive
      ? "bg-yellow-400"
      : "bg-gray-700"
    : "bg-gray-700";

  // when wrong, we show a red flash and a quick shake animation
  const variants = {
    idle: { x: 0, scale: 1, rotate: 0 },
    wrong: { x: [0, -8, 8, -6, 6, 0], backgroundColor: ["#111827", "#f87171", "#111827"], transition: { duration: 0.45 } },
  };

  return (
    <motion.div
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(index);
      }}
      onClick={() => !reveal && onClick(index)}
      className={`rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center ${bg} shadow-sm w-full aspect-square`}
      animate={wrong ? "wrong" : "idle"}
      variants={variants}
    />
  );
}
