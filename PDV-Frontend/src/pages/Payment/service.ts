import React, { useState, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';
import { PaymentMethodType, AppliedPayment } from '../../types/pdv';
import { playBeep } from '../../utils/audio';

export const usePaymentService = () => {
  const {
    total,
    cart,
    totalQuantity,
    saleNumber,
    customer,
    setCustomer,
    setActiveTab,
    completeSale,
    setShowCustomerModal
  } = usePdv();

  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>(() => {
    const saved = sessionStorage.getItem('selected_payment_method');
    if (saved && ['cash', 'pix', 'debit', 'credit', 'split'].includes(saved)) {
      sessionStorage.removeItem('selected_payment_method');
      return saved as PaymentMethodType;
    }
    return 'cash';
  });

  const [receivedCashStr, setReceivedCashStr] = useState<string>('0,00');
  const [isCleanInput, setIsCleanInput] = useState<boolean>(true);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [transmitNfce, setTransmitNfce] = useState<boolean>(true);
  const [printCoupon, setPrintCoupon] = useState<boolean>(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>('');
  const [cpfNumber, setCpfNumber] = useState<string>(customer.cpf || '');

  // Split payments list
  const [appliedPayments, setAppliedPayments] = useState<AppliedPayment[]>([]);

  // Split entry fields
  const [splitAmount, setSplitAmount] = useState<string>('');
  const [splitMethod, setSplitMethod] = useState<PaymentMethodType>('credit');

  // Simulated PIX state
  const [pixPaid, setPixPaid] = useState<boolean>(false);
  const [pixTimer, setPixTimer] = useState<number>(292); // ~4m52s

  // Initialize applied payments with full amount in default active method
  useEffect(() => {
    if (activeMethod !== 'split') {
      const label =
        activeMethod === 'cash'
          ? 'Dinheiro'
          : activeMethod === 'pix'
          ? 'PIX Dinâmico'
          : activeMethod === 'debit'
          ? 'Débito TEF'
          : 'Crédito TEF';

      setAppliedPayments([
        {
          id: 'pay-default',
          method: activeMethod,
          methodLabel: label,
          detail: 'Valor Integral',
          amount: total
        }
      ]);
    }
  }, [activeMethod, total]);

  // PIX countdown timer
  useEffect(() => {
    if (activeMethod === 'pix' && pixTimer > 0) {
      const t = setInterval(() => setPixTimer((prev) => prev - 1), 1000);
      return () => clearInterval(t);
    }
  }, [activeMethod, pixTimer]);

  // Format and Parse BRL
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

  // Calculate Cash Change (Troco)
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
    if (e.key === 'F7') {
      e.preventDefault();
      handleExactCash();
    } else if (e.key === 'Enter') {
      handleCashBlur();
    }
  };

  // Split calculation
  const totalPaid = appliedPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingToPay = Math.max(0, total - totalPaid);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSetCashValue = (val: number) => {
    setReceivedCashStr(val.toFixed(2).replace('.', ','));
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
      detail: `Parcela ${appliedPayments.length + 1}`,
      amount: amt
    };

    setAppliedPayments((prev) => [...prev, newPayment]);
    setSplitAmount('');
  };

  const handleRemovePayment = (id: string) => {
    setAppliedPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirmCheckout = () => {
    if (appliedPayments.length === 0) {
      // Create payment for current active method
      const finalPayments: AppliedPayment[] = [
        {
          id: `pay-${Date.now()}`,
          method: activeMethod,
          methodLabel: activeMethod === 'cash' ? 'Dinheiro' : activeMethod === 'pix' ? 'PIX' : 'Cartão TEF',
          detail: 'Valor Integral',
          amount: total
        }
      ];
      completeSale(finalPayments, activeMethod === 'cash' ? cashTroco : 0);
    } else {
      completeSale(appliedPayments, activeMethod === 'cash' ? cashTroco : 0);
    }
  };


  return {
    total,
    cart,
    totalQuantity,
    saleNumber,
    customer,
    setCustomer,
    setActiveTab,
    completeSale,
    setShowCustomerModal,
    activeMethod,
    setActiveMethod,
    receivedCashStr,
    setReceivedCashStr,
    isCleanInput,
    setIsCleanInput,
    selectedInstallment,
    setSelectedInstallment,
    transmitNfce,
    setTransmitNfce,
    printCoupon,
    setPrintCoupon,
    whatsAppNumber,
    setWhatsAppNumber,
    cpfNumber,
    setCpfNumber,
    appliedPayments,
    setAppliedPayments,
    splitAmount,
    setSplitAmount,
    splitMethod,
    setSplitMethod,
    pixPaid,
    setPixPaid,
    pixTimer,
    setPixTimer,
    parseBRLToNumber,
    formatBRL,
    receivedCash,
    cashTroco,
    handleCashChange,
    handleCashBlur,
    handleExactCash,
    handleClearCash,
    handleCashKeyDown,
    totalPaid,
    remainingToPay,
    formatTimer,
    handleSetCashValue,
    handleAddSplitPayment,
    handleRemovePayment,
    handleConfirmCheckout
  };
};
