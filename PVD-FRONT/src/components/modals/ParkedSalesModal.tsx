import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const ParkedSalesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { parkedSales, restoreParkedSale } = usePdv();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-xl">pause_circle</span>
            <span className="text-sm font-bold tracking-tight">Vendas em Espera ({parkedSales.length})</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {parkedSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-num font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {sale.code}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-num">{sale.timestamp}</span>
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  {sale.items.length} itens • {sale.customerCpf ? `CPF ${sale.customerCpf}` : 'Consumidor'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono-num text-slate-900">
                  R$ {sale.total.toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => {
                    restoreParkedSale(sale.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono-num font-bold transition-colors shadow-xs"
                >
                  Reabrir no Caixa
                </button>
              </div>
            </div>
          ))}

          {parkedSales.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma venda pausada no momento
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
          >
            Fechar [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
