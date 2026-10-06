import React, { createContext, useContext, useState } from 'react';
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
