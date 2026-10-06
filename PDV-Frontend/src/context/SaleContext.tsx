import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, AppliedPayment, PaymentMethodType, ParkedSale, CompletedSale } from '../types/pdv';
import { SaleService } from '../api/sales';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { useCart } from './CartContext';
import { useCashflow } from './CashflowContext';
import { playBeep } from '../utils/audio';

interface SaleContextType {
  saleNumber: string;
  customer: { cpf: string; name: string };
  setCustomer: React.Dispatch<React.SetStateAction<{ cpf: string; name: string }>>;
  parkedSales: ParkedSale[];
  parkCurrentSale: () => void;
  restoreParkedSale: (parkId: string) => void;
  completeSale: (payments: AppliedPayment[], troco: number) => Promise<void>;
  recentReceipt: CompletedSale | null;
  selectedPaymentMethod: PaymentMethodType;
  setSelectedPaymentMethod: (method: PaymentMethodType) => void;
  openPaymentModal: (method?: PaymentMethodType) => void;
  startCheckout: (method?: PaymentMethodType) => void;
  proceedToPayment: (cpf?: string) => void;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, showToast, setShowCpfPromptModal, setShowPaymentModal, setShowPrintPromptModal, showCpfPromptModal, showPaymentModal, showHelpModal, showCustomerModal, showScaleModal, showReceiptModal, showPrintPromptModal: isPrintPrompt, setShowHelpModal, setShowCustomerModal, setShowScaleModal, setShowReceiptModal } = useUI();
  const { cart, setCart, total, subtotal, discount } = useCart();
  const { setCashDrawer } = useCashflow();

  const [saleNumber, setSaleNumber] = useState<string>('04928');
  const [customer, setCustomer] = useState<{ cpf: string; name: string }>({
    cpf: '',
    name: 'Consumidor Final (CPF não informado)'
  });
  const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
  const [recentReceipt, setRecentReceipt] = useState<CompletedSale | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('cash');
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethodType>('cash');

  const parkCurrentSale = () => {
    if (cart.length === 0) return;
    const parked: ParkedSale = {
      id: `park-${Date.now()}`,
      code: `ESP-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      items: [...cart],
      customerCpf: customer.cpf,
      total
    };
    setParkedSales((prev) => [parked, ...prev]);
    setCart([]);
    setSaleNumber(String(Number(saleNumber) + 1).padStart(5, '0'));
    playBeep('drawer');
    showToast(`Venda colocada em espera (${parked.code})`);
  };

  const restoreParkedSale = (parkId: string) => {
    const found = parkedSales.find((p) => p.id === parkId);
    if (!found) return;
    setCart(found.items);
    setParkedSales((prev) => prev.filter((p) => p.id !== parkId));
    playBeep('scan');
    showToast(`Venda ${found.code} reaberta no caixa`);
  };

  const startCheckout = (method: PaymentMethodType = 'cash') => {
    if (cart.length === 0) {
      showToast('Adicione produtos para fechar a venda');
      return;
    }
    setPendingPaymentMethod(method);
    setShowCpfPromptModal(true);
  };

  const proceedToPayment = (enteredCpf?: string) => {
    setShowCpfPromptModal(false);
    if (enteredCpf && enteredCpf.trim()) {
      setCustomer({
        cpf: enteredCpf.trim(),
        name: `Consumidor (CPF ${enteredCpf.trim()})`
      });
      showToast(`CPF vinculado: ${enteredCpf.trim()}`);
    } else {
      setCustomer({
        cpf: '',
        name: 'Consumidor Final (CPF não informado)'
      });
    }
    setSelectedPaymentMethod(pendingPaymentMethod);
    setShowPaymentModal(true);
  };

  const openPaymentModal = (method: PaymentMethodType = 'cash') => {
    if (cart.length === 0) {
      showToast('Adicione produtos para fechar a venda');
      return;
    }
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const completeSale = async (payments: AppliedPayment[], troco: number) => {
    try {
      const pMethod = payments[0]?.method;
      const paymentMethodStr = pMethod === 'credit' ? 'credit_card' : pMethod === 'debit' ? 'debit_card' : pMethod || 'cash';
      
      const payload: any = {
        payment_method: paymentMethodStr,
        items: cart.map(item => ({
          produto_id: item.product.id,
          quantity: item.quantity
        }))
      };

      if (paymentMethodStr === 'cash') {
        payload.amount_paid = total + troco;
      }

      await SaleService.create(payload);

      const saleTotal = total;
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const dateStr = new Date().toLocaleDateString('pt-BR');

      setCashDrawer((prev: any) => {
        let addCash = 0;
        let addPix = 0;
        let addDebit = 0;
        let addCredit = 0;

        payments.forEach((p) => {
          if (p.method === 'cash') addCash += p.amount;
          else if (p.method === 'pix') addPix += p.amount;
          else if (p.method === 'debit') addDebit += p.amount;
          else if (p.method === 'credit') addCredit += p.amount;
        });

        return {
          ...prev,
          totalSales: Number((prev.totalSales + saleTotal).toFixed(2)),
          salesCount: prev.salesCount + 1,
          cashInDrawer: Number((prev.cashInDrawer + addCash).toFixed(2)),
          pixTotal: Number((prev.pixTotal + addPix).toFixed(2)),
          cardDebit: Number((prev.cardDebit + addDebit).toFixed(2)),
          cardCredit: Number((prev.cardCredit + addCredit).toFixed(2)),
          movements: [ { id: Math.floor(Math.random() * 100000).toString(), time: nowStr, type: "entrada",
              paymentMethod: paymentMethodStr, title: "Venda PDV", documentRef: "Recibo VD-" + saleNumber, reason: "Venda PDV #" + saleNumber, operator: user?.name || "Operador", authorizer: "Operador", amount: saleTotal }, ...prev.movements ]
        };
      });

      const receipt: CompletedSale = {
        saleNumber: `#${saleNumber}`,
        timestamp: `${dateStr} ${nowStr}`,
        items: [...cart],
        subtotal,
        discount,
        total: saleTotal,
        payments,
        change: troco,
        customerCpf: customer.cpf,
        nfceKey: `3524 1004 8291 0001 5500 1000 0049 2810 ${Math.floor(10000000 + Math.random() * 90000000)}`
      };

      setRecentReceipt(receipt);
      setShowPrintPromptModal(true);
      setShowPaymentModal(false);
      playBeep('success');

      setCart([]);
      setSaleNumber(String(Number(saleNumber) + 1).padStart(5, '0'));
      setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
      setActiveTab('terminal');
      showToast(`Venda #${saleNumber} concluída com sucesso!`);
    } catch (err: any) {
      if (err.response?.data) {
        const errData = err.response.data;
        let errorMsg = errData.erro || errData.message || 'Falha ao processar';
        if (errData.errors) errorMsg = Object.values(errData.errors).flat().join(', ');
        showToast(`Erro na venda: ${errorMsg}`);
      } else {
        showToast('Erro de conexão ao finalizar venda.');
      }
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      if (isInput) return;

      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelpModal(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (user?.role === 'admin') setActiveTab('catalogo');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('caixa');
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (user?.role === 'admin') {
          showToast('Admins não podem fazer vendas. Use um operador.');
          return;
        }
        if (cart.length > 0) {
          startCheckout('cash');
        } else {
          showToast('Adicione produtos para fechar a venda');
        }
      } else if (e.key === 'Escape') {
        if (showCpfPromptModal) setShowCpfPromptModal(false);
        else if (showPaymentModal) setShowPaymentModal(false);
        else if (showHelpModal || showCustomerModal || showScaleModal || showReceiptModal || isPrintPrompt) {
          setShowHelpModal(false);
          setShowCustomerModal(false);
          setShowScaleModal(false);
          setShowReceiptModal(false);
          setShowPrintPromptModal(false);
        } else if (activeTab !== 'terminal') {
          setActiveTab('terminal');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart.length, showCpfPromptModal, showPaymentModal, showHelpModal, showCustomerModal, showScaleModal, showReceiptModal, isPrintPrompt]);

  return (
    <SaleContext.Provider
      value={{
        saleNumber, customer, setCustomer, parkedSales, parkCurrentSale, restoreParkedSale,
        completeSale, recentReceipt, selectedPaymentMethod, setSelectedPaymentMethod,
        openPaymentModal, startCheckout, proceedToPayment
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};

export const useSale = () => {
  const context = useContext(SaleContext);
  if (!context) throw new Error('useSale must be used within a SaleProvider');
  return context;
};
