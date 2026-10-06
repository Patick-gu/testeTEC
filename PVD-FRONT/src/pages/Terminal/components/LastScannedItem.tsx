import React from 'react';
import { useTerminalService } from '../service';

declare const styles: Record<string, string>;

interface Props {
  svc: ReturnType<typeof useTerminalService>;
}

export const LastScannedItem: React.FC<Props> = ({ svc }) => {
  const {
    lastScannedItem,
    updateItemQuantity,
    inputRef,
  } = svc;

  if (!lastScannedItem) return null;

  return (
    <div className={styles.lastScannedContainer}>
      <div className={styles.lastScannedLeft}>
        <div className={`${styles.lastScannedImgWrapper} flex items-center justify-center text-slate-400`}>
          <span className="material-symbols-outlined">shopping_cart</span>
        </div>
        <div className={styles.lastScannedInfo}>
          <div className={styles.lastScannedTagWrapper}>
            <span className={styles.lastScannedTag}>ÚLTIMO BIPADO</span>
            <span className={styles.lastScannedCode}>{lastScannedItem.product.code}</span>
          </div>
          <h2 className={styles.lastScannedName}>{lastScannedItem.product.name}</h2>
        </div>
      </div>

      <div className={styles.lastScannedRight}>
        <div className="flex items-center gap-2">
          <input
            id="lastItemQtyInput"
            type="number"
            min="0.1"
            step={lastScannedItem.product.isWeighable ? "0.1" : "1"}
            value={lastScannedItem.quantity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updateItemQuantity(lastScannedItem.id, val);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
            className="w-20 h-10 px-2 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-lg font-bold font-mono-num text-slate-800 text-center transition-all outline-none"
          />
          <span className={styles.lastScannedDetails}>
            {lastScannedItem.product.unit === 'UN' ? '' : lastScannedItem.product.unit} × R$ {lastScannedItem.unitPrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <div className={styles.lastScannedSubtotal}>
          R$ {lastScannedItem.subtotal.toFixed(2).replace('.', ',')}
        </div>
      </div>
    </div>
  );
};
