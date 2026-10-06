import React from 'react';
import { useTerminalService } from './service';
import { usePdv } from '../../context/PdvContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

import { BarcodeForm } from './components/BarcodeForm';
import { LastScannedItem } from './components/LastScannedItem';
import { CartTable } from './components/CartTable';
import { TotalsCard } from './components/TotalsCard';
import { AuthModal } from './components/AuthModal';

declare const styles: Record<string, string>;

export const TerminalScreen: React.FC = () => {
  const svc = useTerminalService();

  // Focus the quantity input of the last scanned item automatically
  React.useEffect(() => {
    if (svc.lastScannedItem) {
      setTimeout(() => {
        const qtyInput = document.getElementById('lastItemQtyInput');
        if (qtyInput) {
          qtyInput.focus();
          // Optionally select the text so typing overwrites it
          (qtyInput as HTMLInputElement).select();
        }
      }, 50);
    }
  }, [svc.lastScannedItem?.id]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          
          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>
            <BarcodeForm svc={svc} />
            <LastScannedItem svc={svc} />
            <CartTable svc={svc} />
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            <TotalsCard svc={svc} />
          </div>
        </div>
      </div>

      {/* Auth Modal for Item Removal & Cart Cancel */}
      <AuthModal svc={svc} />
    </div>
  );
};
