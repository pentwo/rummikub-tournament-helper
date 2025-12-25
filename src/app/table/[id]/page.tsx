'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useTable } from '@/hooks/useTable';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/hooks/useToast';
import { Timer } from '@/components/Timer';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { ScoreInput } from '@/components/ScoreInput';
import { ReorderPlayersModal } from '@/components/ReorderPlayersModal';
import { QRCodeModal } from '@/components/QRCodeModal';
import type { Player } from '@/types';

export default function TablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { table, loading, error, updateTable, refetch } = useTable(id);
  const { data: tournamentData, refetch: refetchTournament } = useTournament();
  const { showToast } = useToast();
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Get current page URL for QR code
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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

  // Reorder players
  const handleReorderSave = async (newOrder: string[]) => {
    if (!table) return;
    await updateTable({ players: newOrder, currentPlayerIndex: 0 });
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

      showToast('Round scores submitted successfully!', 'success');
      setWinnerId(null);
      refetch();
      refetchTournament();
    } catch (err) {
      console.error('Error submitting scores:', err);
      showToast('Failed to submit scores. Please try again.', 'error');
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Show QR Code"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Reorder
          </button>
        </div>
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

      {/* Current Player - Enhanced Tap Zone */}
      <div
        className="flex-1 flex flex-col items-center justify-center cursor-pointer group"
        onClick={handleNextPlayer}
      >
        {/* Player Avatar with animated ring */}
        <div className="relative">
          {/* Animated outer ring */}
          <div className="absolute -inset-4 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />
          {/* Pulse ring effect */}
          <div className="absolute -inset-2 rounded-full border border-green-400/50 animate-pulse-ring" />
          {currentPlayer && (
            <PlayerAvatar player={currentPlayer} isActive size="lg" />
          )}
        </div>

        <p className="text-gray-300 mt-6 font-medium">Current Turn</p>

        {/* Prominent tap hint button */}
        <div className="mt-4 px-6 py-3 glass rounded-full group-hover:bg-white/20 transition-all duration-200 active-scale">
          <span className="text-white/90 flex items-center gap-2 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            Tap to switch player
          </span>
        </div>
      </div>

      {/* All Players Score Bar - Grid Layout */}
      <div className="glass-dark rounded-xl p-3 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tablePlayers.map((player, index) => {
            const isActive = index === table.currentPlayerIndex;
            const scoreColor = player.totalScore > 0
              ? 'text-green-400'
              : player.totalScore < 0
                ? 'text-red-400'
                : 'text-white';

            return (
              <div
                key={player.id}
                className={`
                  p-3 rounded-lg transition-all duration-300
                  ${isActive
                    ? 'bg-green-500/20 ring-2 ring-green-400/70 scale-[1.02]'
                    : 'bg-gray-700/50'}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-gray-300 text-sm font-medium truncate">{player.name}</span>
                </div>
                <div className={`text-2xl font-bold ${scoreColor}`}>
                  {player.totalScore > 0 ? '+' : ''}{player.totalScore}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* End Round Button */}
      <button
        onClick={handleEndRound}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-200 active-scale shadow-lg shadow-yellow-500/25 touch-target safe-bottom"
      >
        End Round
      </button>

      {/* Reorder Players Modal */}
      <ReorderPlayersModal
        isOpen={isReorderModalOpen}
        players={tablePlayers}
        playerIds={table.players}
        onClose={() => setIsReorderModalOpen(false)}
        onSave={handleReorderSave}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={currentUrl}
        title="Share This Table"
      />
    </main>
  );
}
