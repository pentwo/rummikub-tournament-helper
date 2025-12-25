'use client';

import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerNames: string[]) => Promise<void> | void;
}

export function CreateTableModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTableModalProps) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validNames = playerNames.filter((name) => name.trim() !== '');

  const handleSubmit = async () => {
    if (validNames.length < 2 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(validNames);
      setPlayerNames(['', '', '', '']);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="relative bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-xl animate-slide-up md:animate-fade-in-up">
        {/* Handle for mobile */}
        <div className="md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
        </div>

        <div className="p-6 safe-bottom">
          <h2 className="text-xl font-bold mb-5 text-gray-800">Create New Table</h2>

          <div className="space-y-4 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Player {index + 1} {index < 2 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={`Enter player ${index + 1} name`}
                  value={playerNames[index]}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[index] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target transition-all"
                />
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-5">
            At least 2 players required to start a game
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all active-scale touch-target font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={validNames.length < 2 || isSubmitting}
              className={`
                flex-1 px-4 py-3.5 rounded-xl font-medium text-white transition-all active-scale touch-target
                ${validNames.length >= 2 && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" light />
                  Creating...
                </span>
              ) : (
                'Create Table'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
