import React, { useState } from 'react';
import { useSale } from '../../context/index';
import { ParkedSalesModal } from '../modals/ParkedSalesModal';

export const Footer: React.FC = () => {
  const { parkedSales } = useSale();
  const [showParkedModal, setShowParkedModal] = useState<boolean>(false);

  return (
    <>
      <footer className="w-full bg-white border-t border-slate-200/60 py-2 px-4 lg:px-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Kaster PDV v3.4 • POS-01</span>

          <div className="flex items-center gap-3">
            {parkedSales.length > 0 && (
              <button
                onClick={() => setShowParkedModal(true)}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-sm">pause_circle</span>
                {parkedSales.length} em espera
              </button>
            )}
            <span className="hidden sm:inline">© 2024 Kaster</span>
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
