import { motion } from "framer-motion";

// Bubble shows an equation string and is rendered in a static grid by the parent.
// status: 'idle' | 'correct' | 'wrong' controls color/animation
export default function Bubble({ eq, onClick, disabled, status = 'idle' }) {
  const variants = {
    idle: { scale: 1, boxShadow: '0px 6px 12px rgba(0,0,0,0.08)' },
    correct: { scale: 1.06, backgroundColor: '#d1fae5', borderColor: '#10b981', transition: { duration: 0.25 } },
    wrong: { scale: 0.98, backgroundColor: '#fee2e2', borderColor: '#ef4444', transition: { duration: 0.25 } },
  };

  return (
    <motion.button
      className={`flex items-center justify-center w-28 h-28 rounded-full bg-white text-gray-800 font-semibold cursor-pointer border-2 border-transparent ${disabled ? "opacity-50 pointer-events-none" : "hover:brightness-95"}`}
      whileHover={status === 'idle' ? { scale: 1.06 } : {}}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(eq)}
      disabled={disabled}
      variants={variants}
      animate={status}
    >
      <div className="text-sm text-center select-none">{eq.question}</div>
    </motion.button>
  );
}
