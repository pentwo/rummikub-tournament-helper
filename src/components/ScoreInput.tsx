'use client';

import { useState } from 'react';
import type { Player } from '@/types';

interface ScoreInputProps {
  players: Player[];
  winnerId: string | null;
  onWinnerSelect: (playerId: string) => void;
  onScoresSubmit: (scores: Record<string, number>) => void;
}

export function ScoreInput({
  players,
  winnerId,
  onWinnerSelect,
  onScoresSubmit,
}: ScoreInputProps) {
  const [loserScores, setLoserScores] = useState<Record<string, number>>({});

  const losers = players.filter((p) => p.id !== winnerId);
  const winner = players.find((p) => p.id === winnerId);

  const totalLost = Object.values(loserScores).reduce(
    (sum, score) => sum + (score || 0),
    0
  );

  const handleSubmit = () => {
    if (!winnerId) return;

    const scores: Record<string, number> = {};
    for (const loser of losers) {
      scores[loser.id] = -(loserScores[loser.id] || 0);
    }
    scores[winnerId] = totalLost;

    onScoresSubmit(scores);
  };

  const allScoresEntered = losers.every(
    (p) => loserScores[p.id] !== undefined && loserScores[p.id] >= 0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Round Settlement</h2>

      {/* Winner Selection */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Who won?</h3>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => onWinnerSelect(player.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  winnerId === player.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loser Scores */}
      {winnerId && (
        <>
          <div className="mb-6">
            <h3 className="font-medium mb-2">
              Enter remaining tile scores for losers:
            </h3>
            <div className="space-y-3">
              {losers.map((player) => (
                <div key={player.id} className="flex items-center gap-3">
                  <span className="w-20 font-medium">{player.name}:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={loserScores[player.id] ?? ''}
                    onChange={(e) =>
                      setLoserScores({
                        ...loserScores,
                        [player.id]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Winner's Score Preview */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <span className="font-medium">{winner?.name}</span> wins:{' '}
              <span className="text-2xl font-bold text-green-600">
                +{totalLost}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!allScoresEntered}
            className={`
              w-full py-3 rounded-lg font-bold text-white transition-colors
              ${
                allScoresEntered
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            Confirm Settlement
          </button>
        </>
      )}
    </div>
  );
}
