import os

# Create UIContext.tsx
ui_context = """import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types/pdv';

interface UIContextType {
  activeTab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe';
  setActiveTab: (tab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  showPrintPromptModal: boolean;
  setShowPrintPromptModal: (show: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  showCpfPromptModal: boolean;
  setShowCpfPromptModal: (show: boolean) => void;
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  showCustomerModal: boolean;
  setShowCustomerModal: (show: boolean) => void;
  showScaleModal: boolean;
  setShowScaleModal: (show: boolean) => void;
  weighingProduct: Product | null;
  setWeighingProduct: (prod: Product | null) => void;
  scaleWeight: number;
  setScaleWeight: (w: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe'>('terminal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showPrintPromptModal, setShowPrintPromptModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showCpfPromptModal, setShowCpfPromptModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
  
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [scaleWeight, setScaleWeight] = useState<number>(0.000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  return (
    <UIContext.Provider
      value={{
        activeTab, setActiveTab,
        toastMessage, showToast,
        showReceiptModal, setShowReceiptModal,
        showPrintPromptModal, setShowPrintPromptModal,
        showPaymentModal, setShowPaymentModal,
        showCpfPromptModal, setShowCpfPromptModal,
        showHelpModal, setShowHelpModal,
        showCustomerModal, setShowCustomerModal,
        showScaleModal, setShowScaleModal,
        weighingProduct, setWeighingProduct,
        scaleWeight, setScaleWeight
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
"""

with open("src/context/UIContext.tsx", "w") as f:
    f.write(ui_context)

# CartContext.tsx
cart_context = """import React, { createContext, useContext, useState } from 'react';
import { Product, CartItem } from '../types/pdv';
import { playBeep } from '../utils/audio';
import { useUI } from './UIContext';

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  totalQuantity: number;
  lastScannedItem: CartItem | null;
  quantityMultiplier: number;
  setQuantityMultiplier: (qty: number) => void;
  addProductToCart: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useUI();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantityMultiplier, setQuantityMultiplier] = useState<number>(1);

  const subtotal = Number(cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0).toFixed(2));
  const netTotal = Number(cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const discount = Number(Math.max(0, subtotal - netTotal).toFixed(2));
  const addition = 0.00;
  const total = Number((subtotal - discount + addition).toFixed(2));
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lastScannedItem = cart.length > 0 ? cart[cart.length - 1] : null;

  const addProductToCart = (product: Product, quantity?: number) => {
    const qty = quantity || quantityMultiplier || 1;
    playBeep('scan');

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = Number((current.quantity + qty).toFixed(3));
        
        let finalUnitPrice = current.product.price;
        if (current.product.wholesale_min_quantity && newQty >= current.product.wholesale_min_quantity) {
          finalUnitPrice = current.product.wholesale_price || finalUnitPrice;
        }

        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          unitPrice: finalUnitPrice,
          subtotal: Number((newQty * finalUnitPrice).toFixed(2)),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false })
        };
        const [moved] = updated.splice(existingIndex, 1);
        return [...updated, moved];
      } else {
        let finalUnitPrice = product.price;
        if (product.wholesale_min_quantity && qty >= product.wholesale_min_quantity) {
          finalUnitPrice = product.wholesale_price || finalUnitPrice;
        }

        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: qty,
          unitPrice: finalUnitPrice,
          subtotal: Number((qty * finalUnitPrice).toFixed(2)),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false })
        };
        return [...prev, newItem];
      }
    });

    setQuantityMultiplier(1);
    showToast(`1x ${product.name} registrado no caixa`);
  };

  const removeItem = (itemId: string) => {
    playBeep('scan');
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removido da venda');
  };

  const updateItemQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const p = item.product;
        const unitPrice =
          p.wholesale_min_quantity && p.wholesale_price && newQty >= p.wholesale_min_quantity
            ? p.wholesale_price
            : p.price;
        return {
          ...item,
          quantity: newQty,
          unitPrice,
          subtotal: Number((newQty * unitPrice).toFixed(2))
        };
      })
    );
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setCart([]);
      playBeep('drawer');
      showToast('Venda cancelada / Limpa');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart, setCart,
        subtotal, discount, addition, total, totalQuantity, lastScannedItem,
        quantityMultiplier, setQuantityMultiplier,
        addProductToCart, removeItem, updateItemQuantity, clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
"""
with open("src/context/CartContext.tsx", "w") as f:
    f.write(cart_context)

