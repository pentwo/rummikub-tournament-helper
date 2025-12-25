'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useTable } from '@/hooks/useTable';
import { useTournament } from '@/hooks/useTournament';
import { Timer } from '@/components/Timer';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { ScoreInput } from '@/components/ScoreInput';
import type { Player } from '@/types';

export default function TablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { table, loading, error, updateTable, refetch } = useTable(id);
  const { data: tournamentData, refetch: refetchTournament } = useTournament();
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Get players for this table
  const tablePlayers: Player[] =
    table?.players
      .map((playerId) => tournamentData?.players.find((p) => p.id === playerId))
      .filter((p): p is Player => p !== undefined) || [];

  const currentPlayer = tablePlayers[table?.currentPlayerIndex || 0];

  // Start timer when player switches
  const handleStartTimer = useCallback(async () => {
    if (!table) return;
    await updateTable({ timerStartedAt: Date.now() });
  }, [table, updateTable]);

  // Switch to next player
  const handleNextPlayer = async () => {
    if (!table) return;
    const nextIndex = (table.currentPlayerIndex + 1) % table.players.length;
    await updateTable({
      currentPlayerIndex: nextIndex,
      timerStartedAt: Date.now(),
    });
  };

  // Enter scoring mode
  const handleEndRound = async () => {
    if (!table) return;
    await updateTable({ status: 'scoring', timerStartedAt: null });
    setWinnerId(null);
  };

  // Submit round scores
  const handleScoresSubmit = async (scores: Record<string, number>) => {
    if (!table || !winnerId) return;

    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: table.id,
          winnerId,
          scores,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit scores');

      setWinnerId(null);
      refetch();
      refetchTournament();
    } catch (err) {
      console.error('Error submitting scores:', err);
      alert('Failed to submit scores');
    }
  };

  // Auto-start timer on first load if playing
  useEffect(() => {
    if (table?.status === 'playing' && table.timerStartedAt === null) {
      handleStartTimer();
    }
  }, [table?.status, table?.timerStartedAt, handleStartTimer]);

  if (loading && !table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">
            {error || 'Table not found'}
          </div>
          <Link
            href="/"
            className="text-blue-400 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Scoring mode
  if (table.status === 'scoring') {
    return (
      <main className="min-h-screen bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
          <span className="text-gray-400">Round {table.currentRound}</span>
          <div className="w-12"></div>
        </div>
        <div className="w-full max-w-md mx-auto">
          <ScoreInput
            players={tablePlayers}
            winnerId={winnerId}
            onWinnerSelect={setWinnerId}
            onScoresSubmit={handleScoresSubmit}
          />
          <button
            onClick={() => updateTable({ status: 'playing' })}
            className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </main>
    );
  }

  // Playing mode
  return (
    <main className="min-h-screen bg-gray-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </Link>
        <span className="text-gray-400">Round {table.currentRound}</span>
        <div className="w-12"></div>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-8">
        <Timer
          key={table.timerStartedAt ?? 'stopped'}
          duration={60}
          startedAt={table.timerStartedAt}
          onTimeUp={() => {}}
        />
      </div>

      {/* Current Player */}
      <div
        className="flex-1 flex flex-col items-center justify-center cursor-pointer"
        onClick={handleNextPlayer}
      >
        {currentPlayer && (
          <PlayerAvatar player={currentPlayer} isActive size="lg" />
        )}
        <p className="text-gray-400 mt-4">Current Turn</p>
        <p className="text-gray-500 text-sm mt-2">Tap anywhere to switch player</p>
      </div>

      {/* All Players Score Bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex justify-around">
          {tablePlayers.map((player, index) => (
            <div
              key={player.id}
              className={`text-center ${
                index === table.currentPlayerIndex ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div
                className={`text-lg font-bold ${
                  player.totalScore > 0
                    ? 'text-green-400'
                    : player.totalScore < 0
                      ? 'text-red-400'
                      : 'text-white'
                }`}
              >
                {player.totalScore > 0 ? '+' : ''}
                {player.totalScore}
              </div>
              <div className="text-gray-400 text-sm">{player.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* End Round Button */}
      <button
        onClick={handleEndRound}
        className="w-full py-4 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
      >
        End Round
      </button>
    </main>
  );
}
