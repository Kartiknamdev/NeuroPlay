// InvisibleWall.jsx
import React, { useEffect, useState, useCallback } from "react";
import { generateMaze, findShortestPath } from "./utils";
import Cell from "./Cell";

const DEFAULT_ROWS = 7;
const DEFAULT_COLS = 7;

function wallKey(r, c, dir) {
  return `${r},${c}-${dir}`;
}

// Given movement attempt from (r,c) to (nr,nc), return direction string from current cell perspective
function directionBetween(r, c, nr, nc) {
  if (nr === r - 1 && nc === c) return "N";
  if (nr === r + 1 && nc === c) return "S";
  if (nr === r && nc === c - 1) return "W";
  if (nr === r && nc === c + 1) return "E";
  return null;
}

export default function InvisibleWall() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [grid, setGrid] = useState(() => generateMaze(DEFAULT_ROWS, DEFAULT_COLS));
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [goal, setGoal] = useState({ r: DEFAULT_ROWS - 1, c: DEFAULT_COLS - 1 });
  const [steps, setSteps] = useState(0);
  const [revealedWalls, setRevealedWalls] = useState(() => new Set());
  const [gameWon, setGameWon] = useState(false);
  const [best, setBest] = useState(() => {
    const b = localStorage.getItem("invisible-wall-best");
    return b ? Number(b) : null;
  });
  const [showHint, setShowHint] = useState(false);
  const [hintPath, setHintPath] = useState([]);
  const [bumpCell, setBumpCell] = useState(null);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("invisible-wall-history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // generate a new maze and reset state
  const newMaze = useCallback((r = rows, c = cols) => {
    const g = generateMaze(r, c);
    setGrid(g);
    setPlayer({ r: 0, c: 0 });
    setGoal({ r: r - 1, c: c - 1 });
    setSteps(0);
    setRevealedWalls(new Set());
    setGameWon(false);
    setShowHint(false);
    setHintPath([]);
    setBumpCell(null);
  }, [rows, cols]);

  useEffect(() => {
    newMaze(DEFAULT_ROWS, DEFAULT_COLS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check move validity and handle bumping into invisible wall
  const tryMove = useCallback(
    (dr, dc) => {
      if (gameWon) return;
      const nr = player.r + dr;
      const nc = player.c + dc;
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) {
        // outside grid: reveal border wall of current cell in that direction
        const dir = directionBetween(player.r, player.c, nr, nc);
        if (dir) {
          const rv = new Set(revealedWalls);
          rv.add(wallKey(player.r, player.c, dir));
          setRevealedWalls(rv);
          // trigger bump animation on this cell
          setBumpCell({ r: player.r, c: player.c });
          setTimeout(() => setBumpCell(null), 300);
        }
        return;
      }

      const current = grid[player.r][player.c];
      const dir = directionBetween(player.r, player.c, nr, nc);
      if (!dir) return;

      if (current.walls[dir]) {
        // there is a wall — reveal it (and the corresponding wall on neighbor)
        const rv = new Set(revealedWalls);
        rv.add(wallKey(player.r, player.c, dir));
        // reveal opposite wall on neighbor for consistent rendering
        const opposite = dir === "N" ? "S" : dir === "S" ? "N" : dir === "W" ? "E" : "W";
        rv.add(wallKey(nr, nc, opposite));
        setRevealedWalls(rv);
        // bump animation for current cell
        setBumpCell({ r: player.r, c: player.c });
        setTimeout(() => setBumpCell(null), 300);
        // small shake animation could be added; for now, just reveal
        return;
      }

      // no wall -> move
      setPlayer({ r: nr, c: nc });
      setSteps((s) => s + 1);

      if (nr === goal.r && nc === goal.c) {
        setGameWon(true);
        const existingBest = best;
        const newBest = existingBest === null ? steps + 1 : Math.min(existingBest, steps + 1);
        setBest(newBest);
        localStorage.setItem("invisible-wall-best", String(newBest));

        // record history entry
        try {
          const entry = { date: Date.now(), steps: steps + 1, rows, cols };
          const next = [entry, ...history].slice(0, 10);
          setHistory(next);
          localStorage.setItem("invisible-wall-history", JSON.stringify(next));
        } catch {
          // ignore storage errors
        }
      }
    },
    [player, grid, revealedWalls, gameWon, steps, goal, best, rows, cols, history]
  );

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp") tryMove(-1, 0);
      else if (e.key === "ArrowDown") tryMove(1, 0);
      else if (e.key === "ArrowLeft") tryMove(0, -1);
      else if (e.key === "ArrowRight") tryMove(0, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]); // rebind if tryMove changes

  // BFS shortest path for hint
  const computeHint = useCallback(() => {
    const path = findShortestPath(grid, { r: 0, c: 0 }, goal);
    setHintPath(path);
    return path;
  }, [grid, goal]);

  useEffect(() => {
    if (showHint) {
      computeHint();
      // auto-hide hint after 3 seconds
      const t = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showHint, computeHint]);

  // UI helpers
  const cellSize = Math.max(32, Math.floor(480 / Math.max(rows, cols))); // px
  const gridStyle = {
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-sky-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Invisible Wall — Key Door (Practice)</h2>
          <div className="space-x-2">
            <button
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                // regenerate maze with same size
                newMaze(rows, cols);
              }}
            >
              New Maze
            </button>
            <button
              className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700"
              onClick={() => {
                // restart current maze (player back to start)
                setPlayer({ r: 0, c: 0 });
                setSteps(0);
                setRevealedWalls(new Set());
                setGameWon(false);
              }}
            >
              Restart
            </button>

            <button
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setShowHint(true);
              }}
            >
              Hint (shows shortest path)
            </button>
              <button
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowHistoryTab((s) => !s)}
              >
                History
              </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <div className="bg-black/40 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>Steps: <span className="font-semibold">{steps}</span></div>
                <div>Best: <span className="font-semibold">{best ?? "—"}</span></div>
              </div>
              <div className="text-sm text-gray-300 mb-2">
                Use arrow keys or on-screen arrows. Walls are invisible until you bump into them.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => tryMove(-1, 0)}
                  className="px-3 py-1 bg-white/10 rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => tryMove(0, -1)}
                  className="px-3 py-1 bg-white/10 rounded"
                >
                  ←
                </button>
                <button
                  onClick={() => tryMove(0, 1)}
                  className="px-3 py-1 bg-white/10 rounded"
                >
                  →
                </button>
                <button
                  onClick={() => tryMove(1, 0)}
                  className="px-3 py-1 bg-white/10 rounded"
                >
                  ↓
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <label className="text-sm">Rows</label>
                <input
                  type="number"
                  min="5"
                  max="12"
                  value={rows}
                  onChange={(e) => {
                    const v = Math.max(5, Math.min(12, Number(e.target.value)));
                    setRows(v);
                  }}
                  className="w-20 text-black px-2 py-1 rounded"
                />
                <label className="text-sm mt-2">Cols</label>
                <input
                  type="number"
                  min="5"
                  max="12"
                  value={cols}
                  onChange={(e) => {
                    const v = Math.max(5, Math.min(12, Number(e.target.value)));
                    setCols(v);
                  }}
                  className="w-20 text-black px-2 py-1 rounded"
                />
                <div>
                  <button
                    onClick={() => newMaze(rows, cols)}
                    className="mt-2 px-3 py-1 bg-blue-600 rounded"
                  >
                    Apply Size & New Maze
                  </button>
                </div>
              </div>
            </div>

            {showHistoryTab && (
              <div className="bg-black/30 p-3 rounded mt-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">History (last {history.length})</div>
                  <div>
                    <button
                      className="px-2 py-1 text-xs bg-red-600 rounded"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("invisible-wall-history");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {history.length === 0 && <div className="text-gray-400">No attempts yet.</div>}
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-300">{new Date(h.date).toLocaleString()}</div>
                        <div className="text-sm">Steps: <span className="font-semibold">{h.steps}</span> • {h.rows}x{h.cols}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameWon && (
              <div className="bg-green-700/30 p-3 rounded mb-4">
                <div className="font-bold">🎉 You reached the goal!</div>
                <div>Steps used: {steps}</div>
              </div>
            )}
          </div>

          <div className="bg-black/40 p-3 rounded-lg">
            <div
              className="grid gap-0"
              style={gridStyle}
            >
              {grid.flat().map((cell) => {
                const { r, c } = cell;
                const playerHere = player.r === r && player.c === c;
                const goalHere = goal.r === r && goal.c === c;

                // figure out which walls around this cell have been revealed
                const revealed = revealedWalls;

                // if hint is active and cell is on hint path, we highlight it
                const hintHere = showHint && hintPath.some((p) => p.r === r && p.c === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-[${cellSize}px] h-[${cellSize}px]`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <div className={`w-full h-full ${hintHere ? "bg-white/10" : "bg-transparent"}`}>
                            <Cell
                              cell={cell}
                              revealedWalls={revealed}
                              playerHere={playerHere}
                              goalHere={goalHere}
                              hintHere={hintHere}
                              bumpHere={bumpCell && bumpCell.r === r && bumpCell.c === c}
                            />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-300">
          <b>How it works:</b> The maze has internal walls that are <i>invisible</i>. When you attempt to move into a blocked direction
          you "bump" into the wall and that wall becomes visible. Your goal is to reach the yellow Goal tile in the fewest steps.
        </div>
      </div>
    </div>
  );
}
