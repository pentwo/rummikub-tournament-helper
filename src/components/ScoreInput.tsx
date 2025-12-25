'use client';

import { useState } from 'react';
import type { Player } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface ScoreInputProps {
  players: Player[];
  winnerId: string | null;
  onWinnerSelect: (playerId: string) => void;
  onScoresSubmit: (scores: Record<string, number>) => Promise<void> | void;
}

const QUICK_SCORES = [0, 5, 10, 15, 20, 25, 30];

export function ScoreInput({
  players,
  winnerId,
  onWinnerSelect,
  onScoresSubmit,
}: ScoreInputProps) {
  const [loserScores, setLoserScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const losers = players.filter((p) => p.id !== winnerId);
  const winner = players.find((p) => p.id === winnerId);

  const totalLost = Object.values(loserScores).reduce(
    (sum, score) => sum + (score || 0),
    0
  );

  const handleSubmit = async () => {
    if (!winnerId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const scores: Record<string, number> = {};
      for (const loser of losers) {
        scores[loser.id] = -(loserScores[loser.id] || 0);
      }
      scores[winnerId] = totalLost;

      await onScoresSubmit(scores);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allScoresEntered = losers.every(
    (p) => loserScores[p.id] !== undefined && loserScores[p.id] >= 0
  );

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-5 animate-fade-in-up">
      <div className="bottom-sheet-handle bg-gray-600" />
      <h2 className="text-xl font-bold mb-5 text-center text-white">Round Settlement</h2>

      {/* Winner Selection - Card Style */}
      <div className="mb-6">
        <h3 className="font-medium mb-3 text-gray-300 text-sm uppercase tracking-wide">Select Winner</h3>
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => {
            const isSelected = winnerId === player.id;
            return (
              <button
                key={player.id}
                onClick={() => onWinnerSelect(player.id)}
                className={`
                  p-4 rounded-xl font-medium transition-all duration-200 active-scale touch-target
                  ${isSelected
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-glow-green'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
                `}
              >
                <div className="text-lg font-bold">{player.name}</div>
                {isSelected && (
                  <div className="text-sm mt-1 text-green-100 animate-fade-in flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Winner
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loser Scores */}
      {winnerId && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-300 text-sm uppercase tracking-wide">
              Enter Tile Scores
            </h3>
            <div className="space-y-4">
              {losers.map((player) => (
                <div key={player.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-200">{player.name}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={loserScores[player.id] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setLoserScores({
                          ...loserScores,
                          [player.id]: value ? parseInt(value) : 0,
                        });
                      }}
                      className="w-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white text-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                    />
                  </div>
                  {/* Quick-fill buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SCORES.map((score) => (
                      <button
                        key={score}
                        onClick={() => setLoserScores({ ...loserScores, [player.id]: score })}
                        className={`
                          px-3 py-1.5 text-sm rounded-lg transition-all font-medium active-scale
                          ${loserScores[player.id] === score
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}
                        `}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Winner's Score Preview */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <div className="text-center">
              <span className="text-gray-300">{winner?.name} wins:</span>
              <div className="text-3xl font-bold text-green-400 mt-1">
                +{totalLost}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!allScoresEntered || isSubmitting}
            className={`
              w-full py-4 rounded-xl font-bold text-white transition-all duration-200 active-scale touch-target safe-bottom
              ${allScoresEntered && !isSubmitting
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25'
                : 'bg-gray-600 cursor-not-allowed'}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" light />
                Submitting...
              </span>
            ) : (
              'Confirm Settlement'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
