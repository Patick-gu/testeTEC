import React, { useEffect } from 'react';
import { useUI } from '../../context/index';

export const PrintPromptModal: React.FC = () => {
  const { showPrintPromptModal, setShowPrintPromptModal, setShowReceiptModal } = useUI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPrintPromptModal) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape' || e.key === 'F10') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrintPromptModal]);

  if (!showPrintPromptModal) return null;

  const handlePrint = () => {
    setShowPrintPromptModal(false);
    setShowReceiptModal(true);
  };

  const handleSkip = () => {
    setShowPrintPromptModal(false);
    // Venda já finalizada e interface limpa pelo PdvContext
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-8 max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Venda Concluída!</h2>
        <p className="text-slate-500 text-sm mb-8">
          Deseja imprimir a via do consumidor (Cupom/NFC-e)?
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            autoFocus
            onClick={handlePrint}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-sm focus:ring-4 focus:ring-slate-200"
          >
            Sim, Imprimir [ENTER]
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm transition-colors focus:ring-4 focus:ring-slate-100"
          >
            Não Imprimir [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
