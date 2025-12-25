'use client';

import { useEffect, useState } from 'react';
import { formatTime, getTimerColor } from '@/lib/utils';

interface TimerProps {
  duration?: number; // in seconds, default 60
  startedAt: number | null;
  onTimeUp?: () => void;
}

function calculateRemaining(startedAt: number | null, duration: number): number {
  if (!startedAt) return duration;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, duration - elapsed);
}

export function Timer({ duration = 60, startedAt, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(() =>
    calculateRemaining(startedAt, duration)
  );

  useEffect(() => {
    if (!startedAt) return;

    const interval = setInterval(() => {
      const newRemaining = calculateRemaining(startedAt, duration);
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startedAt, duration, onTimeUp]);

  // Use key prop in parent to reset state when startedAt changes
  const colorClass = getTimerColor(remaining);

  return (
    <div
      className={`
        ${colorClass}
        text-white text-6xl font-bold
        py-8 px-12 rounded-2xl
        flex items-center justify-center
        min-w-[200px]
        transition-colors duration-300
      `}
    >
      {formatTime(remaining)}
    </div>
  );
}
