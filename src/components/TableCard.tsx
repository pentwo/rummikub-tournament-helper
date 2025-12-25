'use client';

import type { Table, Player } from '@/types';
import { PlayerAvatar } from './PlayerAvatar';

interface TableCardProps {
  table: Table;
  players: Player[];
  tableNumber: number;
}

export function TableCard({ table, players, tableNumber }: TableCardProps) {
  const tablePlayers = table.players
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-500 text-white px-4 py-2 flex justify-between items-center">
        <span className="font-bold">Table {tableNumber}</span>
        <span className="text-sm">Round {table.currentRound}</span>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap justify-center gap-4">
          {tablePlayers.map((player, index) => (
            <PlayerAvatar
              key={player.id}
              player={player}
              isActive={
                table.status === 'playing' && index === table.currentPlayerIndex
              }
              size="sm"
              showScore
            />
          ))}
        </div>
        <div className="mt-3 text-center">
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${table.status === 'playing' ? 'bg-green-100 text-green-700' : ''}
              ${table.status === 'scoring' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${table.status === 'finished' ? 'bg-gray-100 text-gray-700' : ''}
            `}
          >
            {table.status === 'playing' && 'Playing'}
            {table.status === 'scoring' && 'Scoring'}
            {table.status === 'finished' && 'Finished'}
          </span>
        </div>
      </div>
    </div>
  );
}
