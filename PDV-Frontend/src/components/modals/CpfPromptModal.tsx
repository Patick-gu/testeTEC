import React, { useState, useEffect, useRef } from 'react';
import { useSale, useUI } from '../../context/index';

export const CpfPromptModal: React.FC = () => {
  const { showCpfPromptModal, setShowCpfPromptModal } = useUI();
  const { proceedToPayment, customer } = useSale();

  const [cpfInput, setCpfInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically whenever modal opens
  useEffect(() => {
    if (showCpfPromptModal) {
      // Pre-fill existing customer CPF if already registered, otherwise start blank
      setCpfInput(customer.cpf || '');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [showCpfPromptModal, customer.cpf]);

  if (!showCpfPromptModal) return null;

  const maskCpf = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCpf(e.target.value);
    setCpfInput(masked);
  };

  const handleConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    proceedToPayment(cpfInput);
  };

  const handleSkip = () => {
    proceedToPayment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">CPF na Nota?</h3>
              <p className="text-xs text-slate-400">Opcional para a NFC-e</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCpfPromptModal(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            title="Cancelar [ESC]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleConfirm} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 uppercase font-medium">
              Número do CPF
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-slate-300 text-lg pointer-events-none">
                person
              </span>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                inputMode="numeric"
                value={cpfInput}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200/60 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl font-mono-num text-lg font-semibold text-slate-800 tracking-wide outline-none transition-all"
              />
              {cpfInput && (
                <button
                  type="button"
                  onClick={() => setCpfInput('')}
                  className="absolute right-3 text-slate-300 hover:text-slate-500 p-1"
                  title="Limpar CPF"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Deixe em branco e aperte ENTER para avançar sem informar o CPF.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  {cpfInput.trim() ? 'check_circle' : 'arrow_forward'}
                </span>
                <span>
                  {cpfInput.trim() ? 'Confirmar e Avançar' : 'Avançar sem CPF'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono-num text-xs hidden sm:block">
                ENTER
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCpfPromptModal(false)}
              className="w-full h-10 rounded-xl bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors"
            >
              Voltar (ESC)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
