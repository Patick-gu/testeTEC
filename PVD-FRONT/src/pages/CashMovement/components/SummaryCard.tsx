import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const SummaryCard: React.FC<Props> = ({ svc }) => {
  const { cashDrawer } = svc;

  const sangriasTotal = cashDrawer.movements.filter(m => m.type === 'sangria').reduce((acc, m) => acc + m.amount, 0);
  const suprimentosTotal = cashDrawer.movements.filter(m => m.type === 'suprimento').reduce((acc, m) => acc + m.amount, 0);
  const vendasEspecie = cashDrawer.cashInDrawer - cashDrawer.openingFund - suprimentosTotal + sangriasTotal;

  return (
            <div className={styles.summary.card}>
              <div className={styles.summary.header}>
                <span className={styles.summary.title}>Balanço do Dia</span>
                <span className={styles.summary.icon}>verified</span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>Fundo de Abertura</span>
                <span className={styles.summary.valNeutral}>
                  R$ {cashDrawer.openingFund.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(+) Vendas em Espécie</span>
                <span className={styles.summary.valPositive}>
                  + R$ {vendasEspecie.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(+) Suprimentos</span>
                <span className={styles.summary.valPositive}>
                  + R$ {suprimentosTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(-) Sangrias Executadas</span>
                <span className={styles.summary.valNegative}>
                  - R$ {sangriasTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.summary.totalWrapper}>
                <span className={styles.summary.totalLabel}>
                  Total Físico Esperado
                </span>
                <span className={styles.summary.totalValue}>
                  R$ {cashDrawer.cashInDrawer.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
  );
};
