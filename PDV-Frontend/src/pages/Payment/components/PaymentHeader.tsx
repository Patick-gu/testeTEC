import React from 'react';

interface PaymentHeaderProps {
  saleNumber: string | number;
  customer: any;
  cpfNumber: string;
  totalQuantity: number;
  setShowCustomerModal: (show: boolean) => void;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  saleNumber,
  customer,
  cpfNumber,
  totalQuantity,
  setShowCustomerModal
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/60 px-4 py-3 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/60 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs bg-slate-50 px-2.5 py-1 rounded-lg font-mono-num">
              <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
              <span>VENDA #{saleNumber}</span>
            </div>

            <div className="text-slate-500 text-sm">
              <span>Cliente: </span>
              <strong className="text-slate-700 font-medium">
                {cpfNumber ? `Consumidor (CPF ${cpfNumber})` : customer.name}
              </strong>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors font-medium"
            >
              [F9] Identificar Cliente
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num">
              <span>
                Itens: <strong className="text-slate-600 text-sm">{totalQuantity} un</strong>
              </span>
              <span className="text-slate-200">•</span>
              <span>
                Descontos: <strong className="text-slate-500 text-sm">R$ 0,00</strong>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200/60"></div>

            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              FLUXO ATIVO
            </span>
          </div>
        </div>
  );
};
