'use client';

import type { Table, Player } from '@/types';
import { PlayerAvatar } from './PlayerAvatar';

interface TableCardProps {
  table: Table;
  players: Player[];
  tableNumber: number;
  variant?: 'default' | 'tv';
}

export function TableCard({ table, players, tableNumber, variant = 'default' }: TableCardProps) {
  const tablePlayers = table.players
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  const isTV = variant === 'tv';

  // Status styling
  const statusStyles = {
    playing: isTV
      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
      : 'bg-green-100 text-green-700',
    scoring: isTV
      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      : 'bg-yellow-100 text-yellow-700',
    finished: isTV
      ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      : 'bg-gray-100 text-gray-700',
  };

  return (
    <div className={`
      rounded-xl overflow-hidden transition-all duration-300
      ${isTV
        ? 'glass-dark shadow-lg'
        : 'bg-white shadow-md hover:shadow-lg'}
    `}>
      {/* Header */}
      <div className={`
        flex justify-between items-center
        ${isTV
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3'
          : 'bg-blue-500 px-4 py-2'}
      `}>
        <span className={`font-bold text-white ${isTV ? 'text-lg' : ''}`}>
          Table {tableNumber}
        </span>
        <span className={`text-white/80 ${isTV ? 'text-base' : 'text-sm'}`}>
          Round {table.currentRound}
        </span>
      </div>

      {/* Players */}
      <div className={`${isTV ? 'p-5' : 'p-4'}`}>
        <div className={`flex flex-wrap justify-center ${isTV ? 'gap-5' : 'gap-4'}`}>
          {tablePlayers.map((player, index) => (
            <PlayerAvatar
              key={player.id}
              player={player}
              isActive={
                table.status === 'playing' && index === table.currentPlayerIndex
              }
              size={isTV ? 'md' : 'sm'}
              showScore
              dark={isTV}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className="mt-4 text-center">
          <span
            className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium
              ${isTV ? 'text-sm' : 'text-sm'}
              ${statusStyles[table.status]}
            `}
          >
            {table.status === 'playing' && (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Playing
              </>
            )}
            {table.status === 'scoring' && (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Scoring
              </>
            )}
            {table.status === 'finished' && (
              <>
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Finished
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
