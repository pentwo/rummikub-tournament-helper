'use client';

import type { Player } from '@/types';

interface PlayerAvatarProps {
  player: Player;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  dark?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
};

export function PlayerAvatar({
  player,
  isActive = false,
  size = 'md',
  showScore = false,
  dark = false,
}: PlayerAvatarProps) {
  const getAvatarClasses = () => {
    if (isActive) {
      return 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-300/50 shadow-glow-green';
    }
    if (dark) {
      return 'bg-gray-700 text-gray-200';
    }
    return 'bg-gray-200 text-gray-700';
  };

  const getScoreColor = () => {
    if (player.totalScore > 0) return dark ? 'text-green-400' : 'text-green-600';
    if (player.totalScore < 0) return dark ? 'text-red-400' : 'text-red-600';
    return dark ? 'text-gray-400' : 'text-gray-600';
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`
          ${sizeClasses[size]}
          ${getAvatarClasses()}
          rounded-full flex items-center justify-center font-bold
          transition-all duration-300
        `}
      >
        {player.initial}
      </div>
      <span className={`
        text-center font-medium truncate max-w-[80px]
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
        ${dark ? 'text-gray-300' : 'text-gray-700'}
      `}>
        {player.name}
      </span>
      {showScore && (
        <span className={`font-bold ${size === 'lg' ? 'text-lg' : ''} ${getScoreColor()}`}>
          {player.totalScore > 0 ? '+' : ''}{player.totalScore}
        </span>
      )}
    </div>
  );
}
