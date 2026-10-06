export * from './UIContext';
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
