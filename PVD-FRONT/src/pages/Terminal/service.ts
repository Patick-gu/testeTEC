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

  // Focus barcode input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Listen to custom event for F4 cancel last item
  useEffect(() => {
    const handleCancelLast = () => {
      if (cart.length > 0) {
        const last = cart[cart.length - 1];
        removeItem(last.id);
      }
    };
    window.addEventListener('cancel-last-item', handleCancelLast);
    return () => window.removeEventListener('cancel-last-item', handleCancelLast);
  }, [cart, removeItem]);

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
    removeItem,
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
    handleQuickPayment
  };
};
