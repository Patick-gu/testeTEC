import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const Toast: React.FC = () => {
  const { toastMessage } = usePdv();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-800 px-4 py-3 rounded-full shadow-lg border border-slate-200/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
        <span className="material-symbols-outlined text-sm">check</span>
      </div>
      <div className="text-sm font-medium pr-2">{toastMessage}</div>
    </div>
  );
};
