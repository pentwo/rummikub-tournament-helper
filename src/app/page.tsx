'use client';

import { useState } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { useToast } from '@/hooks/useToast';
import { TableCard } from '@/components/TableCard';
import { Leaderboard } from '@/components/Leaderboard';
import { CreateTableModal } from '@/components/CreateTableModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { QRCodeModal } from '@/components/QRCodeModal';

export default function AdminPage() {
  const { data, loading, refetch } = useTournament(5000);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Get current page URL for QR code
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCreateTable = async (playerNames: string[]) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerNames }),
      });

      if (!response.ok) throw new Error('Failed to create table');

      showToast('Table created successfully!', 'success');
      refetch();
    } catch (error) {
      console.error('Error creating table:', error);
      showToast('Failed to create table. Please try again.', 'error');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the tournament? All data will be lost.')) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/tournament', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to reset');
      showToast('Tournament reset successfully!', 'success');
      refetch();
    } catch (error) {
      console.error('Error resetting tournament:', error);
      showToast('Failed to reset tournament. Please try again.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-xl text-gray-600">Loading tournament...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 safe-all">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Rummikub Tournament
            </h1>
            <p className="text-gray-500 text-sm mt-1">{data?.date}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-3 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all active-scale touch-target font-medium"
              title="Show QR Code"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active-scale touch-target font-medium shadow-md shadow-red-500/20 disabled:opacity-50"
            >
              {isResetting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" light />
                  Resetting...
                </span>
              ) : (
                'Reset'
              )}
            </button>
            <a
              href="/tv"
              target="_blank"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all active-scale touch-target font-medium shadow-md shadow-purple-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              TV Display
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all active-scale touch-target font-medium shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Table
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Active Tables
          </h2>
          {data?.tables.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500">No active tables. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.tables.map((table, index) => (
                <a
                  key={table.id}
                  href={`/table/${table.id}`}
                  className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
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
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Leaderboard
          </h2>
          {data?.players.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No players yet. Create a table to add players!</p>
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

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={currentUrl}
        title="Share Tournament"
      />
    </main>
  );
}
