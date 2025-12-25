'use client';

import type { Player } from '@/types';

interface PlayerAvatarProps {
  player: Player;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
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
}: PlayerAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center font-bold
          ${isActive ? 'bg-green-500 text-white ring-4 ring-green-300' : 'bg-gray-200 text-gray-700'}
          transition-all duration-300
        `}
      >
        {player.initial}
      </div>
      <span className={`text-center ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {player.name}
      </span>
      {showScore && (
        <span
          className={`
          font-bold
          ${player.totalScore > 0 ? 'text-green-600' : player.totalScore < 0 ? 'text-red-600' : 'text-gray-600'}
        `}
        >
          {player.totalScore > 0 ? '+' : ''}
          {player.totalScore}
        </span>
      )}
    </div>
  );
}
