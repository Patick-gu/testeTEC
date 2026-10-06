import React from 'react';
import { usePaymentService } from '../service';
import { PaymentMethodsGrid } from './PaymentMethodsGrid';

interface PaymentLeftPanelProps {
  svc: ReturnType<typeof usePaymentService>;
}

export const PaymentLeftPanel: React.FC<PaymentLeftPanelProps> = ({ svc }) => {
  const {
    activeMethod, setActiveMethod, appliedPayments, formatBRL, handleRemovePayment, remainingToPay
  } = svc;

  return (
    {/* LEFT PANEL (5 cols): Method selector, applied payments table, PINPad status */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            
            <PaymentMethodsGrid 
              activeMethod={activeMethod}
              setActiveMethod={setActiveMethod}
            />
            {/* Split Payments Compilation Table */}
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-400 text-base">receipt_long</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    COMPOSIÇÃO DE RECEBIMENTOS
                  </span>
                </div>
                <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  {appliedPayments.length} Lançamento{appliedPayments.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase tracking-wider text-[11px] font-medium">
                      <th className="py-2.5 px-3">Forma</th>
                      <th className="py-2.5 px-3">Detalhe</th>
                      <th className="py-2.5 px-3 text-right">Valor</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono-num">
                    {appliedPayments.map((p) => (
                      <tr key={p.id} className="bg-white hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-600">
                          {p.methodLabel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {p.detail}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                          R$ {p.amount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemovePayment(p.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Remover lançamento"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {appliedPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-300">
                          Nenhum recebimento registrado ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Paid & Remaining Balance */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">
                    TOTAL PAGO
                  </span>
                  <span className="text-base text-slate-600 font-semibold font-mono-num">
                    R$ {totalPaid.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">
                    RESTANTE
                  </span>
                  <span className="text-base text-slate-800 font-bold font-mono-num">
                    R$ {remainingToPay.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* PINPAD Hardware Banner (Image from template) */}
            <div className="rounded-xl bg-white border border-slate-200/60 p-3.5 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-50">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1P2FQGpS60Wn9g8ExepHsOmVTXQstmFUnms4W0PscJTtoaTiSwxSZc3VLyooEAZi9G87JvSUnO4MuE2y6E_U7tgS6ojcV_iapCOqoxNGGT_fM0ff-PxFZE8atDgV-I6OrcX5vF5ueo7iXeCSnyMo42J5B5XlH7ujJCWpubgvJK2RMDshRS8XqMs4SWU6jFLKL7ezSm6JXIG_pBxNRW-OxEK_THwdKbJM-gfMvmYRN5KDpkft04n1c"
                  alt="Terminal PINPad TEF"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono-num">
                  <span className="material-symbols-outlined text-sm text-slate-300">hardware</span>
                  PINPAD TEF PRONTO
                </div>
                <p className="text-sm font-medium text-slate-700 truncate">
                  Stone • Terminal 9210-SP • Homologado
                </p>
                <span className="text-xs text-slate-400 font-mono-num">
                  Nenhum erro de barramento detectado
                </span>
              </div>
            </div>

          </div>
  );
};
