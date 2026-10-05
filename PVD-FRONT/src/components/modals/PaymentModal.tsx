import React, { useState, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';
import { PaymentMethodType, AppliedPayment } from '../../types/pdv';
import { playBeep } from '../../utils/audio';

export const PaymentModal: React.FC = () => {
  const {
    showPaymentModal,
    setShowPaymentModal,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    total,
    cart,
    saleNumber,
    customer,
    completeSale,
    showToast
  } = usePdv();

  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>(selectedPaymentMethod);
  const [receivedCashStr, setReceivedCashStr] = useState<string>('0,00');
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [cpfNumber, setCpfNumber] = useState<string>(customer.cpf || '');

  // PIX states
  const [pixPaid, setPixPaid] = useState<boolean>(false);
  const [pixTimer, setPixTimer] = useState<number>(292); // ~4m52s

  // Card TEF Pinpad reader states: 'waiting' | 'processing' | 'approved'
  const [cardStatus, setCardStatus] = useState<'waiting' | 'processing' | 'approved'>('waiting');
  const [cardAuthCode, setCardAuthCode] = useState<string>('');

  // Split payment items
  const [splitPayments, setSplitPayments] = useState<AppliedPayment[]>([]);
  const [splitAmount, setSplitAmount] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<PaymentMethodType>('credit');

  // Cash input clean state for auto-replace on new digit entry
  const [isCleanInput, setIsCleanInput] = useState<boolean>(true);

  // Sync active method whenever modal opens or changes
  useEffect(() => {
    if (showPaymentModal) {
      setActiveMethod(selectedPaymentMethod);
      setPixPaid(false);
      setCardStatus('waiting');
      setCardAuthCode('');
      setPixTimer(292);
      setCpfNumber(customer.cpf || '');
      setReceivedCashStr('0,00');
      setIsCleanInput(true);
      setSplitPayments([]);
      setSplitAmount('');
    }
  }, [showPaymentModal, selectedPaymentMethod, customer.cpf, total]);

  // PIX countdown timer
  useEffect(() => {
    if (showPaymentModal && activeMethod === 'pix' && !pixPaid && pixTimer > 0) {
      const t = setInterval(() => setPixTimer((prev) => prev - 1), 1000);
      return () => clearInterval(t);
    }
  }, [showPaymentModal, activeMethod, pixPaid, pixTimer]);

  // Keyboard navigation for payment methods
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPaymentModal) return;
      
      const methods: PaymentMethodType[] = ['cash', 'pix', 'debit', 'credit', 'split'];
      const currentIndex = methods.indexOf(activeMethod);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % methods.length;
        setActiveMethod(methods[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + methods.length) % methods.length;
        setActiveMethod(methods[prevIndex]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal, activeMethod]);

  if (!showPaymentModal) return null;

  const parseBRLToNumber = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9,.]/g, '');
    if (!clean) return 0;
    if (clean.includes(',')) {
      const parts = clean.split(',');
      const whole = parts[0].replace(/\./g, '');
      const dec = (parts[1] || '').padEnd(2, '0').slice(0, 2);
      const parsed = parseFloat(`${whole || '0'}.${dec}`);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length <= 2) {
        const parsed = parseFloat(clean);
        return isNaN(parsed) ? 0 : parsed;
      }
      const parsed = parseFloat(clean.replace(/\./g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const formatBRL = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const receivedCash = parseBRLToNumber(receivedCashStr);
  const cashTroco = Math.max(0, receivedCash - total);

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      setReceivedCashStr('0,00');
      setIsCleanInput(true);
      return;
    }

    const sanitized = raw.replace(/[^0-9,.]/g, '');
    if (isCleanInput || receivedCashStr === '0,00' || receivedCashStr === '0') {
      const lastChar = sanitized.slice(-1);
      if (/[0-9]/.test(lastChar)) {
        setReceivedCashStr(lastChar);
        setIsCleanInput(false);
        return;
      }
    }
    setIsCleanInput(false);
    setReceivedCashStr(sanitized);
  };

  const handleCashBlur = () => {
    const num = parseBRLToNumber(receivedCashStr);
    setReceivedCashStr(formatBRL(num));
    setIsCleanInput(true);
  };

  const handleExactCash = () => {
    setReceivedCashStr(formatBRL(total));
    setIsCleanInput(true);
    playBeep('scan');
  };

  const handleClearCash = () => {
    setReceivedCashStr('0,00');
    setIsCleanInput(true);
    playBeep('scan');
  };

  const handleCashKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'F5') {
      e.preventDefault();
      handleExactCash();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCashBlur();
      if (parseBRLToNumber(receivedCashStr) < total) {
        showToast('Valor recebido é menor que o total da compra!');
      } else {
        handleConfirmFinalPayment();
      }
    }
  };

  const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingToPay = Math.max(0, total - totalPaid);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSimulateCard = () => {
    setCardStatus('processing');
    playBeep('scan');

    setTimeout(() => {
      setCardStatus('approved');
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setCardAuthCode(code);
      playBeep('success');
      showToast(`${activeMethod === 'debit' ? 'Débito' : 'Crédito'} Aprovado! Aut: #${code}`);
    }, 1800);
  };

  const handleSimulatePix = () => {
    setPixPaid(true);
    playBeep('success');
    showToast('PIX confirmado!');
  };

  const handleAddSplitPayment = () => {
    const amt = parseFloat(splitAmount.replace(',', '.')) || 0;
    if (amt <= 0) return;

    const label =
      splitMethod === 'cash' ? 'Dinheiro' : splitMethod === 'pix' ? 'PIX' : splitMethod === 'debit' ? 'Débito' : 'Crédito';

    const newPayment: AppliedPayment = {
      id: `split-${Date.now()}`,
      method: splitMethod,
      methodLabel: label,
      detail: `Parcela ${splitPayments.length + 1}`,
      amount: amt
    };

    setSplitPayments((prev) => [...prev, newPayment]);
    setSplitAmount('');
  };

  const handleConfirmFinalPayment = () => {
    if (activeMethod === 'cash' && receivedCash < total) {
      showToast('Valor recebido é menor que o total da compra!');
      return;
    }
    
    if ((activeMethod === 'debit' || activeMethod === 'credit') && cardStatus !== 'approved') {
      handleSimulateCard();
      setTimeout(() => {
        finalize();
      }, 1900);
      return;
    }
    finalize();
  };

  const finalize = () => {
    let finalPayments: AppliedPayment[] = [];

    if (activeMethod === 'split') {
      finalPayments = splitPayments.length > 0 ? splitPayments : [
        { id: `pay-${Date.now()}`, method: 'cash', methodLabel: 'Dinheiro', detail: 'Valor Integral', amount: total }
      ];
    } else {
      const label = activeMethod === 'cash' ? 'Dinheiro' : activeMethod === 'pix' ? 'PIX Dinâmico' : activeMethod === 'debit' ? 'Débito TEF' : `Crédito TEF (${selectedInstallment}x)`;
      finalPayments = [
        { id: `pay-${Date.now()}`, method: activeMethod, methodLabel: label, detail: 'Valor Integral', amount: total }
      ];
    }

    completeSale(finalPayments, activeMethod === 'cash' ? cashTroco : 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-3xl w-full flex flex-col my-auto animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Pagamento (Venda #{saleNumber})</h2>
              <p className="text-xs text-slate-400">Total: R$ {total.toFixed(2).replace('.', ',')} • Cliente: {cpfNumber ? `CPF ${cpfNumber}` : customer.name}</p>
            </div>
          </div>
          <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Forma de Pagamento</span>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">swap_vert</span>
              Setas [↓] [↑] p/ Navegar
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'cash', label: 'Dinheiro', icon: 'payments' },
            { id: 'pix', label: 'PIX', icon: 'qr_code_2' },
            { id: 'debit', label: 'Débito', icon: 'credit_card' },
            { id: 'credit', label: 'Crédito', icon: 'credit_score' },
            { id: 'split', label: 'Dividir', icon: 'call_split' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMethod(item.id as PaymentMethodType)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shrink-0 ${
                activeMethod === item.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          
          {activeMethod === 'pix' && (
            <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-200">
              <div className="w-48 h-48 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400 relative">
                {pixPaid ? (
                   <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                      <span className="font-semibold text-sm">PIX Confirmado!</span>
                   </div>
                ) : (
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://google.com" alt="QR Code PIX Exemplo" className="w-40 h-40 object-contain rounded-lg" />
                )}
              </div>
              
              <div className="flex flex-col items-center max-w-xs text-center mb-4">
                <p className="text-xs text-slate-500">Expira em {formatTimer(pixTimer)}</p>
              </div>
              
              <div className="flex gap-3">
                {!pixPaid && (
                  <button
                    type="button"
                    onClick={handleSimulatePix}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    Simular Pagamento
                  </button>
                )}
              </div>
            </div>
          )}

          {(activeMethod === 'debit' || activeMethod === 'credit') && (
            <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
              <div className="w-full p-6 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center text-center mb-6">
                <span className={`material-symbols-outlined text-4xl mb-3 ${cardStatus === 'approved' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {cardStatus === 'approved' ? 'check_circle' : 'contactless'}
                </span>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  {cardStatus === 'waiting' ? 'Aproxime ou insira o cartão' : cardStatus === 'processing' ? 'Processando...' : 'Pagamento Aprovado'}
                </h3>
                <p className="text-xs text-slate-500">
                  {cardStatus === 'approved' ? `Aut: #${cardAuthCode}` : `Valor: R$ ${total.toFixed(2).replace('.', ',')}`}
                </p>
              </div>

              {activeMethod === 'credit' && cardStatus !== 'approved' && (
                <div className="w-full mb-6">
                  <label className="text-xs font-semibold text-slate-800 mb-2 block">Número de Parcelas</label>
                  <select 
                    value={selectedInstallment} 
                    onChange={e => setSelectedInstallment(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                  >
                    {[1, 2, 3, 4, 6, 10, 12].map(p => (
                      <option key={p} value={p}>{p}x de R$ {(total / p).toFixed(2).replace('.', ',')}</option>
                    ))}
                  </select>
                </div>
              )}

              {cardStatus !== 'approved' && (
                <button
                  type="button"
                  onClick={handleSimulateCard}
                  disabled={cardStatus === 'processing'}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Simular Maquininha
                </button>
              )}
            </div>
          )}

          {activeMethod === 'cash' && (
            <div className="w-full max-w-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
              
              <div className="w-full mb-8 flex flex-col items-center">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total a ser cobrado</span>
                <span className="text-4xl font-extrabold text-slate-900">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mb-4">
                {/* Valor Recebido */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-800 mb-2 block text-center">Valor Recebido</label>
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    value={receivedCashStr}
                    onChange={handleCashChange}
                    onBlur={handleCashBlur}
                    onKeyDown={handleCashKeyDown}
                    onFocus={(e) => { e.target.select(); setIsCleanInput(true); }}
                    className="w-full h-16 text-center text-3xl font-semibold bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all outline-none"
                  />
                  <p className="text-[10px] text-slate-400 text-center mt-2">Pressione [F5] para valor exato</p>
                </div>

                {/* Troco */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-800 mb-2 block text-center">Troco</label>
                  <div className={`w-full h-16 rounded-xl border flex items-center justify-center ${
                    cashTroco > 0 ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200/60'
                  }`}>
                    <span className={`text-3xl font-bold tracking-tight ${cashTroco > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                      R$ {formatBRL(cashTroco)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'split' && (
            <div className="w-full max-w-lg flex flex-col animate-in fade-in duration-200">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                  placeholder={`Valor (R$ ${remainingToPay.toFixed(2)})`}
                  className="flex-1 h-11 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                />
                <select
                  value={splitMethod}
                  onChange={(e) => setSplitMethod(e.target.value as PaymentMethodType)}
                  className="h-11 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSplitPayment}
                  className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/60">
                    <tr>
                      <th className="p-3 font-medium">Forma de Pagamento</th>
                      <th className="p-3 font-medium text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {splitPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 text-slate-800">{p.methodLabel}</td>
                        <td className="p-3 text-right font-medium text-slate-900">R$ {p.amount.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                    {splitPayments.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-slate-400 text-sm">Nenhuma parcela adicionada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500">Pago: <span className="font-semibold text-slate-800">R$ {totalPaid.toFixed(2).replace('.', ',')}</span></div>
                <div className="text-sm text-slate-500">Restante: <span className="font-semibold text-slate-800">R$ {remainingToPay.toFixed(2).replace('.', ',')}</span></div>
              </div>
            </div>
          )}

        </div>

        <div className="flex flex-col gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">CPF:</span>
              <input
                type="text"
                value={cpfNumber}
                onChange={(e) => setCpfNumber(e.target.value)}
                placeholder="000.000.000-00"
                className="h-9 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm transition-all outline-none w-36"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-6 h-12 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 rounded-xl font-medium text-sm transition-colors"
            >
              Cancelar [ESC]
            </button>
            <button
              type="button"
              onClick={handleConfirmFinalPayment}
              className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Confirmar Pagamento [ENTER]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
