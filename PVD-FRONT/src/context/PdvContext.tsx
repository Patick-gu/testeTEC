import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, AppliedPayment, PaymentMethodType, CashMovementRecord, ParkedSale, CompletedSale } from '../types/pdv';
import _INITIAL_PRODUCTS from '../JSON/Mock/products.json';
import _INITIAL_CART_ITEMS from '../JSON/Mock/cart.json';
import { playBeep } from '../utils/audio';

const INITIAL_PRODUCTS = _INITIAL_PRODUCTS as Product[];
const INITIAL_CART_ITEMS = _INITIAL_CART_ITEMS as CartItem[];

interface PdvContextType {
  activeTab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa';
  setActiveTab: (tab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa') => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  totalQuantity: number;
  lastScannedItem: CartItem | null;
  quantityMultiplier: number;
  setQuantityMultiplier: (qty: number) => void;
  saleNumber: string;
  customer: { cpf: string; name: string };
  setCustomer: React.Dispatch<React.SetStateAction<{ cpf: string; name: string }>>;
  scaleWeight: number;
  setScaleWeight: (w: number) => void;
  
  // Actions
  addItemByCode: (codeOrEan: string, quantity?: number) => boolean;
  addProductToCart: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
  parkCurrentSale: () => void;
  restoreParkedSale: (parkId: string) => void;
  parkedSales: ParkedSale[];

  // Cash movement & ledger
  cashDrawer: {
    openingFund: number;
    totalSales: number;
    salesCount: number;
    cashInDrawer: number;
    pixTotal: number;
    cardDebit: number;
    cardCredit: number;
    movements: CashMovementRecord[];
  };
  addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string, auth: string) => void;
  closeTurno: () => void;

  // Checkout
  completeSale: (payments: AppliedPayment[], troco: number) => void;
  recentReceipt: CompletedSale | null;
  showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  selectedPaymentMethod: PaymentMethodType;
  setSelectedPaymentMethod: (method: PaymentMethodType) => void;
  openPaymentModal: (method?: PaymentMethodType) => void;
  showCpfPromptModal: boolean;
  setShowCpfPromptModal: (show: boolean) => void;
  startCheckout: (method?: PaymentMethodType) => void;
  proceedToPayment: (cpf?: string) => void;

  // Modals & Tools
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  showCustomerModal: boolean;
  setShowCustomerModal: (show: boolean) => void;
  showScaleModal: boolean;
  setShowScaleModal: (show: boolean) => void;
  weighingProduct: Product | null;
  setWeighingProduct: (prod: Product | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const PdvContext = createContext<PdvContextType | undefined>(undefined);

export const PdvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'catalogo' | 'fechamento' | 'caixa'>('terminal');
  
  // Cart starts empty so cashier starts with clean screen
  const [cart, setCart] = useState<CartItem[]>([]);

  const [quantityMultiplier, setQuantityMultiplier] = useState<number>(1);
  const [saleNumber, setSaleNumber] = useState<string>('04928');
  const [customer, setCustomer] = useState<{ cpf: string; name: string }>({
    cpf: '',
    name: 'Consumidor Final (CPF não informado)'
  });
  const [scaleWeight, setScaleWeight] = useState<number>(0.000);
  const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);

