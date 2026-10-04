import React, { useState, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setShowHelpModal,
    cart,
    openPaymentModal,
  } = usePdv();

  const [timeStr, setTimeStr] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal' },
    { id: 'catalogo' as const, label: 'Catálogo' },
    { id: 'caixa' as const, label: 'Caixa' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/60">
      <div className="h-14 w-full px-4 lg:px-6 flex items-center justify-between">

        {/* Logo + Status */}
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-bold tracking-tight text-slate-900 cursor-pointer"
            onClick={() => setActiveTab('terminal')}
          >
            Nexus <span className="font-light text-slate-400">PDV</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Caixa #01
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-2.5 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Ajuda (F1)"
            >
              F1
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className="px-2.5 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Consultar (F2)"
            >
              F2
            </button>
            <button
              onClick={() => {
                if (cart.length > 0) openPaymentModal('cash');
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              title="Fechar Venda (F10)"
            >
              F10 Fechar
            </button>
          </div>

          {/* Time */}
          <span className="hidden sm:block text-sm font-mono-num text-slate-400 tabular-nums">
            {timeStr || '00:00'}
          </span>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined text-xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-3 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-2 flex gap-2">
            <button
              onClick={() => { if (cart.length > 0) openPaymentModal('cash'); setMenuOpen(false); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white"
            >
              F10 Fechar Venda
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
