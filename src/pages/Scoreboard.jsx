import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const GAMES = [
  { id: 'invisible-wall', name: 'Invisible Wall', key: 'invisible-wall-best', type: 'steps' },
  { id: 'memory-matrix', name: 'Memory Matrix', key: 'mm-best-score', type: 'score' },
  { id: 'quick-math', name: 'Quick Fire Math', key: 'qfm-best-score', type: 'score' },
  { id: 'bubble-math', name: 'Bubble Math', key: null, type: 'none' },
];

function readLS(key) {
  if (!key) return null;
  const v = localStorage.getItem(key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
}

export default function Scoreboard() {
  // scoreboard-best-times stores an object { [gameId]: bestSeconds }
  const [bestTimes, setBestTimes] = useState(() => {
    try {
      const raw = localStorage.getItem('scoreboard-best-times');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [inputs, setInputs] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem('scoreboard-best-times', JSON.stringify(bestTimes));
    } catch {
      // ignore quota errors
    }
  }, [bestTimes]);

  function saveTime(gameId) {
    const raw = inputs[gameId];
    if (!raw) return;
    const seconds = Number(raw);
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setBestTimes((prev) => {
      const prevBest = prev[gameId];
      if (prevBest == null || seconds < prevBest) {
        return { ...prev, [gameId]: seconds };
      }
      return prev;
    });
    setInputs((s) => ({ ...s, [gameId]: '' }));
  }

  function clearTime(gameId) {
    setBestTimes((prev) => {
      const copy = { ...prev };
      delete copy[gameId];
      return copy;
    });
  }

  return (
    <div>
      <Navbar />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Scoreboard</h2>

        <p className="mb-4 text-sm text-gray-600">This page shows persisted bests from games (when available) and lets you record a best time in seconds for any game.</p>

        <div className="grid gap-4">
          {GAMES.map((g) => {
            const gameBestKeyVal = readLS(g.key);
            const recordedTime = bestTimes[g.id];
            return (
              <div key={g.id} className="p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold">{g.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {g.key ? (
                      <>
                        Game best: <span className="font-medium">{gameBestKeyVal ?? '—'}</span>
                        {g.type === 'steps' ? ' steps' : ''}
                      </>
                    ) : (
                      <span className="italic text-gray-400">No in-game best available</span>
                    )}
                  </div>
                  <div className="text-sm mt-2">Scoreboard time: <span className="font-medium">{recordedTime != null ? `${recordedTime}s` : '—'}</span></div>
                </div>

                <div className="mt-3 md:mt-0 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="seconds"
                    value={inputs[g.id] ?? ''}
                    onChange={(e) => setInputs((s) => ({ ...s, [g.id]: e.target.value }))}
                    className="px-3 py-2 border rounded w-28"
                  />
                  <button onClick={() => saveTime(g.id)} className="px-3 py-2 bg-blue-600 text-white rounded">Save Best</button>
                  <button onClick={() => clearTime(g.id)} className="px-3 py-2 border rounded text-sm">Clear</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