cashflow_context = """import React, { createContext, useContext, useState, useEffect } from 'react';
import { CashMovementRecord } from '../types/pdv';
import { CashflowService } from '../api/cashflow';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { playBeep } from '../utils/audio';

interface CashflowContextType {
  cashDrawer: {
    openedAt: string;
    openingFund: number;
    totalSales: number;
    salesCount: number;
    cashInDrawer: number;
    pixTotal: number;
    cardDebit: number;
    cardCredit: number;
    movements: CashMovementRecord[];
  };
  setCashDrawer: React.Dispatch<React.SetStateAction<any>>;
  addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string, auth?: string, targetTurnoId?: string) => Promise<boolean>;
  closeTurno: (blindCount: number) => Promise<boolean>;
}

const CashflowContext = createContext<CashflowContextType | undefined>(undefined);

export const CashflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { showToast } = useUI();
  
  const [cashDrawer, setCashDrawer] = useState({
    openedAt: '',
    openingFund: 0,
    totalSales: 0,
    salesCount: 0,
    cashInDrawer: 0,
    pixTotal: 0,
    cardDebit: 0,
    cardCredit: 0,
    movements: [] as CashMovementRecord[]
  });

  useEffect(() => {
    if (!token) return;
    CashflowService.getMovements()
    .then((data: any[]) => {
      if (Array.isArray(data)) {
        const mappedMovements = data.map(item => {
          const time = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : '';
          return {
            id: item.id,
            time: time,
            type: item.type,
            paymentMethod: item.payment_method,
            title: item.type === 'sangria' ? 'Sangria de Caixa' : item.type === 'suprimento' ? 'Suprimento' : item.type === 'entrada' ? 'Venda PDV' : 'Abertura',
            documentRef: `Recibo ${item.type === 'sangria' ? 'SG' : item.type === 'suprimento' ? 'SP' : 'VD'}-${item.id.substring(0,4)}`,
            reason: item.descricao,
            operator: user?.name || 'Sistema',
            authorizer: user?.role === 'admin' ? 'Supervisor' : 'Operador',
            amount: Number(item.valor)
          };
        });
        setCashDrawer(prev => ({ ...prev, movements: mappedMovements }));
      }
    })
    .catch(err => console.error("Erro ao buscar movimentações", err));

    CashflowService.getStatus()
    .then((data: any) => {
      if (data && typeof data.totalSales !== 'undefined') {
        setCashDrawer(prev => ({
          ...prev,
          openedAt: data.openedAt || '',
          openingFund: data.openingFund,
          totalSales: data.totalSales,
          salesCount: data.salesCount,
          cashInDrawer: data.cashInDrawer,
          pixTotal: data.pixTotal,
          cardDebit: data.cardDebit,
          cardCredit: data.cardCredit
        }));
      }
    })
    .catch(err => console.error("Erro ao buscar status do caixa", err));
  }, [token, user]);

  const addCashMovement = async (type: 'sangria' | 'suprimento', amount: number, reason: string, auth?: string, targetTurnoId?: string) => {
    try {
      const isSangria = type === 'sangria';
      const payload: any = {
        type: type,
        valor: amount,
        descricao: reason || (isSangria ? 'Transferência de segurança para Cofre' : 'Reforço de Troco Miúdo')
      };
      if (targetTurnoId) payload.turno_id = targetTurnoId;

      const data = await CashflowService.createMovement(payload);
      const item = data.data;
      const nowStr = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : new Date().toLocaleTimeString('pt-BR', { hour12: false });
      
      const newMovement: CashMovementRecord = {
        id: item.id || `mov-${Date.now()}`,
        time: nowStr,
        type,
        title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
        documentRef: `Recibo ${isSangria ? 'SG' : 'SP'}-${item.id ? item.id.substring(0,4) : Math.floor(1000 + Math.random() * 9000)}`,
        reason: item.descricao || payload.descricao,
        operator: user?.name || 'Sistema',
        authorizer: user?.role === 'admin' ? 'Supervisor' : 'Operador',
        amount: Number(item.valor || amount)
      };

      setCashDrawer((prev) => {
        const newCash = isSangria ? prev.cashInDrawer - amount : prev.cashInDrawer + amount;
        return {
          ...prev,
          cashInDrawer: Number(newCash.toFixed(2)),
          movements: [newMovement, ...prev.movements]
        };
      });

      playBeep('drawer');
      showToast(`${isSangria ? 'Sangria' : 'Suprimento'} de R$ ${amount.toFixed(2).replace('.', ',')} efetuado com sucesso!`);
      return true;
    } catch (err: any) {
      if (err.response?.data) {
        showToast(`Erro: ${err.response.data.erro || 'Falha ao registrar movimentação'}`);
      } else {
        showToast('Erro de conexão ao registrar movimentação.');
      }
      return false;
    }
  };

  const closeTurno = async (blindCount: number) => {
    try {
      await CashflowService.closeShift({ valor_fechamento_informado: blindCount });
      playBeep('success');
      showToast('Turno encerrado com sucesso. Redução Z emitida.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      return true;
    } catch (err: any) {
      if (err.response?.data) {
        showToast(err.response.data.error || 'Erro ao fechar caixa');
      } else {
        showToast('Erro de conexão ao fechar o caixa.');
      }
      return false;
    }
  };

  return (
    <CashflowContext.Provider value={{ cashDrawer, setCashDrawer, addCashMovement, closeTurno }}>
      {children}
    </CashflowContext.Provider>
  );
};

export const useCashflow = () => {
  const context = useContext(CashflowContext);
  if (!context) throw new Error('useCashflow must be used within a CashflowProvider');
  return context;
};
"""
with open("src/context/CashflowContext.tsx", "w") as f:
    f.write(cashflow_context)

sale_context = """import React, { createContext, useContext, useState, useEffect } from 'react';
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
"""
with open("src/context/SaleContext.tsx", "w") as f:
    f.write(sale_context)

index_context = """export * from './UIContext';
export * from './CartContext';
export * from './CashflowContext';
export * from './SaleContext';
export * from './AuthContext';

import React from 'react';
import { UIProvider } from './UIContext';
import { CartProvider } from './CartContext';
import { CashflowProvider } from './CashflowContext';
import { SaleProvider } from './SaleContext';

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <CartProvider>
        <CashflowProvider>
          <SaleProvider>
            {children}
          </SaleProvider>
        </CashflowProvider>
      </CartProvider>
    </UIProvider>
  );
};
"""
with open("src/context/index.ts", "w") as f:
    f.write(index_context)
