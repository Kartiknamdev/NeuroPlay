import React, { useState, useEffect, useCallback } from "react";
import Tile from "./Tile";
import { generatePattern } from "./utils";
import { motion } from "framer-motion";
void motion;

// localStorage read/write helpers
const getLS = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const setLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

export default function MemoryMatrix() {
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showPattern, setShowPattern] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [wrongIndex, setWrongIndex] = useState(null);
  const [bestScore, setBestScore] = useState(() => getLS("mm-best-score", 0));
  const [bestLevel, setBestLevel] = useState(() => getLS("mm-best-level", 0));

  const startLevel = useCallback(() => {
    const count = Math.min(level + 2, gridSize);
    const newPattern = generatePattern(gridSize, count);
    setPattern(newPattern);
    setSelected([]);
    setShowPattern(true);
    setGameOver(false);

    const timeout = setTimeout(() => setShowPattern(false), 1500 + level * 300);
    return () => clearTimeout(timeout);
  }, [level, gridSize]);

  useEffect(() => {
    const cleanup = startLevel();
    return cleanup;
  }, [level, startLevel]);

  const handleTileClick = (index) => {
    if (showPattern || gameOver) return;

    // ignore repeated clicks on same tile
    if (selected.includes(index)) return;

    // immediate fail if clicked tile is not part of the pattern
    if (!pattern.includes(index)) {
      setSelected((s) => [...s, index]);
      setWrongIndex(index);
      // small delay so the tile can animate wrong state
      setTimeout(() => {
        setGameOver(true);
        // update bests if needed
        const newBestScore = Math.max(bestScore, score);
        const newBestLevel = Math.max(bestLevel, level);
        setBestScore(newBestScore);
        setBestLevel(newBestLevel);
        setLS("mm-best-score", newBestScore);
        setLS("mm-best-level", newBestLevel);
      }, 380);
      return;
    }

    const newSelected = [...selected, index];
    setSelected(newSelected);

    // If player clicked enough tiles, check correctness
    if (newSelected.length === pattern.length) {
      const correct = pattern.every((i) => newSelected.includes(i));
      if (correct) {
        setScore((s) => s + 10 * level);
        if (gridSize < 7 && level % 3 === 0) setGridSize((g) => g + 1);
        // update bests on level up
        const afterScore = score + 10 * level;
        const newBestScore = Math.max(bestScore, afterScore);
        const newBestLevel = Math.max(bestLevel, level + 1);
        setBestScore(newBestScore);
        setBestLevel(newBestLevel);
        setLS("mm-best-score", newBestScore);
        setLS("mm-best-level", newBestLevel);
        setLevel((l) => l + 1);
      } else {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white p-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Memory Matrix</h1>
          <div className="space-x-4">
            <span className="font-semibold">Score: {score}</span>
            <span className="font-semibold">Level: {level}</span>
          </div>
        </div>

        <div className="mx-auto bg-black/30 rounded-lg p-6">
          <div className="text-sm text-gray-300 mb-3">Memorize the highlighted tiles, then click them back in the same positions.</div>

          <div
            className="grid gap-3 mx-auto p-2 bg-black/10 rounded"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: Math.min(560, gridSize * 96),
              maxWidth: '100%'
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
              <Tile
                key={i}
                index={i}
                isActive={pattern.includes(i)}
                isSelected={selected.includes(i)}
                reveal={showPattern}
                wrong={wrongIndex === i}
                onClick={handleTileClick}
              />
            ))}
          </div>
        </div>

        {/* Game Over modal */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-lg p-6 w-11/12 max-w-md text-gray-900"
            >
              <h2 className="text-2xl font-bold mb-2">Game Over</h2>
              <p className="mb-1">Your Score: <span className="font-semibold">{score}</span></p>
              <p className="mb-3">Level Reached: <span className="font-semibold">{level}</span></p>
              <div className="mb-4 text-sm text-gray-600">
                Best Score: <span className="font-semibold">{bestScore}</span> • Best Level: <span className="font-semibold">{bestLevel}</span>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    // restart fresh
                    setLevel(1);
                    setGridSize(3);
                    setScore(0);
                    setGameOver(false);
                    setWrongIndex(null);
                    setSelected([]);
                    // restart next tick
                    setTimeout(() => setLevel((l) => l + 0), 10);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Restart
                </button>
                <button
                  onClick={() => {
                    // close modal and let user inspect grid (no-op)
                    setGameOver(false);
                    setWrongIndex(null);
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
