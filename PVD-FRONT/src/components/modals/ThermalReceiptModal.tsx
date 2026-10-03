import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const ThermalReceiptModal: React.FC = () => {
  const { recentReceipt, showReceiptModal, setShowReceiptModal } = usePdv();

  if (!showReceiptModal || !recentReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-300 flex flex-col overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Modal Top Actions */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
            <span className="text-xs font-bold font-mono-num uppercase tracking-wide">
              NFC-e Emitida com Sucesso
            </span>
          </div>
          <button
            onClick={() => setShowReceiptModal(false)}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Realistic Thermal Receipt Paper (EPSON TM-T20 80mm Style) */}
        <div className="p-6 bg-[#fffef9] font-mono-num text-[11px] text-slate-800 select-all border-b border-dashed border-slate-300">
          <div className="text-center pb-2 border-b border-dashed border-slate-300">
            <div className="font-bold text-sm text-slate-900">SUPERMERCADO NEXUS LTDA</div>
            <div>CNPJ: 12.345.678/0001-90</div>
            <div>AV. PAULISTA, 1000 - BELA VISTA - SÃO PAULO/SP</div>
            <div className="font-bold mt-1">
              DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
            </div>
            <div className="text-[10px] text-slate-600">Não permite aproveitamento de crédito de ICMS</div>
          </div>

          {/* Details header */}
          <div className="py-2 border-b border-dashed border-slate-300 flex justify-between text-[10px]">
            <span>Venda: {recentReceipt.saleNumber}</span>
            <span>Data: {recentReceipt.timestamp}</span>
          </div>

          {/* Items breakdown */}
          <div className="py-2 border-b border-dashed border-slate-300 flex flex-col gap-1">
            <div className="grid grid-cols-12 font-bold text-[10px] text-slate-600 border-b border-slate-200 pb-1">
              <span className="col-span-1">#</span>
              <span className="col-span-6">DESC</span>
              <span className="col-span-2 text-center">QTD</span>
              <span className="col-span-3 text-right">TOTAL</span>
            </div>

            {recentReceipt.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 text-[10.5px] py-0.5">
                <span className="col-span-1 text-slate-500">{idx + 1}</span>
                <span className="col-span-6 truncate font-medium">{item.product.name}</span>
                <span className="col-span-2 text-center text-slate-600">
                  {item.quantity}{item.product.unit.toLowerCase()}
                </span>
                <span className="col-span-3 text-right font-bold">
                  R$ {item.subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-slate-300 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>QTD. TOTAL DE ITENS</span>
              <span className="font-bold">{recentReceipt.items.length}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-900 pt-1">
              <span>VALOR TOTAL R$</span>
              <span>R$ {recentReceipt.total.toFixed(2).replace('.', ',')}</span>
            </div>
            {recentReceipt.payments.map((p) => (
              <div key={p.id} className="flex justify-between text-slate-600 pt-0.5">
                <span>FORMA PGTO ({p.methodLabel.toUpperCase()}):</span>
                <span>R$ {p.amount.toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
            {recentReceipt.change > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>TROCO R$:</span>
                <span>R$ {recentReceipt.change.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
          </div>

          {/* Consumer info & fiscal key */}
          <div className="pt-2 text-center flex flex-col items-center gap-1.5">
            <div className="text-[10px]">
              CONSUMIDOR: {recentReceipt.customerCpf ? `CPF ${recentReceipt.customerCpf}` : 'NÃO IDENTIFICADO'}
            </div>

            {/* Stylized QR Code */}
            <div className="w-24 h-24 bg-white border border-slate-300 p-1 flex items-center justify-center my-1">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                <rect x="5" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="9" y="9" width="20" height="20" rx="1" fill="#ffffff" />
                <rect x="13" y="13" width="12" height="12" fill="#0f172a" />
                <rect x="67" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="71" y="9" width="20" height="20" rx="1" fill="#ffffff" />
                <rect x="75" y="13" width="12" height="12" fill="#0f172a" />
                <rect x="5" y="67" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="9" y="71" width="20" height="20" rx="1" fill="#ffffff" />
                <rect x="13" y="75" width="12" height="12" fill="#0f172a" />
                <rect x="38" y="10" width="8" height="18" fill="#0f172a" />
                <rect x="50" y="24" width="8" height="14" fill="#0f172a" />
                <rect x="38" y="50" width="24" height="8" fill="#0f172a" />
                <rect x="70" y="60" width="18" height="20" fill="#0f172a" />
              </svg>
            </div>

            <div className="text-[9px] text-slate-500 leading-tight">
              Consulte pela Chave de Acesso em:
              <br />
              <strong className="text-slate-800">www.fazenda.sp.gov.br/nfce/consulta</strong>
            </div>

            <div className="text-[8.5px] font-mono-num text-slate-600 bg-slate-100 p-1 rounded break-all">
              {recentReceipt.nfceKey}
            </div>

            <div className="text-[9px] text-slate-400 mt-1">
              Protocolo de Autorização: 135240098234891 24/10/2024
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 h-9 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-mono-num text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Imprimir Cupom
          </button>

          <button
            onClick={() => {
              alert('Comprovante enviado com sucesso para o WhatsApp informado.');
              setShowReceiptModal(false);
            }}
            className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono-num text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
