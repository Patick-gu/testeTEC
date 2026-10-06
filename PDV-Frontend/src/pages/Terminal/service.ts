import { useState, useRef, useEffect, useMemo } from 'react';
import { useSale, useUI, useCart, useCashflow } from '../../context/index';
import { Product } from '../../types/pdv';
import { ProductService } from '../../api/products';

export const useTerminalService = () => {
  const pdv = { ...useUI(), ...useCart(), ...useSale(), ...useCashflow() };
  const {
    cart,
    subtotal,
    discount,
    addition,
    total,
    totalQuantity,
    lastScannedItem,
    quantityMultiplier,
    setQuantityMultiplier,
    addProductToCart,
    removeItem,
    updateItemQuantity,
    clearCart,
    parkCurrentSale,
    setActiveTab,
    setShowCustomerModal,
    customer,
    openPaymentModal,
    startCheckout,
    showToast
  } = pdv;

  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // New states for product search dropdown
  const [products, setProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await ProductService.getAll();
      
      const mappedData: Product[] = data.map((p: any) => ({
        id: p.id.toString(),
        code: p.barcode || p.code || '',
        name: p.name || 'Produto Sem Nome',
        brand: p.brand || '',
        category: p.category_id ? 'mercearia' : 'all',
        categoryLabel: p.category_id ? 'Mercearia' : 'Todas',
        price: Number(p.price) || 0,
        wholesale_price: Number(p.wholesale_price) || undefined,
        wholesale_min_quantity: Number(p.wholesale_min_quantity) || undefined,
        unit: p.unit || 'UN',
        stock: Number(p.stock) || 0,
        isWeighable: Boolean(p.is_weighable)
      }));
      setProducts(mappedData);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => { setSelectedIndex(0); }, [barcodeInput]);

  const filteredProducts = useMemo(() => {
    if (!barcodeInput.trim()) return products;
    const clean = barcodeInput.toLowerCase().trim();
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(clean) || (p.code || '').toLowerCase().includes(clean)
    );
  }, [products, barcodeInput]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedProduct = filteredProducts[selectedIndex];
      if (selectedProduct) {
        selectProduct(selectedProduct);
      }
    }
  };

  const requestClearCart = () => {
    if (cart.length > 0) {
      setAuthModal({ open: true, actionType: 'clear_cart', itemId: '', itemName: 'Cancelar Venda', authInput: '', error: false });
    }
  };
  
  const confirmClearCart = () => {
    clearCart();
    setShowCancelConfirm(false);
  };

  const selectProduct = (product: Product) => {
    addProductToCart(product, quantityMultiplier);
    setBarcodeInput('');
    setIsDropdownOpen(false);
    setQuantityMultiplier(1);
    inputRef.current?.focus();
  };

  // Auth modal state for delete confirmation
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    actionType: 'remove_item' | 'clear_cart' | null;
    itemId: string;
    itemName: string;
    authInput: string;
    error: boolean;
  }>({ open: false, actionType: null, itemId: '', itemName: '', authInput: '', error: false });

  // The supervisor code (in a real system this would come from the API)
  const SUPERVISOR_CODE = '1234';

  // Focus barcode input via F3 shortcut instead of autofocus
  useEffect(() => {
    const handleF3 = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleF3);
    return () => window.removeEventListener('keydown', handleF3);
  }, []);

  // Listen to custom event for F4 cancel last item
  useEffect(() => {
    const handleCancelLast = () => {
      if (cart.length > 0) {
        const last = cart[cart.length - 1];
        requestRemoveItem(last.id, last.product.name);
      }
    };
    window.addEventListener('cancel-last-item', handleCancelLast);
    return () => window.removeEventListener('cancel-last-item', handleCancelLast);
  }, [cart]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    if (filteredProducts.length > 0) {
      selectProduct(filteredProducts[0]);
    } else {
      showToast('Produto não encontrado');
    }
  };

  const handleQuickPayment = (method: 'cash' | 'pix' | 'debit' | 'credit') => {
    if (cart.length === 0) {
      showToast('Adicione produtos para iniciar o pagamento');
      return;
    }
    startCheckout(method);
  };

  // Request item removal — opens auth modal
  const requestRemoveItem = (itemId: string, itemName: string) => {
    setAuthModal({ open: true, actionType: 'remove_item', itemId, itemName, authInput: '', error: false });
  };

  // Update auth input
  const setAuthInput = (value: string) => {
    setAuthModal((prev) => ({ ...prev, authInput: value, error: false }));
  };

  // Confirm removal with auth
  const confirmRemoveItem = () => {
    if (authModal.authInput === SUPERVISOR_CODE) {
      if (authModal.actionType === 'remove_item') {
        removeItem(authModal.itemId);
        showToast('Item removido com autorização');
      } else if (authModal.actionType === 'clear_cart') {
        clearCart();
        showToast('Venda cancelada com autorização');
      }
      setAuthModal({ open: false, actionType: null, itemId: '', itemName: '', authInput: '', error: false });
    } else {
      setAuthModal((prev) => ({ ...prev, error: true }));
    }
  };

  // Cancel removal
  const cancelRemoveItem = () => {
    setAuthModal({ open: false, actionType: null, itemId: '', itemName: '', authInput: '', error: false });
  };

  return {
    cart,
    subtotal,
    discount,
    addition,
    total,
    totalQuantity,
    lastScannedItem,
    quantityMultiplier,
    setQuantityMultiplier,
    updateItemQuantity,
    clearCart,
    parkCurrentSale,
    setActiveTab,
    setShowCustomerModal,
    customer,
    startCheckout,
    showToast,
    barcodeInput,
    setBarcodeInput,
    inputRef,
    handleBarcodeSubmit,
    handleQuickPayment,
    // Autocomplete Search States
    products,
    filteredProducts,
    isDropdownOpen,
    setIsDropdownOpen,
    isLoadingProducts,
    selectedIndex,
    setSelectedIndex,
    showCancelConfirm,
    setShowCancelConfirm,
    handleSearchKeyDown,
    selectProduct,
    // Auth modal
    authModal,
    requestRemoveItem,
    setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem,
    requestClearCart,
    confirmClearCart
  };
};
