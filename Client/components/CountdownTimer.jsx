// src/components/CountdownTimer.jsx
import { useState, useEffect } from 'react';

const CountdownTimer = ({ hours = 2 }) => {
  const [timeLeft, setTimeLeft] = useState(hours * 3600);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <span className="bg-black text-white px-3 py-1 rounded text-lg font-mono font-bold tracking-tighter">
      {formatTime(timeLeft)}
    </span>
  );
};

export default CountdownTimer;