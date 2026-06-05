'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    info: 'bg-slate-800 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colors[type]} max-w-sm`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100 ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
