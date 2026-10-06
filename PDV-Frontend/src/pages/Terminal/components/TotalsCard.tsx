import React from 'react';
import { useTerminalService } from '../service';
import { styles } from '../style';


interface Props {
  svc: ReturnType<typeof useTerminalService>;
}

export const TotalsCard: React.FC<Props> = ({ svc }) => {
  const {
    subtotal,
    discount,
    addition,
    total,
    handleQuickPayment,
    requestClearCart,
    cart,
    startCheckout,
    showToast,
  } = svc;

  return (
    <div className={styles.totalsCard}>
      <div className={styles.totalsRow}>
        <span className={styles.totalsLabel}>Subtotal Bruto</span>
        <span className={styles.totalsValueGross}>
          R$ {subtotal.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div className={styles.totalsRow}>
        <div className={styles.totalsRowDiscountLeft}>
          <span className={styles.totalsLabel}>Descontos / Cupons</span>
          <span className={styles.totalsPromoTag}>PROMO</span>
        </div>
        <span className={styles.totalsValueDiscount}>
          - R$ {discount.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div className={styles.totalsRow}>
        <span className={styles.totalsLabel}>Acréscimos</span>
        <span className={styles.totalsValueAddition}>
          + R$ {addition.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div className={styles.hugeTotalCard}>
        <span className={styles.hugeTotalLabel}>VALOR TOTAL A PAGAR</span>
        <div className={styles.hugeTotalValueWrapper}>
          <span className={styles.hugeTotalCurrency}>R$</span>
          {total.toFixed(2).replace('.', ',')}
        </div>
        <div className={styles.hugeTotalStatus}>
          <span className={styles.hugeTotalPulse}></span>
          Aguardando seleção de forma de recebimento
        </div>
      </div>

      <div className={`${styles.quickPaymentSection} mt-auto`}>
        <span className={styles.quickPaymentTitle}>Pagamento Rápido</span>
        <div className={styles.quickPaymentGrid}>
          <button onClick={() => handleQuickPayment('cash')} className={styles.quickPaymentBtn}>
            <span className={styles.quickPaymentIconCash}>payments</span>
            <span className={styles.quickPaymentBtnLabel}>DINHEIRO</span>
            <span className={styles.quickPaymentBtnKey}>[F9]</span>
          </button>

          <button onClick={() => handleQuickPayment('pix')} className={styles.quickPaymentBtn}>
            <span className={styles.quickPaymentIconPix}>qr_code_2</span>
            <span className={styles.quickPaymentBtnLabel}>PIX TEF</span>
            <span className={styles.quickPaymentBtnKey}>[F6]</span>
          </button>

          <button onClick={() => handleQuickPayment('debit')} className={styles.quickPaymentBtn}>
            <span className={styles.quickPaymentIconDebit}>credit_card</span>
            <span className={styles.quickPaymentBtnLabel}>DÉBITO</span>
            <span className={styles.quickPaymentBtnKey}>[F8]</span>
          </button>

          <button onClick={() => handleQuickPayment('credit')} className={styles.quickPaymentBtn}>
            <span className={styles.quickPaymentIconCredit}>credit_score</span>
            <span className={styles.quickPaymentBtnLabel}>CRÉDITO</span>
            <span className={styles.quickPaymentBtnKey}>[F9]</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={requestClearCart}
          disabled={cart.length === 0}
          className="h-12 px-4 rounded-xl bg-red-500 border border-red-600 hover:bg-red-600 disabled:opacity-40 disabled:bg-red-300 disabled:border-red-300 text-white font-semibold text-xs flex flex-col sm:flex-row items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-lg">cancel</span>
          CANCELAR [ESC]
        </button>

        <button
          onClick={() => {
            if (cart.length > 0) {
              startCheckout('cash');
            } else {
              showToast('Adicione produtos para fechar a venda');
            }
          }}
          className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-between px-5"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>FINALIZAR VENDA</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-mono-num text-xs hidden sm:inline-block">F10</span>
        </button>
      </div>
    </div>
  );
};
