import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const Toast: React.FC = () => {
  const { toastMessage } = usePdv();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <span className="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
      <div>
        <div className="font-mono-num text-xs font-bold text-white">Operação do Caixa</div>
        <div className="font-mono-num text-xs text-slate-300">{toastMessage}</div>
      </div>
    </div>
  );
};
