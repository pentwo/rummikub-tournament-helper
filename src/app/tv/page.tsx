'use client';

import { useState, useEffect, useRef } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { TableCard } from '@/components/TableCard';
import { Leaderboard } from '@/components/Leaderboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function TVPage() {
  // Poll every 2 seconds for live updates
  const { data, loading } = useTournament(2000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [changedTableIds, setChangedTableIds] = useState<Set<string>>(new Set());
  const prevDataRef = useRef<typeof data>(null);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Track data changes for animations
  useEffect(() => {
    if (data && prevDataRef.current) {
      const changed = new Set<string>();
      data.tables.forEach((table) => {
        const prev = prevDataRef.current?.tables.find(t => t.id === table.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(table)) {
          changed.add(table.id);
        }
      });
      if (changed.size > 0) {
        setChangedTableIds(changed);
        setLastUpdated(new Date());
        setTimeout(() => setChangedTableIds(new Set()), 1500);
      }
    }
    prevDataRef.current = data;
  }, [data]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const getRelativeTime = () => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" light />
          <div className="text-2xl text-white">Loading Tournament...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-6 md:p-8 relative">
      {/* Live Indicator */}
      <div className="fixed top-4 left-4 flex items-center gap-2 glass-dark px-4 py-2 rounded-full z-50">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white text-sm font-medium">LIVE</span>
        <span className="text-gray-400 text-xs hidden sm:inline">• {getRelativeTime()}</span>
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 p-3 glass-dark rounded-lg hover:bg-white/10 transition-colors z-50 touch-target"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        )}
      </button>

      {/* Header with Gradient */}
      <div className="text-center mb-10 pt-8 relative">
        {/* Gradient glow behind title */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-yellow-500/10 blur-3xl -z-10" />
        <h1 className="text-fluid-3xl md:text-5xl lg:text-6xl font-bold text-gradient-gold mb-3">
          Rummikub Tournament
        </h1>
        <p className="text-gray-400 text-lg">{data?.date}</p>
      </div>

      {/* Tables Grid */}
      <section className="mb-12">
        {data?.tables.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">
            No active tables
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {data?.tables.map((table, index) => (
              <div
                key={table.id}
                className={`transition-all duration-500 ${
                  changedTableIds.has(table.id)
                    ? 'animate-pulse ring-2 ring-yellow-400 rounded-lg'
                    : ''
                }`}
              >
                <TableCard
                  table={table}
                  players={data.players}
                  tableNumber={index + 1}
                  variant="tv"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section className="max-w-4xl mx-auto">
        <div className="glass-dark rounded-2xl p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold text-center mb-6">
            Leaderboard
          </h2>
          {data?.players.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No players yet</div>
          ) : (
            <Leaderboard players={data?.players || []} compact dark />
          )}
        </div>
      </section>
    </main>
  );
}
