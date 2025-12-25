'use client';

import { useTournament } from '@/hooks/useTournament';
import { TableCard } from '@/components/TableCard';
import { Leaderboard } from '@/components/Leaderboard';

export default function TVPage() {
  // Poll every 2 seconds for live updates
  const { data, loading } = useTournament(2000);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-white">Loading Tournament...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          Rummikub Tournament
        </h1>
        <p className="text-gray-400">{data?.date}</p>
      </div>

      {/* Tables Grid */}
      <section className="mb-12">
        {data?.tables.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            No active tables
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.tables.map((table, index) => (
              <TableCard
                key={table.id}
                table={table}
                players={data.players}
                tableNumber={index + 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">
            Leaderboard
          </h2>
          {data?.players.length === 0 ? (
            <div className="text-center text-gray-400">No players yet</div>
          ) : (
            <Leaderboard players={data?.players || []} compact dark />
          )}
        </div>
      </section>
    </main>
  );
}
