'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function QRCodeModal({ isOpen, onClose, url, title = 'Scan to Join' }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm mb-6">Scan this QR code with your phone</p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-gray-100">
            <QRCodeSVG
              value={url}
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1f2937"
            />
          </div>

          {/* URL Display */}
          <div className="mt-6 p-3 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Page URL</p>
            <p className="text-sm text-gray-700 font-mono break-all">{url}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
