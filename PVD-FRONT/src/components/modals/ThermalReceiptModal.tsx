import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const ThermalReceiptModal: React.FC = () => {
  const { recentReceipt, showReceiptModal, setShowReceiptModal, showToast } = usePdv();

  if (!showReceiptModal || !recentReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-sm w-full flex flex-col my-auto animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">NFC-e Emitida</h2>
              <p className="text-xs text-slate-400">Venda concluída com sucesso</p>
            </div>
          </div>
          <button
            onClick={() => setShowReceiptModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 bg-white border border-slate-200/60 rounded-xl font-mono-num text-[11px] text-slate-800 select-all mb-4">
          <div className="text-center pb-3 border-b border-dashed border-slate-200">
            <div className="font-bold text-sm text-slate-900 mb-1">SUPERMERCADO NEXUS LTDA</div>
            <div className="text-slate-500">CNPJ: 12.345.678/0001-90</div>
            <div className="text-slate-500">AV. PAULISTA, 1000 - SÃO PAULO/SP</div>
            <div className="font-bold mt-2 text-slate-800">
              DANFE NFC-e
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Não permite aproveitamento de crédito de ICMS</div>
          </div>

          <div className="py-2 border-b border-dashed border-slate-200 flex justify-between text-slate-500">
            <span>Venda: {recentReceipt.saleNumber}</span>
            <span>Data: {recentReceipt.timestamp}</span>
          </div>

          <div className="py-2 border-b border-dashed border-slate-200 flex flex-col gap-1">
            <div className="grid grid-cols-12 font-bold text-slate-500 border-b border-slate-100 pb-1 mb-1">
              <span className="col-span-1">#</span>
              <span className="col-span-6">DESC</span>
              <span className="col-span-2 text-center">QTD</span>
              <span className="col-span-3 text-right">TOTAL</span>
            </div>

            {recentReceipt.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 py-0.5">
                <span className="col-span-1 text-slate-400">{idx + 1}</span>
                <span className="col-span-6 truncate font-medium">{item.product.name}</span>
                <span className="col-span-2 text-center text-slate-500">
                  {item.quantity}{item.product.unit.toLowerCase()}
                </span>
                <span className="col-span-3 text-right font-semibold">
                  {item.subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>

          <div className="py-2 border-b border-dashed border-slate-200 flex flex-col gap-1.5">
            <div className="flex justify-between text-slate-500">
              <span>QTD. TOTAL DE ITENS</span>
              <span className="font-semibold">{recentReceipt.items.length}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-900 pt-1">
              <span>VALOR TOTAL R$</span>
              <span>{recentReceipt.total.toFixed(2).replace('.', ',')}</span>
            </div>
            {recentReceipt.payments.map((p) => (
              <div key={p.id} className="flex justify-between text-slate-500 pt-0.5">
                <span>FORMA PGTO ({p.methodLabel.toUpperCase()}):</span>
                <span>{p.amount.toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
            {recentReceipt.change > 0 && (
              <div className="flex justify-between text-slate-800 font-bold mt-1">
                <span>TROCO R$:</span>
                <span>{recentReceipt.change.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
          </div>

          <div className="pt-3 text-center flex flex-col items-center gap-2">
            <div className="text-slate-600 font-medium">
              CONSUMIDOR: {recentReceipt.customerCpf ? `CPF ${recentReceipt.customerCpf}` : 'NÃO IDENTIFICADO'}
            </div>

            <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-200 p-2 flex items-center justify-center my-1 text-slate-400">
               [ QR CODE ]
            </div>

            <div className="text-[9px] text-slate-500 leading-tight">
              Consulte pela Chave de Acesso em:
              <br />
              <strong className="text-slate-700">www.fazenda.sp.gov.br/nfce/consulta</strong>
            </div>

            <div className="text-[8.5px] text-slate-500 bg-slate-50 border border-slate-100 p-1.5 rounded-lg break-all">
              {recentReceipt.nfceKey}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Imprimir
          </button>

          <button
            onClick={() => {
              showToast('Comprovante enviado com sucesso para o WhatsApp informado.');
              setShowReceiptModal(false);
            }}
            className="flex-1 h-11 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">send</span>
            WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
