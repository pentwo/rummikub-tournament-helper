'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/types';

interface ReorderPlayersModalProps {
  isOpen: boolean;
  players: Player[];
  playerIds: string[];
  onClose: () => void;
  onSave: (newOrder: string[]) => void;
}

export function ReorderPlayersModal({
  isOpen,
  players,
  playerIds,
  onClose,
  onSave,
}: ReorderPlayersModalProps) {
  const [order, setOrder] = useState<string[]>(playerIds);

  // Reset order when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrder(playerIds);
    }
  }, [isOpen, playerIds]);

  if (!isOpen) return null;

  const orderedPlayers = order
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrder(newOrder);
  };

  const handleSave = () => {
    onSave(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="relative bg-gray-800 w-full md:max-w-sm md:rounded-2xl rounded-t-3xl shadow-xl animate-slide-up md:animate-fade-in-up">
        {/* Handle for mobile */}
        <div className="md:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
        </div>

        <div className="p-6 safe-bottom">
          <h2 className="text-xl font-bold mb-5 text-white">Reorder Players</h2>

          <div className="space-y-2 mb-6">
            {orderedPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-gray-700/50 rounded-xl p-3 transition-all"
              >
                <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {index + 1}
                </span>
                <span className="flex-1 font-medium text-gray-200">{player.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`p-2.5 rounded-lg touch-target active-scale transition-all ${
                      index === 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-600 active:bg-gray-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === order.length - 1}
                    className={`p-2.5 rounded-lg touch-target active-scale transition-all ${
                      index === order.length - 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-600 active:bg-gray-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3.5 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition-all active-scale touch-target font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all active-scale touch-target shadow-lg shadow-blue-500/25"
            >
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
