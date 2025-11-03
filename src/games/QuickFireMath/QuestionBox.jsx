import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
void motion;

export default function QuestionBox({ question, onSubmit, level, feedback }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    // autofocus input when question changes
    if (ref.current && typeof ref.current.focus === 'function') ref.current.focus();
  }, [question]);

  const submit = () => {
    const num = Number(value);
    onSubmit(num);
    setValue("");
  };

  const containerVariants = {
    idle: { scale: 1 },
    correct: { scale: [1, 1.04, 1], transition: { duration: 0.32 } },
    wrong: { scale: [1, 0.98, 1], transition: { duration: 0.32 } },
  };

  return (
    <motion.div animate={feedback || "idle"} variants={containerVariants} className="flex flex-col items-center justify-center">
      <div className="text-4xl font-bold mb-4 bg-gray-900 px-8 py-4 rounded-lg shadow-lg">
        {question}
      </div>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="text-2xl text-center p-2 rounded-md outline-none w-36 bg-gray-200 text-gray-900"
        placeholder="Answer"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
          if (e.key === "Escape") setValue("");
        }}
      />
      <div className="mt-3 flex items-center gap-2">
        <p className="text-sm opacity-80">Level {level}</p>
        <p className="text-xs opacity-70">Press Enter to submit</p>
      </div>

      {/* on-screen numeric pad for touch devices */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-44">
        {['1','2','3','4','5','6','7','8','9','←','0','⏎'].map((k) => (
          <button
            key={k}
            className="px-2 py-2 rounded bg-white/10 hover:bg-white/20"
            onClick={() => {
              if (k === '←') setValue((v) => v.slice(0, -1));
              else if (k === '⏎') submit();
              else setValue((v) => (v + k).replace(/[^0-9-]/g, ''));
            }}
          >
            {k}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
