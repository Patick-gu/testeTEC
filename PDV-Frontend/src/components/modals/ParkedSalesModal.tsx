import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const ParkedSalesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { parkedSales, restoreParkedSale } = usePdv();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-lg w-full flex flex-col animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">pause_circle</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Vendas em Espera</h2>
              <p className="text-xs text-slate-400">{parkedSales.length} venda(s) pausada(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4">
          {parkedSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-800 bg-white border border-slate-200/60 px-2 py-0.5 rounded-lg">
                    {sale.code}
                  </span>
                  <span className="text-xs text-slate-400">{sale.timestamp}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {sale.items.length} itens • {sale.customerCpf ? `CPF ${sale.customerCpf}` : 'Consumidor'}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-800">
                  R$ {sale.total.toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => {
                    restoreParkedSale(sale.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  Reabrir
                </button>
              </div>
            </div>
          ))}

          {parkedSales.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Nenhuma venda pausada no momento
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 h-11 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 rounded-xl font-medium text-sm transition-colors"
          >
            Fechar [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
