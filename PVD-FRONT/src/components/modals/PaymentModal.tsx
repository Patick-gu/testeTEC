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
  const [receivedCashStr, setReceivedCashStr] = useState<string>('200,00');
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [transmitNfce, setTransmitNfce] = useState<boolean>(true);
  const [printCoupon, setPrintCoupon] = useState<boolean>(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>('');
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
    }
  }, [showPaymentModal, selectedPaymentMethod, customer.cpf, total]);

  // PIX countdown timer
  useEffect(() => {
    if (showPaymentModal && activeMethod === 'pix' && !pixPaid && pixTimer > 0) {
      const t = setInterval(() => setPixTimer((prev) => prev - 1), 1000);
      return () => clearInterval(t);
    }
  }, [showPaymentModal, activeMethod, pixPaid, pixTimer]);

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

  // Calculations for cash
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

    // If it was in initial/clean state (e.g. showing "0,00" or "0")
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
      handleCashBlur();
    }
  };

  // Calculations for split
  const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingToPay = Math.max(0, total - totalPaid);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Simulate TEF Pinpad reading and approval
  const handleSimulateCard = () => {
    setCardStatus('processing');
    playBeep('scan');

    setTimeout(() => {
      setCardStatus('approved');
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setCardAuthCode(code);
      playBeep('success');
      showToast(
        `${activeMethod === 'debit' ? 'Débito' : 'Crédito'} Aprovado na maquininha! Aut: #${code}`
      );
    }, 1800);
  };

  // Simulate PIX approval
  const handleSimulatePix = () => {
    setPixPaid(true);
    playBeep('success');
    showToast('PIX confirmado e compensado pelo PSP Banco Central!');
  };

  const handleAddSplitPayment = () => {
    const amt = parseFloat(splitAmount.replace(',', '.')) || 0;
    if (amt <= 0) return;

    const label =
      splitMethod === 'cash'
        ? 'Dinheiro'
        : splitMethod === 'pix'
        ? 'PIX'
        : splitMethod === 'debit'
        ? 'Débito'
        : 'Crédito';

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
    // If card is waiting, auto-approve upon enter so cashier isn't blocked
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
      finalPayments =
        splitPayments.length > 0
          ? splitPayments
          : [
              {
                id: `pay-${Date.now()}`,
                method: 'cash',
                methodLabel: 'Dinheiro',
                detail: 'Valor Integral',
                amount: total
              }
            ];
    } else {
      const label =
        activeMethod === 'cash'
          ? 'Dinheiro'
          : activeMethod === 'pix'
          ? 'PIX Dinâmico'
          : activeMethod === 'debit'
          ? 'Débito TEF'
          : `Crédito TEF (${selectedInstallment}x)`;

      finalPayments = [
        {
          id: `pay-${Date.now()}`,
          method: activeMethod,
          methodLabel: label,
          detail: 'Valor Integral',
          amount: total
        }
      ];
    }

    completeSale(finalPayments, activeMethod === 'cash' ? cashTroco : 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        
        {/* Top Header of Payment Modal */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl font-bold">payments</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Fechamento de Venda #{saleNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono-num font-bold">
                  {cart.length} ITENS
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Cliente: <strong className="text-slate-200">{cpfNumber ? `CPF ${cpfNumber}` : customer.name}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono-num text-slate-400 uppercase tracking-wider font-semibold">
                Total a Pagar
              </div>
              <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                R$ {total.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-9 h-9 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              title="Fechar [ESC]"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Method Selection Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'cash', label: 'Dinheiro', num: '1', icon: 'payments' },
            { id: 'pix', label: 'PIX Dinâmico', num: '2', icon: 'qr_code_2' },
            { id: 'debit', label: 'Cartão de Débito (TEF)', num: '3', icon: 'credit_card' },
            { id: 'credit', label: 'Cartão de Crédito (TEF)', num: '4', icon: 'credit_score' },
            { id: 'split', label: 'Misto / Dividir', num: '5', icon: 'call_split' }
          ].map((item) => {
            const isSelected = activeMethod === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMethod(item.id as PaymentMethodType)}
                className={`px-3.5 py-2 rounded-lg font-mono-num text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#004ac6] text-white shadow-sm'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.num}
                </span>
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Center Stage */}
        <div className="p-6 bg-white flex flex-col items-center justify-center min-h-[380px]">
          
          {/* ==================== 1. PIX MODE: QR CODE NO CENTRO DA TELA ==================== */}
          {activeMethod === 'pix' && (
            <div className="w-full flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono-num uppercase font-bold text-emerald-700 tracking-wider">
                  PIX DINÂMICO BANCO CENTRAL
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Aponte a Câmera ou Copie o Código PIX
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                O pagamento será identificado e aprovado automaticamente pelo sistema assim que compensado.
              </p>

              {/* Large Centered QR Code Box */}
              <div className="relative p-5 bg-white border-2 border-emerald-400 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all hover:border-emerald-500">
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Outer finders */}
                    <rect x="4" y="4" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="8" y="8" width="20" height="20" rx="1" fill="#ffffff" />
                    <rect x="12" y="12" width="12" height="12" fill="#0f172a" />

                    <rect x="68" y="4" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="72" y="8" width="20" height="20" rx="1" fill="#ffffff" />
                    <rect x="76" y="12" width="12" height="12" fill="#0f172a" />

                    <rect x="4" y="68" width="28" height="28" rx="3" fill="#0f172a" />
                    <rect x="8" y="72" width="20" height="20" rx="1" fill="#ffffff" />
                    <rect x="12" y="76" width="12" height="12" fill="#0f172a" />

                    {/* Data matrix blocks */}
                    <rect x="36" y="8" width="8" height="12" fill="#0f172a" />
                    <rect x="48" y="8" width="14" height="6" fill="#0f172a" />
                    <rect x="36" y="24" width="10" height="8" fill="#0f172a" />
                    <rect x="52" y="20" width="8" height="16" fill="#0f172a" />
                    <rect x="8" y="38" width="16" height="8" fill="#0f172a" />
                    <rect x="28" y="38" width="18" height="18" fill="#0f172a" />
                    <rect x="50" y="38" width="10" height="10" fill="#0f172a" />
                    <rect x="66" y="38" width="24" height="8" fill="#0f172a" />
                    <rect x="38" y="58" width="12" height="16" fill="#0f172a" />
                    <rect x="54" y="52" width="8" height="14" fill="#0f172a" />
                    <rect x="66" y="52" width="10" height="24" fill="#0f172a" />
                    <rect x="80" y="52" width="12" height="10" fill="#0f172a" />
                    <rect x="36" y="78" width="20" height="14" fill="#0f172a" />
                    <rect x="62" y="80" width="14" height="10" fill="#0f172a" />
                    <rect x="80" y="68" width="12" height="24" fill="#0f172a" />
                  </svg>

                  {/* Center PIX icon emblem */}
                  <div className="absolute inset-0 m-auto w-11 h-11 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl font-bold">
                      qr_code_2
                    </span>
                  </div>

                  {/* Paid overlay */}
                  {pixPaid && (
                    <div className="absolute inset-0 bg-emerald-600/90 rounded-xl flex flex-col items-center justify-center text-white animate-in zoom-in-90 duration-200">
                      <span className="material-symbols-outlined text-5xl font-bold mb-1">
                        check_circle
                      </span>
                      <span className="text-sm font-bold font-mono-num">PIX CONFIRMADO!</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between w-full px-1">
                  <span className="text-xs font-mono-num font-bold text-slate-700">
                    Valor: R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] font-mono-num text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Expira em {formatTimer(pixTimer)}
                  </span>
                </div>
              </div>

              {/* PIX copy/paste & simulate action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg w-full">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      '00020126580014br.gov.bcb.pix0136e4b88921-992a-4f40-b198-100234520400005303986'
                    );
                    playBeep('scan');
                    showToast('Código PIX copiado para a área de transferência!');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base text-slate-600">content_copy</span>
                  Copiar Código PIX (Copia e Cola)
                </button>

                {!pixPaid ? (
                  <button
                    type="button"
                    onClick={handleSimulatePix}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">bolt</span>
                    Simular Pagamento do Cliente
                  </button>
                ) : (
                  <span className="px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-mono-num font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">verified</span>
                    Compensação Instantânea Concluída
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ==================== 2. CARTÃO (DÉBITO OU CRÉDITO): ESPERAR RESPOSTA DA MAQUININHA ==================== */}
          {(activeMethod === 'debit' || activeMethod === 'credit') && (
            <div className="w-full flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
              
              {/* Status Header */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cardStatus === 'approved'
                      ? 'bg-emerald-500'
                      : cardStatus === 'processing'
                      ? 'bg-blue-500 animate-spin'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                ></span>
                <span className="text-xs font-mono-num uppercase font-bold text-slate-700 tracking-wider">
                  INTEGRAÇÃO TEF STONE PINPAD 9210-SP
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                {cardStatus === 'waiting'
                  ? `Aguardando Resposta da Maquininha (${activeMethod === 'debit' ? 'Débito' : 'Crédito'})`
                  : cardStatus === 'processing'
                  ? 'Processando com a Rede Adquirente...'
                  : 'Transação Aprovada pela Operadora!'}
              </h3>

              <p className="text-xs text-slate-500 max-w-md mb-4">
                {cardStatus === 'waiting'
                  ? 'Peça ao cliente para aproximar o cartão/celular (NFC) ou inserir o chip na maquininha.'
                  : cardStatus === 'processing'
                  ? 'Lendo trilha e validando criptografia do chip EMV. Não remova o cartão...'
                  : `Comprovante TEF emitido sob autorização Stone #${cardAuthCode}.`}
              </p>

              {/* Central Maquininha Graphic & Simulation Stage */}
              <div className="relative p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl max-w-md w-full flex flex-col items-center justify-center gap-4 shadow-sm">
                
                <div className="flex items-center gap-4 w-full justify-center">
                  {/* Photo of Pinpad hardware */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-300 shadow-md">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1P2FQGpS60Wn9g8ExepHsOmVTXQstmFUnms4W0PscJTtoaTiSwxSZc3VLyooEAZi9G87JvSUnO4MuE2y6E_U7tgS6ojcV_iapCOqoxNGGT_fM0ff-PxFZE8atDgV-I6OrcX5vF5ueo7iXeCSnyMo42J5B5XlH7ujJCWpubgvJK2RMDshRS8XqMs4SWU6jFLKL7ezSm6JXIG_pBxNRW-OxEK_THwdKbJM-gfMvmYRN5KDpkft04n1c"
                      alt="PINPad Maquininha"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Maquininha LED Screen Representation */}
                  <div className="flex-1 bg-[#0f172a] text-emerald-400 p-3 rounded-xl border-2 border-slate-700 font-mono-num text-left shadow-inner flex flex-col justify-between min-h-[80px]">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1">
                      <span>STONE TEF v3.4</span>
                      <span className="text-emerald-500 font-bold">ONLINE</span>
                    </div>

                    <div className="text-xs font-bold text-white mt-1">
                      {cardStatus === 'waiting' && 'INSIRA OU APROXIME'}
                      {cardStatus === 'processing' && 'LENDO CHIP / SENHA...'}
                      {cardStatus === 'approved' && 'TRANSACAO AUTORIZADA'}
                    </div>

                    <div className="text-sm font-extrabold text-emerald-400">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {/* Animated visual state */}
                {cardStatus === 'waiting' && (
                  <div className="flex items-center gap-3 text-blue-700 py-1">
                    <span className="material-symbols-outlined text-4xl animate-bounce">
                      contactless
                    </span>
                    <span className="text-xs font-mono-num font-bold text-slate-700">
                      Aproxime no visor ou insira no leitor de chip
                    </span>
                  </div>
                )}

                {cardStatus === 'processing' && (
                  <div className="flex items-center gap-3 text-amber-600 py-2">
                    <span className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-xs font-mono-num font-bold text-slate-800">
                      Comunicando com adquirente Stone...
                    </span>
                  </div>
                )}

                {cardStatus === 'approved' && (
                  <div className="flex items-center gap-2 text-emerald-700 py-1 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg w-full justify-center">
                    <span className="material-symbols-outlined text-2xl text-emerald-600 font-bold">
                      check_circle
                    </span>
                    <div className="text-left font-mono-num">
                      <div className="text-xs font-bold text-emerald-800">AUTORIZAÇÃO APROVADA</div>
                      <div className="text-[10px] text-slate-500">NSU: 90281 • AUT: #{cardAuthCode}</div>
                    </div>
                  </div>
                )}

                {/* Installments for credit card */}
                {activeMethod === 'credit' && cardStatus !== 'approved' && (
                  <div className="w-full text-left pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-mono-num font-bold text-slate-600 uppercase block mb-1.5">
                      Número de Parcelas:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4, 6, 10, 12].map((parcels) => {
                        const parcelVal = (total / parcels).toFixed(2).replace('.', ',');
                        const isSelected = selectedInstallment === parcels;
                        return (
                          <button
                            key={parcels}
                            type="button"
                            onClick={() => setSelectedInstallment(parcels)}
                            className={`p-1.5 rounded text-xs font-mono-num text-left border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <div>{parcels}x</div>
                            <div className="text-[11px] opacity-90">R$ {parcelVal}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Simulate Button */}
                {cardStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={handleSimulateCard}
                    disabled={cardStatus === 'processing'}
                    className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono-num text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    <span>Simular Resposta da Maquininha (Aproximar Cartão)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. DINHEIRO MODE ==================== */}
          {activeMethod === 'cash' && (
            <div className="w-full flex flex-col items-center justify-center text-center animate-in fade-in duration-200 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-600 text-xl font-bold">
                  payments
                </span>
                <span className="text-xs font-mono-num uppercase font-bold text-emerald-700 tracking-wider">
                  PAGAMENTO EM DINHEIRO
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Informe o Valor Recebido em Cédulas
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Total da compra: <strong className="text-slate-900 font-mono-num text-sm">R$ {formatBRL(total)}</strong>
              </p>

              <div className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
                
                {/* Formatted Cash Input */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center justify-between w-full max-w-sm px-1">
                    <label className="text-[11px] font-mono-num font-bold text-slate-700 uppercase tracking-wider">
                      VALOR RECEBIDO EM DINHEIRO
                    </label>
                    <span className="text-[10px] font-mono-num text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      R$ {formatBRL(receivedCash)}
                    </span>
                  </div>

                  <div className="w-full max-w-sm bg-white border-2 border-slate-300 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-100 rounded-2xl h-16 px-4 shadow-inner flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold font-mono-num text-emerald-600 select-none">
                        R$
                      </span>
                      <input
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        value={receivedCashStr}
                        onChange={handleCashChange}
                        onBlur={handleCashBlur}
                        onKeyDown={handleCashKeyDown}
                        onFocus={(e) => {
                          e.target.select();
                          setIsCleanInput(true);
                        }}
                        placeholder="0,00"
                        className="w-48 bg-transparent text-slate-900 text-3xl font-mono-num font-extrabold text-left focus:outline-none tracking-tight"
                      />
                    </div>
                    {receivedCashStr && receivedCashStr !== '0,00' && (
                      <button
                        type="button"
                        onClick={handleClearCash}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Zerar campo"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] font-mono-num text-slate-500">
                    Pressione [F5] para valor exato ou digite o montante
                  </span>
                </div>

                {/* Troco Result Card */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    cashTroco > 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : receivedCash === total
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        cashTroco > 0
                          ? 'bg-emerald-600'
                          : receivedCash === total
                          ? 'bg-slate-700'
                          : 'bg-rose-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {cashTroco > 0
                          ? 'currency_exchange'
                          : receivedCash === total
                          ? 'check'
                          : 'warning'}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-mono-num uppercase font-bold text-slate-600 block">
                        {receivedCash < total ? 'Valor Insuficiente' : 'Troco a Devolver'}
                      </span>
                      <div
                        className={`text-3xl font-extrabold font-mono-num tracking-tight ${
                          cashTroco > 0
                            ? 'text-emerald-700'
                            : receivedCash === total
                            ? 'text-slate-800'
                            : 'text-rose-600'
                        }`}
                      >
                        R$ {formatBRL(cashTroco)}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 4. MISTO / DIVIDIR MODE ==================== */}
          {activeMethod === 'split' && (
            <div className="w-full flex flex-col items-center justify-center text-center animate-in fade-in duration-200 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-600 text-xl font-bold">
                  call_split
                </span>
                <span className="text-xs font-mono-num uppercase font-bold text-blue-700 tracking-wider">
                  DIVIDIR PAGAMENTO
                </span>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder={`Valor (R$ ${remainingToPay.toFixed(2)})`}
                    className="bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-900 font-mono-num text-xs focus:outline-none focus:border-blue-600"
                  />

                  <select
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value as PaymentMethodType)}
                    className="bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="cash">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="debit">Débito TEF</option>
                    <option value="credit">Crédito TEF</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSplitPayment}
                    className="bg-blue-600 text-white text-xs font-bold rounded-lg px-3 py-2 hover:bg-blue-700"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs font-mono-num">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2">Forma</th>
                        <th className="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {splitPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2 font-semibold text-slate-800">{p.methodLabel}</td>
                          <td className="p-2 text-right font-bold text-slate-900">
                            R$ {p.amount.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      ))}
                      {splitPayments.length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-3 text-center text-slate-400">
                            Nenhuma parcela adicionada ainda
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between text-xs font-mono-num pt-1">
                  <span>Pago: <strong>R$ {totalPaid.toFixed(2).replace('.', ',')}</strong></span>
                  <span className="text-rose-600 font-bold">
                    Restante: R$ {remainingToPay.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Fiscal Options Strip */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transmitNfce}
                onChange={(e) => setTransmitNfce(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300"
              />
              <span className="font-medium text-slate-800">Transmitir NFC-e</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={printCoupon}
                onChange={(e) => setPrintCoupon(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300"
              />
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir Cupom [F12]
              </span>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-mono-num text-slate-500 font-semibold">CPF na Nota:</span>
            <input
              type="text"
              value={cpfNumber}
              onChange={(e) => setCpfNumber(e.target.value)}
              placeholder="000.000.000-00"
              className="bg-white border border-slate-300 px-2.5 py-1 rounded text-slate-900 font-mono-num text-xs w-36 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPaymentModal(false)}
            className="h-12 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono-num text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>VOLTAR [ESC]</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmFinalPayment}
            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono-num text-xs font-bold flex items-center justify-between px-5 transition-all shadow-md hover:shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span className="text-sm font-extrabold uppercase">
                Confirmar Pagamento e Emitir Cupom Fiscal
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-white text-emerald-700 text-xs font-bold shadow-xs">
              [ENTER]
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
