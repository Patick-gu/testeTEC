import React, { useState } from 'react';
import { usePdv } from '../../context/PdvContext';
import { ParkedSalesModal } from '../modals/ParkedSalesModal';

export const Footer: React.FC = () => {
  const { parkedSales } = usePdv();
  const [showParkedModal, setShowParkedModal] = useState<boolean>(false);

  return (
    <>
      <footer className="w-full bg-white border-t border-slate-200 py-2.5 px-4 lg:px-6 z-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between text-slate-500 font-mono-num text-xs gap-2">
          <div className="flex flex-wrap justify-center items-center gap-3">
            <span className="font-semibold text-slate-700 text-center">
              NEXUS POS ENGINE v3.4.12 • TERMINAL IDENT: POS-01-SP
            </span>
            {parkedSales.length > 0 && (
              <button
                onClick={() => setShowParkedModal(true)}
                className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">pause_circle</span>
                {parkedSales.length} em espera
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-[11px]">
            <span>NFS-e Série 001 Homologado</span>
            <span>Ambiente: Produção Sefaz</span>
            <span>© 2024 Nexus Retail Systems</span>
          </div>
        </div>
      </footer>

      <ParkedSalesModal
        isOpen={showParkedModal}
        onClose={() => setShowParkedModal(false)}
      />
    </>
  );
};
