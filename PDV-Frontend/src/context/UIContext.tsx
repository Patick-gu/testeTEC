import React, { createContext, useContext, useState } from 'react';
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
