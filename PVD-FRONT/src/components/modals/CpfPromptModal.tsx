import React, { useState, useEffect, useRef } from 'react';
import { usePdv } from '../../context/PdvContext';

export const CpfPromptModal: React.FC = () => {
  const {
    showCpfPromptModal,
    setShowCpfPromptModal,
    proceedToPayment,
    customer,
    total
  } = usePdv();

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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">
              badge
            </span>
            <div>
              <h3 className="text-base font-bold tracking-tight">CPF na Nota Fiscal?</h3>
              <p className="text-xs text-slate-400">Identificação para NFC-e e programas estaduais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCpfPromptModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Cancelar [ESC]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleConfirm} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Deseja informar o CPF na nota fiscal?
            </span>
            <p className="text-xs text-slate-500 max-w-sm">
              Se o cliente <strong className="text-slate-700">não quiser CPF</strong>, basta pressionar{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] font-bold text-slate-800">
                ENTER
              </kbd>{' '}
              para avançar diretamente para o pagamento.
            </p>
          </div>

          {/* Large Focused CPF Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-num font-bold text-slate-700 uppercase tracking-wider text-center">
              CPF DO CONSUMIDOR (OPCIONAL)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 material-symbols-outlined text-slate-400 text-xl pointer-events-none">
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
                className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 rounded-xl text-center font-mono-num text-2xl font-bold text-slate-900 tracking-wider outline-none transition-all"
              />
              {cpfInput && (
                <button
                  type="button"
                  onClick={() => setCpfInput('')}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1"
                  title="Limpar CPF"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-between px-5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  {cpfInput.trim() ? 'check_circle' : 'arrow_forward'}
                </span>
                <span>
                  {cpfInput.trim() ? 'Confirmar CPF e Avançar' : 'Avançar sem CPF'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-mono-num text-xs font-bold">
                ENTER
              </span>
            </button>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowCpfPromptModal(false)}
                className="px-4 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Voltar</span>
                <span className="text-[10px] text-slate-500 font-mono">[ESC]</span>
              </button>

              {cpfInput.trim() && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 h-10 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
                >
                  Não informar CPF
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
