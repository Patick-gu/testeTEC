import React from 'react';
import { PdvProvider, usePdv } from './context/PdvContext';
import { Header } from './components/layout/Header';
import { TerminalScreen } from './pages/Terminal';
import { CatalogScreen } from './pages/Catalog';
import { PaymentScreen } from './pages/Payment';
import { CashMovementScreen } from './pages/CashMovement';
import { PaymentModal } from './components/modals/PaymentModal';
import { CpfPromptModal } from './components/modals/CpfPromptModal';
import { ThermalReceiptModal } from './components/modals/ThermalReceiptModal';
import { ScaleModal } from './components/modals/ScaleModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { HelpModal } from './components/modals/HelpModal';
import { Toast } from './components/ui/Toast';
import { Footer } from './components/layout/Footer';

const PdvApp: React.FC = () => {
  const { activeTab } = usePdv();

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      <Header />
      <main className="w-full pt-16 flex-1 flex flex-col">
        {activeTab === 'terminal' && <TerminalScreen />}
        {activeTab === 'catalogo' && <CatalogScreen />}
        {activeTab === 'fechamento' && <PaymentScreen />}
        {activeTab === 'caixa' && <CashMovementScreen />}
      </main>
      <Footer />
      <CpfPromptModal />
      <PaymentModal />
      <ThermalReceiptModal />
      <ScaleModal />
      <CustomerModal />
      <HelpModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <PdvProvider>
      <PdvApp />
    </PdvProvider>
  );
}
