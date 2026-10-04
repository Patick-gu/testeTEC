import { useState, useRef, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';

export const useTerminalService = () => {
  const pdv = usePdv();
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
    addItemByCode,
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

  // Auth modal state for delete confirmation
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    itemId: string;
    itemName: string;
    authInput: string;
    error: boolean;
  }>({ open: false, itemId: '', itemName: '', authInput: '', error: false });

  // The supervisor code (in a real system this would come from the API)
  const SUPERVISOR_CODE = '1234';

  // Focus barcode input automatically
  useEffect(() => {
    inputRef.current?.focus();
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

    // Check if user entered quantity multiplier syntax, e.g. "3*7891000315507"
    if (barcodeInput.includes('*')) {
      const [qtyPart, codePart] = barcodeInput.split('*');
      const qty = parseFloat(qtyPart);
      if (!isNaN(qty) && qty > 0 && codePart) {
        addItemByCode(codePart.trim(), qty);
        setBarcodeInput('');
        return;
      }
    }

    addItemByCode(barcodeInput.trim(), quantityMultiplier);
    setBarcodeInput('');
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
    setAuthModal({ open: true, itemId, itemName, authInput: '', error: false });
  };

  // Update auth input
  const setAuthInput = (value: string) => {
    setAuthModal((prev) => ({ ...prev, authInput: value, error: false }));
  };

  // Confirm removal with auth
  const confirmRemoveItem = () => {
    if (authModal.authInput === SUPERVISOR_CODE) {
      removeItem(authModal.itemId);
      setAuthModal({ open: false, itemId: '', itemName: '', authInput: '', error: false });
      showToast('Item removido com autorização');
    } else {
      setAuthModal((prev) => ({ ...prev, error: true }));
    }
  };

  // Cancel removal
  const cancelRemoveItem = () => {
    setAuthModal({ open: false, itemId: '', itemName: '', authInput: '', error: false });
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
    // Auth modal
    authModal,
    requestRemoveItem,
    setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem
  };
};
