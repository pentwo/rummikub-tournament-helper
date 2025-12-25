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

// Rummikub tile values: 1-13 for regular tiles, 30 for Joker
const TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const JOKER_VALUE = 30;

interface TileInputProps {
  playerId: string;
  playerName: string;
  tiles: number[];
  isConfirmed: boolean;
  onAddTile: (value: number) => void;
  onRemoveTile: (index: number) => void;
  onClear: () => void;
}

function TileInput({ playerId, playerName, tiles, isConfirmed, onAddTile, onRemoveTile, onClear }: TileInputProps) {
  const total = tiles.reduce((sum, t) => sum + t, 0);

  return (
    <div className={`rounded-xl p-4 transition-all ${
      isConfirmed ? 'bg-gray-700/50 ring-2 ring-green-500/50' : 'bg-gray-700/50'
    }`}>
      {/* Player name and total */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-200">{playerName}</span>
          {isConfirmed && (
            <span className="text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-400">-{total}</div>
        </div>
      </div>

      {/* Formula display */}
      <div className="bg-gray-800 rounded-lg p-3 mb-3 min-h-[60px]">
        <div className="text-xs text-gray-500 mb-1">Formula</div>
        <div className="flex flex-wrap items-center gap-1">
          {tiles.length === 0 ? (
            <span className="text-gray-500 italic">Tap tiles below to add</span>
          ) : (
            tiles.map((tile, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-500 mx-1">+</span>}
                <button
                  onClick={() => onRemoveTile(index)}
                  className={`
                    px-2 py-1 rounded-lg font-bold text-sm
                    ${tile === JOKER_VALUE
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-blue-500 text-white'}
                    hover:opacity-80 transition-opacity active-scale
                  `}
                  title="Click to remove"
                >
                  {tile === JOKER_VALUE ? '🃏' : tile}
                </button>
              </span>
            ))
          )}
          {tiles.length > 0 && (
            <>
              <span className="text-gray-500 mx-2">=</span>
              <span className="text-white font-bold">{total}</span>
            </>
          )}
        </div>
        {tiles.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 mt-2 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      {/* Tile buttons - 1 to 13 */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {TILES.map((value) => (
          <button
            key={value}
            onClick={() => onAddTile(value)}
            className="aspect-square flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg text-sm active-scale transition-all"
          >
            {value}
          </button>
        ))}
      </div>

      {/* Joker and Zero buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAddTile(JOKER_VALUE)}
          className="py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg active-scale transition-all flex items-center justify-center gap-2"
        >
          <span>🃏</span>
          <span>Joker (+30)</span>
        </button>
        <button
          onClick={onClear}
          className={`py-2 font-bold rounded-lg active-scale transition-all flex items-center justify-center gap-2 ${
            tiles.length === 0
              ? 'bg-green-500 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
        >
          <span>✓</span>
          <span>0 Tiles</span>
        </button>
      </div>
    </div>
  );
}

export function ScoreInput({
  players,
  winnerId,
  onWinnerSelect,
  onScoresSubmit,
}: ScoreInputProps) {
  // Store tiles array for each player
  const [playerTiles, setPlayerTiles] = useState<Record<string, number[]>>({});
  // Track which players have confirmed their score (even if 0)
  const [confirmedPlayers, setConfirmedPlayers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const losers = players.filter((p) => p.id !== winnerId);
  const winner = players.find((p) => p.id === winnerId);

  // Calculate scores from tiles
  const loserScores: Record<string, number> = {};
  for (const player of losers) {
    const tiles = playerTiles[player.id] || [];
    loserScores[player.id] = tiles.reduce((sum, t) => sum + t, 0);
  }

  const totalLost = Object.values(loserScores).reduce(
    (sum, score) => sum + (score || 0),
    0
  );

  const handleAddTile = (playerId: string, value: number) => {
    setPlayerTiles((prev) => ({
      ...prev,
      [playerId]: [...(prev[playerId] || []), value],
    }));
    // Auto-confirm when adding a tile
    setConfirmedPlayers((prev) => new Set(prev).add(playerId));
  };

  const handleRemoveTile = (playerId: string, index: number) => {
    setPlayerTiles((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleClearTiles = (playerId: string) => {
    setPlayerTiles((prev) => ({
      ...prev,
      [playerId]: [],
    }));
    // Mark as confirmed when clicking "0 Tiles"
    setConfirmedPlayers((prev) => new Set(prev).add(playerId));
  };

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

  // All losers must have confirmed their score
  const allScoresEntered = losers.every(
    (p) => confirmedPlayers.has(p.id)
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

      {/* Loser Tile Scores */}
      {winnerId && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-300 text-sm uppercase tracking-wide">
              Enter Tile Scores
            </h3>
            <div className="space-y-4">
              {losers.map((player) => (
                <TileInput
                  key={player.id}
                  playerId={player.id}
                  playerName={player.name}
                  tiles={playerTiles[player.id] || []}
                  isConfirmed={confirmedPlayers.has(player.id)}
                  onAddTile={(value) => handleAddTile(player.id, value)}
                  onRemoveTile={(index) => handleRemoveTile(player.id, index)}
                  onClear={() => handleClearTiles(player.id)}
                />
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
