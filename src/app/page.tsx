'use client';

import { useState } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { TableCard } from '@/components/TableCard';
import { Leaderboard } from '@/components/Leaderboard';
import { CreateTableModal } from '@/components/CreateTableModal';

export default function AdminPage() {
  const { data, loading, refetch } = useTournament(5000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTable = async (playerNames: string[]) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerNames }),
      });

      if (!response.ok) throw new Error('Failed to create table');

      refetch();
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the tournament? All data will be lost.')) {
      return;
    }

    try {
      const response = await fetch('/api/tournament', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to reset');
      refetch();
    } catch (error) {
      console.error('Error resetting tournament:', error);
      alert('Failed to reset tournament');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Rummikub Tournament
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
            <a
              href="/tv"
              target="_blank"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Open TV Display
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + New Table
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Active Tables</h2>
          {data?.tables.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No active tables. Create one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.tables.map((table, index) => (
                <a key={table.id} href={`/table/${table.id}`}>
                  <TableCard
                    table={table}
                    players={data.players}
                    tableNumber={index + 1}
                  />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Leaderboard</h2>
          {data?.players.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No players yet.
            </div>
          ) : (
            <Leaderboard players={data?.players || []} />
          )}
        </section>
      </div>

      <CreateTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTable}
      />
    </main>
  );
}
