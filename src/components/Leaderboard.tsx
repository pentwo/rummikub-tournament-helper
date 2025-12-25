'use client';

import type { Player } from '@/types';
import { sortPlayersByScore } from '@/lib/utils';

interface LeaderboardProps {
  players: Player[];
  compact?: boolean;
  dark?: boolean;
}

export function Leaderboard({ players, compact = false, dark = false }: LeaderboardProps) {
  const sortedPlayers = sortPlayersByScore(players);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-6 justify-center text-lg">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="flex items-center gap-2">
            <span className={`font-bold ${dark ? 'text-yellow-400' : 'text-gray-500'}`}>
              {index + 1}.
            </span>
            <span className={`font-medium ${dark ? 'text-white' : 'text-gray-800'}`}>
              {player.name}
            </span>
            <span
              className={`font-bold ${
                player.totalScore > 0
                  ? 'text-green-400'
                  : player.totalScore < 0
                    ? 'text-red-400'
                    : dark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              ({player.totalScore > 0 ? '+' : ''}
              {player.totalScore})
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-yellow-500 text-white px-4 py-2 font-bold text-lg">
        Leaderboard
      </div>
      <div className="divide-y">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between px-4 py-3
              ${index < 3 ? 'bg-yellow-50' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${index === 0 ? 'bg-yellow-400 text-white' : ''}
                  ${index === 1 ? 'bg-gray-300 text-white' : ''}
                  ${index === 2 ? 'bg-amber-600 text-white' : ''}
                  ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                `}
              >
                {index + 1}
              </span>
              <span className="font-medium">{player.name}</span>
            </div>
            <span
              className={`font-bold text-lg ${
                player.totalScore > 0
                  ? 'text-green-600'
                  : player.totalScore < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {player.totalScore > 0 ? '+' : ''}
              {player.totalScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