  // Modals
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [recentReceipt, setRecentReceipt] = useState<CompletedSale | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('cash');
  const [showCpfPromptModal, setShowCpfPromptModal] = useState<boolean>(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethodType>('cash');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Cash movement ledger matching screenshot 4
  const [cashDrawer, setCashDrawer] = useState<{
    openingFund: number;
    totalSales: number;
    salesCount: number;
    cashInDrawer: number;
    pixTotal: number;
    cardDebit: number;
    cardCredit: number;
    movements: CashMovementRecord[];
  }>({
    openingFund: 250.00,
    totalSales: 4892.40,
    salesCount: 42,
    cashInDrawer: 1180.00,
    pixTotal: 1425.80,
    cardDebit: 1120.00,
    cardCredit: 1166.60,
    movements: [
      {
        id: 'mov-1',
        time: '14:10:04',
        type: 'sangria',
        title: 'Sangria de Caixa',
        documentRef: 'Recibo fiscal #SG-8941',
        reason: 'Transferência preventiva para Cofre Central',
        operator: 'Juliana Costa',
        authorizer: 'Sup. Marcos Silveira',
        amount: 400.00
      },
      {
        id: 'mov-2',
        time: '11:45:19',
        type: 'suprimento',
        title: 'Suprimento',
        documentRef: 'Lote Troco Miúdo #SP-1044',
        reason: 'Reposição de cédulas de R$ 2 e R$ 5',
        operator: 'Juliana Costa',
        authorizer: 'Tesouraria Geral',
        amount: 100.00
      },
      {
        id: 'mov-3',
        time: '08:14:22',
        type: 'abertura',
        title: 'Fundo Inicial',
        documentRef: 'Abertura de Caixa #OP-4829',
        reason: 'Lançamento obrigatório de troco',
        operator: 'Juliana Costa',
        authorizer: 'Automático Sistema',
        amount: 250.00
      }
    ]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Calculations
  const subtotal = Number(cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const discount = 0.00;
  const addition = 0.00;
  const total = Number((subtotal - discount + addition).toFixed(2));
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const lastScannedItem = cart.length > 0 ? cart[cart.length - 1] : null;

  // Add product to cart
  const addProductToCart = (product: Product, quantity?: number) => {
    const qty = quantity || quantityMultiplier || 1;
    playBeep('scan');

    setCart((prev) => {
      // If product is already in cart, increment quantity
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = Number((current.quantity + qty).toFixed(3));
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          subtotal: Number((newQty * current.unitPrice).toFixed(2)),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false })
        };
        // Move to end so it shows as last scanned
        const [moved] = updated.splice(existingIndex, 1);
        return [...updated, moved];
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: qty,
          unitPrice: product.price,
          subtotal: Number((qty * product.price).toFixed(2)),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false })
        };
        return [...prev, newItem];
      }
    });

    setQuantityMultiplier(1);
    showToast(`1x ${product.name} registrado no caixa`);
  };

  const addItemByCode = (codeOrEan: string, quantity?: number): boolean => {
    const clean = codeOrEan.trim().toLowerCase();
    const found = INITIAL_PRODUCTS.find(
      (p) => p.code.toLowerCase() === clean || p.name.toLowerCase().includes(clean)
    );

    if (found) {
      if (found.isWeighable && (!quantity || quantity === 1)) {
        // If it's a weighable product and scanned without explicit weight, prompt scale modal
        setWeighingProduct(found);
        setShowScaleModal(true);
      } else {
        addProductToCart(found, quantity);
      }
      return true;
    } else {
      playBeep('error');
      showToast(`Produto não localizado para o código "${codeOrEan}"`);
      return false;
    }
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
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              subtotal: Number((newQty * item.unitPrice).toFixed(2))
            }
          : item
      )
    );
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setCart([]);
      playBeep('drawer');
      showToast('Venda cancelada / Limpa');
    }
  };

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

  const addCashMovement = (type: 'sangria' | 'suprimento', amount: number, reason: string, auth: string) => {
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const isSangria = type === 'sangria';
    
    const newMovement: CashMovementRecord = {
      id: `mov-${Date.now()}`,
      time: nowStr,
      type,
      title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
      documentRef: `Recibo manual #${isSangria ? 'SG' : 'SP'}-${Math.floor(1000 + Math.random() * 9000)}`,
      reason: reason || (isSangria ? 'Transferência de segurança para Cofre' : 'Reforço de Troco Miúdo'),
      operator: 'Juliana Costa',
      authorizer: auth || 'Supervisor Autorizado',
      amount
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
  };

  const closeTurno = () => {
    playBeep('success');
    showToast('Turno encerrado. Redução Z emitida na impressora fiscal.');
  };

  const completeSale = (payments: AppliedPayment[], troco: number) => {
    const saleTotal = total;
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const dateStr = new Date().toLocaleDateString('pt-BR');

    // Update cash drawer stats
    setCashDrawer((prev) => {
      let addCash = 0;
      let addPix = 0;
      let addDebit = 0;
      let addCredit = 0;

      payments.forEach((p) => {
        if (p.method === 'cash') {
          // cash amount paid minus change
          addCash += (p.amount - troco);
        } else if (p.method === 'pix') {
          addPix += p.amount;
        } else if (p.method === 'debit') {
          addDebit += p.amount;
        } else if (p.method === 'credit') {
          addCredit += p.amount;
        }
      });

      return {
        ...prev,
        totalSales: Number((prev.totalSales + saleTotal).toFixed(2)),
        salesCount: prev.salesCount + 1,
        cashInDrawer: Number((prev.cashInDrawer + addCash).toFixed(2)),
        pixTotal: Number((prev.pixTotal + addPix).toFixed(2)),
        cardDebit: Number((prev.cardDebit + addDebit).toFixed(2)),
        cardCredit: Number((prev.cardCredit + addCredit).toFixed(2))
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
    setShowReceiptModal(true);
    setShowPaymentModal(false);
    playBeep('success');

    // Clear cart and prepare for next customer
    setCart([]);
    setSaleNumber(String(Number(saleNumber) + 1).padStart(5, '0'));
    setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
    setActiveTab('terminal');
    showToast(`Venda #${saleNumber} concluída com sucesso! NFC-e emitida.`);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelpModal(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('catalogo');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('caixa');
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0) {
          startCheckout('cash');
        } else {
          showToast('Adicione produtos para fechar a venda');
        }
      } else if (e.key === 'Escape') {
        if (showCpfPromptModal) {
          setShowCpfPromptModal(false);
        } else if (showPaymentModal) {
          setShowPaymentModal(false);
        } else if (showHelpModal || showCustomerModal || showScaleModal || showReceiptModal) {
          setShowHelpModal(false);
          setShowCustomerModal(false);
          setShowScaleModal(false);
          setShowReceiptModal(false);
        } else if (activeTab !== 'terminal') {
          setActiveTab('terminal');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart.length, showCpfPromptModal, showPaymentModal, showHelpModal, showCustomerModal, showScaleModal, showReceiptModal]);

  return (
    <PdvContext.Provider
      value={{
        activeTab,
        setActiveTab,
        cart,
        subtotal,
        discount,
        addition,
        total,
        totalQuantity,
        lastScannedItem,
        quantityMultiplier,
        setQuantityMultiplier,
        saleNumber,
        customer,
        setCustomer,
        scaleWeight,
        setScaleWeight,
        addItemByCode,
        addProductToCart,
        removeItem,
        updateItemQuantity,
        clearCart,
        parkCurrentSale,
        restoreParkedSale,
        parkedSales,
        cashDrawer,
        addCashMovement,
        closeTurno,
        completeSale,
        recentReceipt,
        showReceiptModal,
        setShowReceiptModal,
        showPaymentModal,
        setShowPaymentModal,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        openPaymentModal,
        showCpfPromptModal,
        setShowCpfPromptModal,
        startCheckout,
        proceedToPayment,
        showHelpModal,
        setShowHelpModal,
        showCustomerModal,
        setShowCustomerModal,
        showScaleModal,
        setShowScaleModal,
        weighingProduct,
        setWeighingProduct,
        toastMessage,
        showToast
      }}
    >
      {children}
    </PdvContext.Provider>
  );
};

export const usePdv = () => {
  const context = useContext(PdvContext);
  if (!context) {
    throw new Error('usePdv must be used within a PdvProvider');
  }
  return context;
};
