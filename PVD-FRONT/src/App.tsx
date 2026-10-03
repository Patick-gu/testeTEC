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
    <div className="bg-[#f8fafc] min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Fixed POS Header & Shortcut Ribbon */}
      <Header />

      {/* Main Workspace (pt-28 clears 64px header + 48px shortcut ribbon) */}
      <main className="w-full pt-28 flex-1 flex flex-col">
        {activeTab === 'terminal' && <TerminalScreen />}
        {activeTab === 'catalogo' && <CatalogScreen />}
        {activeTab === 'fechamento' && <PaymentScreen />}
        {activeTab === 'caixa' && <CashMovementScreen />}
      </main>

      {/* Persistent POS Hardware & Sefaz Status Footer */}
      <Footer />

      {/* Overlays & Interactive Dialogs */}
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
