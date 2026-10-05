import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const HelpModal: React.FC = () => {
  const { showHelpModal, setShowHelpModal } = usePdv();

  if (!showHelpModal) return null;

  const shortcuts = [
    { key: 'F1', desc: 'Ajuda / Atalhos do Sistema' },
    { key: 'F2', desc: 'Acessar Catálogo de Produtos' },
    { key: 'F3', desc: 'Focar Barra de Busca no Caixa' },
    { key: 'F4', desc: 'Cancelar Último Item' },
    { key: 'F5', desc: 'Pagamento em Dinheiro Exato' },
    { key: 'F6', desc: 'Pagamento PIX Dinâmico' },
    { key: 'F8', desc: 'Sangria ou Suprimento' },
    { key: 'F9', desc: 'Identificar Cliente' },
    { key: 'F10', desc: 'Fechar Venda' },
    { key: 'ESC', desc: 'Retornar / Fechar Modais' },
    { key: 'ENTER', desc: 'Confirmar Ação' },
    { key: 'ALT+Num', desc: 'Filtrar Categorias' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-lg w-full flex flex-col animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">keyboard</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Guia de Atalhos</h2>
              <p className="text-xs text-slate-400">Atalhos operacionais do sistema</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelpModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-2 mb-4">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
            >
              <span className="font-semibold text-slate-800 bg-white border border-slate-200/60 px-2.5 py-1 rounded-lg">
                {s.key}
              </span>
              <span className="text-slate-500 text-right">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowHelpModal(false)}
            className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Entendido [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
