'use client';

import { useState } from 'react';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerNames: string[]) => void;
}

export function CreateTableModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTableModalProps) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const validNames = playerNames.filter((name) => name.trim() !== '');

  const handleSubmit = () => {
    if (validNames.length < 2) return;
    onSubmit(validNames);
    setPlayerNames(['', '', '', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Table</h2>

        <div className="space-y-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player {index + 1} {index < 2 && '*'}
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          * At least 2 players required
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={validNames.length < 2}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors
              ${
                validNames.length >= 2
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}
