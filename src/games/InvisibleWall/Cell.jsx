import React from "react";
import { motion } from "framer-motion";

// ensure linter sees motion as used in environments where JSX runtime may not
// correctly register the `motion` identifier: a no-op reference below.
void motion;

/**
 * Renders one cell. Walls are drawn only if they exist AND have been revealed.
 * Props:
 *  - cell: { r, c, walls: {N,S,E,W} }
 *  - revealedWalls: Set<string>  (keys like "r,c-N" for north wall revealed)
 *  - playerHere: boolean
 *  - goalHere: boolean
 */
export default function Cell({ cell, revealedWalls, playerHere, goalHere, bumpHere = false, hintHere = false }) {
  const { r, c, walls } = cell;

  const wallVisible = (dir) => {
    const key = `${r},${c}-${dir}`;
    return walls[dir] && revealedWalls.has(key);
  };

  // Border classes for revealed walls
  const borderTop = wallVisible("N") ? "border-t-4" : "border-t";
  const borderBottom = wallVisible("S") ? "border-b-4" : "border-b";
  const borderLeft = wallVisible("W") ? "border-l-4" : "border-l";
  const borderRight = wallVisible("E") ? "border-r-4" : "border-r";

  const anyRevealed = ["N", "S", "E", "W"].some((d) => wallVisible(d));

  // When walls are not revealed at all, we draw faint borders (thin) except
  // where a revealed wall exists (thicker).
  return (
    <motion.div
      className={`relative w-full h-full bg-transparent border-gray-400 ${borderTop} ${borderBottom} ${borderLeft} ${borderRight} flex items-center justify-center`}
      style={{ boxSizing: "border-box" }}
      animate={
        bumpHere
          ? { x: [0, -6, 6, -4, 4, 0] }
          : hintHere
          ? { scale: [1, 1.03, 1], opacity: [1, 0.9, 1] }
          : anyRevealed
          ? { scale: [1, 1.02, 1] }
          : { x: 0 }
      }
      transition={{ duration: 0.28 }}
    >
      {/* Hint overlay pulsing can be done in parent by setting hintHere, we already animate here */}
      {playerHere && (
        <div className="w-7 h-7 rounded-full bg-green-400 flex items-center justify-center text-xs font-bold text-black">
          You
        </div>
      )}
      {goalHere && (
        <div className="w-7 h-7 rounded-md bg-yellow-300 flex items-center justify-center text-xs font-bold text-black">
          Goal
        </div>
      )}
    </motion.div>
  );
}
