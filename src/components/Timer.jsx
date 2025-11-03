import React, { useEffect, useState } from 'react';

export default function Timer({ initial = 0, running = true, onTick }) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds(s => {
        const next = s + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTick]);

  const format = s => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return <div className="font-mono">{format(seconds)}</div>;
}
