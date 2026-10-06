import React from 'react';

interface PaymentFiscalBarProps {
  transmitNfce: boolean;
  setTransmitNfce: (val: boolean) => void;
  printCoupon: boolean;
  setPrintCoupon: (val: boolean) => void;
  whatsAppNumber: string;
  setWhatsAppNumber: (val: string) => void;
  cpfNumber: string;
  setCpfNumber: (val: string) => void;
}

export const PaymentFiscalBar: React.FC<PaymentFiscalBarProps> = ({
  transmitNfce, setTransmitNfce,
  printCoupon, setPrintCoupon,
  whatsAppNumber, setWhatsAppNumber,
  cpfNumber, setCpfNumber
}) => {
  return (
    <>
      {/* Fiscal Dispatch & Emission Options Bar */}
            <div className="bg-white border border-slate-200/60 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={transmitNfce}
                    onChange={(e) => setTransmitNfce(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-600">Transmitir NFC-e</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printCoupon}
                    onChange={(e) => setPrintCoupon(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-slate-400">print</span>
                    Imprimir Cupom
                    <span className="text-xs text-slate-400 font-mono-num">[F12]</span>
                  </span>
                </label>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-slate-400 text-base">send_to_mobile</span>
                  <input
                    type="tel"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="WhatsApp Cupom (DDD + Tel)"
                    className="bg-transparent text-slate-600 placeholder:text-slate-300 text-xs font-mono-num focus:outline-none w-44"
                  />
                </div>
              </div>

              {/* CPF na Nota */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-xs text-slate-400 font-mono-num whitespace-nowrap">
                  CPF na Nota:
                </span>
                <input
                  type="text"
                  value={cpfNumber}
                  onChange={(e) => setCpfNumber(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white border border-slate-200/60 px-3 py-1.5 rounded-xl text-slate-600 font-mono-num text-xs w-36 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
            </div>
    </>
  );
};
