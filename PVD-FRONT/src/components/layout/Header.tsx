import React, { useState, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setShowHelpModal,
    cart,
    scaleWeight,
    setShowScaleModal,
    openPaymentModal
  } = usePdv();

  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setDateStr(now.toLocaleDateString('pt-BR'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Main Application Bar */}
      <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between">
        {/* Brand & Terminal Station */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('terminal')}>
            <img
              alt="Nexus PDV Logo"
              className="h-8 w-auto object-contain hidden sm:block"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XJcCnAzlBKKNDwF2V_lCw2oWYBkg1Orp8DPIOKxiPqBAcXQPlfFtuQU0YT-3WpA_j2KpW8P2OlFlcakzod62uc740eT6v39JfDF1AGPGJyGI7w4L10DJuxqBFOV_3G540uDtBiAOO3l3QoY3YDoyt5ShSTMuzofDDUE4rny_6MDS9HpvkkxS9xEdH_LVuCI2-BmTAkeokZEPQZwgK-TEY3XITXflwIPY6ToMuhdn9qbDPK3Q5JhAfldA"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline-block">
                Nexus PDV
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-mono-num font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="hidden sm:inline">CAIXA #01 LIVRE</span>
                <span className="sm:hidden">LIVRE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <div className="flex items-center gap-6">
          <button
            className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-blue-50 text-[#004ac6] border border-blue-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Terminal PDV
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'catalogo'
                  ? 'bg-blue-50 text-[#004ac6] border border-blue-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Catálogo & Preços
            </button>
            <button
              onClick={() => setActiveTab('caixa')}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'caixa'
                  ? 'bg-blue-50 text-[#004ac6] border border-blue-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Movimento de Caixa
            </button>
          </nav>

          {/* Right Metrics & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
              <span className="material-symbols-outlined text-sm font-semibold">wifi</span>
              <span className="text-xs font-mono-num font-bold hidden sm:inline-block">ONLINE</span>
            </div>

            <div className="text-right hidden md:block">
              <div className="text-sm font-mono-num font-bold text-slate-800">
                {timeStr || '14:32:08'}
              </div>
              <div className="text-[11px] font-mono-num text-slate-500">
                {dateStr || '24/10/2024'}
              </div>
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-semibold text-slate-900">Juliana Costa</div>
                <div className="text-[11px] font-mono-num text-slate-500">Op. Matrícula #4829</div>
              </div>
              <img
                alt="Operador Juliana Costa"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS5FQqSTIlsKDA3PmPbvCO6fBD3Dx9424Zsl0h6_9v1CByDXmTZG3l8vOeeHAH8Q2h7i5E9FhrLXd2B1K9lwKruWl39EuyYYKpp4IlA_VNt_bndFKTHWUCcGLJOymJY5e3WnEA6EimJM-paDedFnLzCep1xdwRRDqRtdjW-YQ50E2wBwbx8bDufpwKruXRamrHtoyJ5PrCqKOZRt5sLVbZwrT5o3LkenwVdibta4woOQSaeNabXgEc"
              />
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 p-4 absolute top-16 left-0 w-full shadow-lg z-50 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('terminal'); setMenuOpen(false); }}
            className={`px-4 py-3 rounded-lg font-medium text-left transition-colors ${
              activeTab === 'terminal'
                ? 'bg-blue-50 text-[#004ac6] border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Terminal PDV
          </button>
          <button
            onClick={() => { setActiveTab('catalogo'); setMenuOpen(false); }}
            className={`px-4 py-3 rounded-lg font-medium text-left transition-colors ${
              activeTab === 'catalogo'
                ? 'bg-blue-50 text-[#004ac6] border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Catálogo & Preços
          </button>
          <button
            onClick={() => { setActiveTab('caixa'); setMenuOpen(false); }}
            className={`px-4 py-3 rounded-lg font-medium text-left transition-colors ${
              activeTab === 'caixa'
                ? 'bg-blue-50 text-[#004ac6] border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Movimento de Caixa
          </button>
        </div>
      )}

      {/* Shortcut Action Ribbon */}
      <div className="h-auto min-h-[3rem] w-full px-4 lg:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between py-2 gap-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono-num text-[11px] font-bold">
              F1
            </span>
            <span className="text-xs font-semibold text-slate-700">Ajuda</span>
          </button>

          <button
            onClick={() => setActiveTab('catalogo')}
            className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === 'catalogo'
                ? 'bg-blue-50 border border-blue-300 text-[#004ac6] font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-[#004ac6] text-white font-mono-num text-[11px] font-bold">
              F2
            </span>
            <span className="text-xs font-bold text-[#004ac6]">Consultar</span>
          </button>

          <button
            onClick={() => {
              if (cart.length > 0) {
                const event = new CustomEvent('cancel-last-item');
                window.dispatchEvent(event);
              }
            }}
            className="flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono-num text-[11px] font-bold">
              F4
            </span>
            <span className="text-xs font-medium text-slate-800">Cancelar</span>
          </button>

          <button
            onClick={() => setActiveTab('caixa')}
            className="flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-amber-50 hover:border-amber-200 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono-num text-[11px] font-bold">
              F8
            </span>
            <span className="text-xs font-medium text-slate-800">Caixa</span>
          </button>

          <button
            onClick={() => {
              if (cart.length > 0) {
                openPaymentModal('cash');
              }
            }}
            className="flex shrink-0 items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white font-mono-num text-[11px] font-bold">
              F10
            </span>
            <span className="text-xs font-bold tracking-wide">Fechar</span>
          </button>
        </div>

        {/* Telemetry Status Right */}
        <div className="hidden lg:flex items-center gap-4 text-slate-600 font-mono-num text-xs">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">
              check_circle
            </span>
            SAT / NFC-e Ativo
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">
              credit_card
            </span>
            TEF Integrado
          </span>
          <button
            onClick={() => setShowScaleModal(true)}
            className="flex items-center gap-1 text-slate-700 hover:text-blue-700 transition-colors"
            title="Clique para simular pesagem da Balança"
          >
            <span className="material-symbols-outlined text-slate-500 text-sm">
              scale
            </span>
            Balança: {scaleWeight.toFixed(3).replace('.', ',')} kg
          </button>
        </div>
      </div>
    </header>
  );
};
