import React, { useState, useEffect, useCallback } from "react";
import QuestionBox from "./QuestionBox";
import { generateQuestion } from "./utils";
import { motion } from "framer-motion";
void motion;
const readLS = (k, fallback) => {
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

export default function QuickFireMath() {
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => generateQuestion(1));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [bestScore, setBestScore] = useState(() => readLS("qfm-best-score", 0));
  const [bestLevel, setBestLevel] = useState(() => readLS("qfm-best-level", 0));
  const audioCtxRef = React.useRef(null);
  const [streakPulse, setStreakPulse] = useState(false);
  const MAX_TIME = 30; // base for progress bar

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t0) => t0 - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  // persist bests on game over
  useEffect(() => {
    if (!gameOver) return;
    const newBestScore = Math.max(bestScore, score);
    const newBestLevel = Math.max(bestLevel, level);
    if (newBestScore !== bestScore) {
      setBestScore(newBestScore);
      setLS("qfm-best-score", newBestScore);
    }
    if (newBestLevel !== bestLevel) {
      setBestLevel(newBestLevel);
      setLS("qfm-best-level", newBestLevel);
    }
  }, [gameOver, bestScore, bestLevel, score, level]);

  // initialize audio context lazily
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        audioCtxRef.current = null;
      }
    }
    return audioCtxRef.current;
  };

  const playTone = (type = "click") => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "correct") {
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    } else if (type === "wrong") {
      o.frequency.value = 220;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    } else if (type === "levelup") {
      o.frequency.value = 1320;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.14, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    }
    o.start(now);
    o.stop(now + 0.4);
  };

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(level));
  }, [level]);

  useEffect(() => {
    // ensure we have a question when level changes
    nextQuestion();
  }, [level, nextQuestion]);

  const handleSubmit = (ans) => {
    if (gameOver) return;

    const correct = ans === question.answer;
    if (correct) {
      // compute bonus and next score synchronously
      const bonus = streak >= 3 ? 5 : 0;
      const added = 10 + bonus;
      setScore((prev) => {
        const next = prev + added;
        // level up if threshold crossed
          if (next > level * 50) {
            setLevel((l) => l + 1);
            setFeedback('correct');
            playTone('levelup');
            // pulse streak on level-up
            setStreakPulse(true);
          } else {
            setFeedback('correct');
            playTone('correct');
            setStreakPulse(true);
          }
        return next;
      });
      setStreak((s) => s + 1);
      setTimeLeft((t) => t + 3);
      // clear feedback shortly
  setTimeout(() => setFeedback(null), 350);
  setTimeout(() => setStreakPulse(false), 360);
    } else {
      setStreak(0);
      setTimeLeft((t) => Math.max(0, t - 5));
  setFeedback('wrong');
  playTone('wrong');
  setTimeout(() => setFeedback(null), 500);
    }

    nextQuestion();
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setLevel(1);
    setTimeLeft(30);
    setGameOver(false);
    setQuestion(generateQuestion(1));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-6 pt-20">
      {/* Top info bar placed below the navbar to avoid overlap */}
      <div className="w-full max-w-3xl mx-auto mb-6 flex items-center justify-between px-4">
        <div className="text-lg font-semibold">🏆 Score: {score}</div>
        <div className="text-lg font-semibold">🔥 Streak: {streak}</div>
        <div className="text-right">
          <div className="text-lg font-semibold">⏱️ {timeLeft}s</div>
          <div className="text-sm text-gray-300">Best: {bestScore} (L{bestLevel})</div>
        </div>
      </div>

      {!gameOver ? (
        <div className="bg-black/30 p-6 rounded-lg relative overflow-hidden">
          {/* animated time progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-1 bg-emerald-400"
              initial={false}
              animate={{ width: `${Math.max(0, (timeLeft / MAX_TIME) * 100)}%` }}
              transition={{ ease: "linear", duration: 0.25 }}
            />
          </div>

          <QuestionBox question={question.question} onSubmit={handleSubmit} level={level} feedback={feedback} />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
            <div className={`flex items-center gap-2 ${streakPulse ? 'animate-pulse' : ''}`}>
              <span>🔥</span>
              <span>Streak: <span className="font-semibold">{streak}</span></span>
            </div>
            <div>Best: <span className="font-semibold">{bestScore}</span> (L{bestLevel})</div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Over 💥</h1>
          <p className="text-lg mb-2">Final Score: {score}</p>
          <p className="text-sm mb-4">You reached Level {level}</p>
          <button onClick={restartGame} className="bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600">
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
