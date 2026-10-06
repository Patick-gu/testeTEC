import React from 'react';
import { PaymentMethodType } from '../../../types/pdv';

interface PaymentMethodsGridProps {
  activeMethod: PaymentMethodType;
  setActiveMethod: (method: PaymentMethodType) => void;
}

export const PaymentMethodsGrid: React.FC<PaymentMethodsGridProps> = ({
  activeMethod,
  setActiveMethod
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    Passo 1
                  </span>
                  <h2 className="text-lg font-semibold text-slate-800">Forma de Pagamento</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 font-mono-num">
                  Selecione 1 a 5
                </span>
              </div>

              {/* Grid 2x2 of Primary Methods */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1 - DINHEIRO */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('cash')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'cash'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'cash' ? 'text-white' : 'text-emerald-600'
                      }`}
                    >
                      payments
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'cash'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      1
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold">Dinheiro</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'cash' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Com troco expresso
                    </div>
                  </div>
                </button>

                {/* 2 - PIX */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('pix')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'pix'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'pix' ? 'text-white' : 'text-emerald-600'
                      }`}
                    >
                      qr_code_2
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'pix'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      2
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold">PIX Dinâmico</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'pix' ? 'text-emerald-200' : 'text-emerald-700 font-medium'
                      }`}
                    >
                      Confirmação instantânea
                    </div>
                  </div>
                </button>

                {/* 3 - DÉBITO TEF */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('debit')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'debit'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'debit' ? 'text-white' : 'text-blue-600'
                      }`}
                    >
                      credit_card
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'debit'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      3
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold">Débito TEF</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'debit' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      PinPad Integrado
                    </div>
                  </div>
                </button>

                {/* 4 - CRÉDITO TEF */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('credit')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'credit'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'credit' ? 'text-white' : 'text-amber-600'
                      }`}
                    >
                      credit_score
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'credit'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      4
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold">Crédito TEF</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'credit' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Até 12x parcelas
                    </div>
                  </div>
                </button>
              </div>

              {/* 5 - PAGAMENTO MISTO / DIVIDIR */}
              <button
                type="button"
                onClick={() => setActiveMethod('split')}
                className={`w-full p-3.5 rounded-lg transition-all flex items-center justify-between group ${
                  activeMethod === 'split'
                    ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center ${
                      activeMethod === 'split'
                        ? 'bg-blue-800 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-600'
                    }`}
                  >
                    <span className="material-symbols-outlined">call_split</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">
                      Pagamento Misto / Dividir Conta
                    </div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'split' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Combinar Dinheiro, PIX e Cartões múltiplos
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                    activeMethod === 'split'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  5
                </span>
              </button>
            </div>
    </div>
  );
};
