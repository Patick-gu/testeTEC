import React, { useEffect } from 'react';
import { PdvProvider, usePdv } from './context/PdvContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/layout/Header';
import { TerminalScreen } from './pages/Terminal';
import { CatalogScreen } from './pages/Catalog';
import { PaymentScreen } from './pages/Payment';
import { CashMovementScreen } from './pages/CashMovement';
import { PaymentModal } from './components/modals/PaymentModal';
import { CpfPromptModal } from './components/modals/CpfPromptModal';
import { ThermalReceiptModal } from './components/modals/ThermalReceiptModal';
import { PrintPromptModal } from './components/modals/PrintPromptModal';
import { ScaleModal } from './components/modals/ScaleModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { HelpModal } from './components/modals/HelpModal';
import { Footer } from './components/layout/Footer';
import { LoginScreen } from './pages/Login';
import { TeamScreen } from './pages/Team';

const PdvApp: React.FC = () => {
  const { activeTab, setActiveTab } = usePdv();
  const { token, user } = useAuth();

  // Redireciona o Admin para o Catálogo, e o User para o Terminal
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' && activeTab === 'terminal') {
        setActiveTab('catalogo');
      } else if (user.role === 'user' && activeTab !== 'terminal') {
        setActiveTab('terminal');
      }
    }
  }, [user, activeTab, setActiveTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.warn('Error attempting to enable fullscreen:', err);
          });
        } else {
          document.exitFullscreen().catch((err) => {
            console.warn('Error attempting to disable fullscreen:', err);
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!token || !user) {
    return <LoginScreen />;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      <Header />
      <main className="w-full pt-14 flex-1 flex flex-col">
        {activeTab === 'terminal' && user.role === 'user' && <TerminalScreen />}
        
        {activeTab === 'catalogo' && user.role === 'admin' && <CatalogScreen />}
        {activeTab === 'caixa' && user.role === 'admin' && <CashMovementScreen />}
        {activeTab === 'fechamento' && user.role === 'admin' && <PaymentScreen />}
        
        {activeTab === 'equipe' && user.role === 'admin' && <TeamScreen />}

        {/* Fallback caso a aba ativa não corresponda ao nível de acesso */}
        {((activeTab === 'terminal' && user.role === 'admin') || 
          (['catalogo', 'caixa', 'equipe', 'fechamento'].includes(activeTab) && user.role === 'user')) && (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
            <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
            <p className="text-slate-500 mt-2">Você não tem permissão para visualizar esta área.</p>
          </div>
        )}
      </main>
      <Footer />
      <CpfPromptModal />
      <PaymentModal />
      <ThermalReceiptModal />
      <PrintPromptModal />
      <ScaleModal />
      <CustomerModal />
      <HelpModal />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PdvProvider>
          <PdvApp />
        </PdvProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
