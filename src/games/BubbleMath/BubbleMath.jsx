import { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import Bubble from "./Bubble";
import { generateEquations } from "./utils";

export default function BubbleMath() {
  const [equations, setEquations] = useState([]);
  const [sortedAnswers, setSortedAnswers] = useState([]);
  const [clickedIds, setClickedIds] = useState([]);
  const [statuses, setStatuses] = useState({}); // id -> 'idle'|'correct'|'wrong'
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [bubbleCount, setBubbleCount] = useState(3);
  const [mode, setMode] = useState('easy');
  const [isProgressive, setIsProgressive] = useState(false);
  const [roundsAtCurrentCount, setRoundsAtCurrentCount] = useState(0);
  const [roundsToHold, setRoundsToHold] = useState(3); // user-configurable 3..10
  const [pendingMode, setPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);
  const [gameOver, setGameOver] = useState(false);
  const [notification, setNotification] = useState('');
  const notifyTimeoutRef = useRef(null);

  // generate equations when level changes
  useEffect(() => {
    // generate equations when level or bubbleCount changes
    const eqs = generateEquations(bubbleCount, level);
    setEquations(eqs);
    setSortedAnswers([...eqs].sort((a, b) => a.answer - b.answer));
    setClickedIds([]);
    setStatuses({});
    setTimeLeft(40);
    setGameOver(false);
  }, [level, bubbleCount]);

  // show a brief on-screen notification when mode changes (user selected practice level)
  useEffect(() => {
    const mapping = { easy: 3, medium: 4, challenging: 6 };
    const count = mapping[mode] || 3;
    // apply mode defaults (bubble count). Keep progressive/fixed handling elsewhere.
    setBubbleCount(count);
    setLevel(1);
    setScore(0);
    setClickedIds([]);
    setStatuses({});
    setRoundsAtCurrentCount(0);

    // if challenging mode selected, enforce fixed mode
    if (mode === 'challenging') setIsProgressive(false);

    const msg = `${mode[0].toUpperCase() + mode.slice(1)} — ${count} bubbles`;
    setNotification(msg);
    if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    notifyTimeoutRef.current = setTimeout(() => setNotification(''), 1500);
    return () => {
      if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
    };
  }, [mode]);

  // timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, gameOver]);

  // request to change mode (with confirmation if progress exists)
  const requestModeChange = (nextMode) => {
    if (nextMode === mode) return;
    // if player has progress, ask for confirmation
    if (score > 0 || level > 1) {
      setPendingMode(nextMode);
      setShowConfirmModal(true);
      return;
    }
    setMode(nextMode);
  };

  // when level increments (a round completed), handle progressive progression
  useEffect(() => {
    if (!isProgressive) return;
    // only act when a round just completed (level > 1)
    if (level <= 1) return;
    const mappingMax = { easy: 6, medium: 6, challenging: 6 };
    setRoundsAtCurrentCount((prev) => {
      const nextRounds = prev + 1;
      if (nextRounds >= roundsToHold && bubbleCount < mappingMax[mode]) {
        setBubbleCount((b) => Math.min(mappingMax[mode], b + 1));
        // show notification for new bubble count
        const newCount = Math.min(mappingMax[mode], bubbleCount + 1);
        setNotification(`Now ${newCount} bubbles!`);
        if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
        notifyTimeoutRef.current = setTimeout(() => setNotification(''), 1500);
        return 0;
      }
      return nextRounds;
    });
  }, [level, isProgressive, bubbleCount, mode, roundsToHold]);


  const applyPendingMode = () => {
    if (pendingMode) {
      setMode(pendingMode);
      setPendingMode(null);
    }
    setShowConfirmModal(false);
  };

  const cancelPendingMode = () => {
    setPendingMode(null);
    setShowConfirmModal(false);
  };

  const handleClick = (eq) => {
    if (gameOver) return;
    if (statuses[eq.id]) return; // ignore already-processed bubble
    const currentIndex = clickedIds.length;
    const expected = sortedAnswers[currentIndex];

    if (!expected) return;

    if (eq.id === expected.id) {
      // correct: show green, then mark clicked and continue
      setStatuses((st) => ({ ...st, [eq.id]: 'correct' }));
      setTimeout(() => {
        setClickedIds((c) => {
          const next = [...c, eq.id];
          setScore((s) => s + 10);
          // round complete?
          if (next.length === equations.length) {
            // increment round/level
            setLevel((l) => l + 1);
          }
          return next;
        });
      }, 350);
    } else {
      // wrong: show red, then set game over after a short delay
      setStatuses((st) => ({ ...st, [eq.id]: 'wrong' }));
      setTimeout(() => setGameOver(true), 450);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(40);
    setGameOver(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Bubble Math</h1>
          <div className="flex items-center gap-4">
            {/* mode selector */}
            <div className="flex gap-2 mr-4">
              <button onClick={() => requestModeChange('easy')} className={`px-3 py-1 rounded ${mode==='easy' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Easy</button>
              <button onClick={() => requestModeChange('medium')} className={`px-3 py-1 rounded ${mode==='medium' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Medium</button>
              <button onClick={() => requestModeChange('challenging')} className={`px-3 py-1 rounded ${mode==='challenging' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Challenging</button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 mr-2">Mode</label>
              <button onClick={() => setIsProgressive((p) => !p)} className={`px-2 py-1 rounded ${isProgressive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {isProgressive ? 'Progressive' : 'Fixed'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 mr-2">Rounds:</label>
              <select
                value={roundsToHold}
                onChange={(e) => { setRoundsToHold(Number(e.target.value)); setRoundsAtCurrentCount(0); }}
                className="px-2 py-1 rounded bg-white border"
                disabled={mode === 'challenging'}
                title={mode === 'challenging' ? 'Rounds not applicable in Challenging (fixed) mode' : isProgressive ? 'Rounds per stage when progressive' : 'Rounds per stage (change and toggle Progressive to enable progression)'}
              >
                {Array.from({ length: 8 }).map((_, i) => {
                  const val = i + 3;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
            <div className="text-sm text-gray-700">Level <strong>{level}</strong></div>
            <div className="text-sm text-gray-700">Score: <strong>{score}</strong></div>
            <div className="text-sm text-gray-700">Time: <strong>{timeLeft}s</strong></div>
            <div className="text-sm text-gray-500">Mode: <strong>{mode}</strong> • Bubbles: <strong>{bubbleCount}</strong>{isProgressive ? <span> • Held: <strong>{roundsAtCurrentCount}</strong>/<strong>{roundsToHold}</strong></span> : null}</div>
          </div>
        </header>

        {/* on-screen notification for bubble count changes */}
        {notification && (
          <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded shadow-lg z-50">
            {notification}
          </motion.div>
        )}

        {/* confirmation modal when switching modes with progress */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Change mode?</h3>
              <p className="text-sm text-gray-600 mb-4">Switching modes will reset your current progress. Do you want to continue?</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelPendingMode} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                <button onClick={applyPendingMode} className="px-3 py-1 rounded bg-blue-600 text-white">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {!gameOver ? (
          <section className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <div className="text-sm text-gray-500">Solve each equation in your head and tap them in increasing order of their answers.</div>
            </div>

            <div className={`grid ${bubbleCount === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-6 justify-items-center items-center py-6`}>
              {equations.map((eq) => (
                <Bubble
                  key={eq.id}
                  eq={eq}
                  onClick={handleClick}
                  disabled={clickedIds.includes(eq.id) || !!statuses[eq.id]}
                  status={statuses[eq.id] || 'idle'}
                />
              ))}
            </div>
            {/* rounds progress indicator */}
            {isProgressive && (
              <div className="flex justify-center mt-2 gap-2">
                {Array.from({ length: roundsToHold }).map((_, i) => (
                  <span key={i} className={`w-3 h-3 rounded-full ${i < roundsAtCurrentCount ? 'bg-green-500' : 'bg-gray-300'}`} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-white p-6 rounded-lg shadow">
            <h2 className="text-3xl font-bold mb-2">Game Over</h2>
            <p className="mb-4">Your Score: <strong>{score}</strong></p>
            <button onClick={handleRestart} className="px-4 py-2 bg-blue-600 text-white rounded">Restart</button>
          </div>
        )}

        <footer className="text-xs text-gray-500 mt-4">Tap bubbles in ascending order (smallest answer → largest answer).</footer>
      </div>
    </div>
  );
}
