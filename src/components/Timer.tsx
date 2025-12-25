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

  // Determine glow effect based on remaining time
  const getGlowClass = () => {
    if (remaining <= 0) return 'shadow-glow-red';
    if (remaining <= 15) return 'shadow-glow-red';
    if (remaining <= 30) return 'shadow-glow-yellow';
    return 'shadow-glow-green';
  };

  // Add bounce animation when time is running low
  const urgencyClass = remaining > 0 && remaining <= 10 ? 'animate-bounce-subtle' : '';

  return (
    <div
      className={`
        ${colorClass}
        ${getGlowClass()}
        ${urgencyClass}
        text-white text-fluid-3xl font-bold
        py-6 px-10 md:py-8 md:px-12 rounded-2xl
        flex items-center justify-center
        min-w-[180px] md:min-w-[200px]
        transition-all duration-300
      `}
    >
      {formatTime(remaining)}
    </div>
  );
}
