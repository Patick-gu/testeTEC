import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, AppliedPayment, PaymentMethodType, CashMovementRecord, ParkedSale, CompletedSale } from '../types/pdv';
import _INITIAL_PRODUCTS from '../JSON/Mock/products.json';
import _INITIAL_CART_ITEMS from '../JSON/Mock/cart.json';
import { playBeep } from '../utils/audio';
import { useAuth } from './AuthContext';
const API_URL = import.meta.env.VITE_API_URL;

const INITIAL_PRODUCTS = _INITIAL_PRODUCTS as Product[];
const INITIAL_CART_ITEMS = _INITIAL_CART_ITEMS as CartItem[];

interface PdvContextType {
  activeTab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe';
  setActiveTab: (tab: 'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe') => void;
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
  addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string, auth: string) => Promise<boolean>;
  closeTurno: () => void;

  // Checkout
  completeSale: (payments: AppliedPayment[], troco: number) => Promise<void>;
  recentReceipt: CompletedSale | null;
  showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  showPrintPromptModal: boolean;
  setShowPrintPromptModal: (show: boolean) => void;
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
  const { token, user } = useAuth();
  
  useEffect(() => {
    if (!token) return;
    // Fetch movements
    fetch(`${API_URL}/caixa/movimentacoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then((data: any[]) => {
      if (Array.isArray(data)) {
        const mappedMovements = data.map(item => {
          const isSangria = item.type === 'sangria';
          const time = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : '';
          return {
            id: item.id,
            time: time,
            type: item.type as 'sangria' | 'suprimento',
            title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
            documentRef: `Recibo ${isSangria ? 'SG' : 'SP'}-${item.id.substring(0,4)}`,
            reason: item.descricao,
            operator: user?.name || 'Operador',
            authorizer: 'Supervisão',
            amount: Number(item.valor)
          };
        });
        setCashDrawer(prev => ({ ...prev, movements: mappedMovements }));
      }
    })
    .catch(err => console.error("Erro ao buscar movimentações", err));

    // Fetch status
    fetch(`${API_URL}/caixa/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then((data: any) => {
      if (data && typeof data.totalSales !== 'undefined') {
        setCashDrawer(prev => ({
          ...prev,
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
  }, [token]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'catalogo' | 'fechamento' | 'caixa' | 'equipe'>('terminal');
  
  // Cart starts with mock data for demonstration
  const [cart, setCart] = useState<CartItem[]>(
    INITIAL_CART_ITEMS.map((item, index) => ({
      id: `cart-mock-${index}`,
      product: item.product as Product,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: Number((item.quantity * item.unitPrice).toFixed(2)),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false })
    }))
  );

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
  const [showPrintPromptModal, setShowPrintPromptModal] = useState<boolean>(false);
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
    openingFund: 0,
    totalSales: 0,
    salesCount: 0,
    cashInDrawer: 0,
    pixTotal: 0,
    cardDebit: 0,
    cardCredit: 0,
    movements: []
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Calculations
  // Subtotal = preço de varejo; desconto = economia gerada pelo preço de atacado
  const subtotal = Number(cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0).toFixed(2));
  const netTotal = Number(cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const discount = Number(Math.max(0, subtotal - netTotal).toFixed(2));
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
        // Move to end so it shows as last scanned
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

  const completeSale = async (payments: AppliedPayment[], troco: number) => {
    try {
      const pMethod = payments[0]?.method;
      const paymentMethodStr = pMethod === 'credit' ? 'credit_card' : pMethod === 'debit' ? 'debit_card' : pMethod || 'cash';
      
      const payload = {
        payment_method: paymentMethodStr,
        items: cart.map(item => ({
          produto_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(`Erro na venda: ${data.erro || 'Falha ao processar'}`);
        return; // Block checkout, don't close modal
      }

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
      setShowPrintPromptModal(true);
      setShowPaymentModal(false);
      playBeep('success');

      // Clear cart and prepare for next customer
      setCart([]);
      setSaleNumber(String(Number(saleNumber) + 1).padStart(5, '0'));
      setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
      setActiveTab('terminal');
      showToast(`Venda #${saleNumber} concluída com sucesso!`);
    } catch (err) {
      showToast('Erro de conexão ao finalizar venda.');
    }
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
        } else if (showHelpModal || showCustomerModal || showScaleModal || showReceiptModal || showPrintPromptModal) {
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
  }, [activeTab, cart.length, showCpfPromptModal, showPaymentModal, showHelpModal, showCustomerModal, showScaleModal, showReceiptModal, showPrintPromptModal]);

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
        showPrintPromptModal,
        setShowPrintPromptModal,
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
