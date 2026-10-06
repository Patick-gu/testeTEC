import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const MetricsGrid: React.FC<Props> = ({ svc }) => {
  const { cashDrawer } = svc;

  return (
        <div className={styles.metrics.grid}>
          
          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Total Vendas (Turno)
              </span>
              <span className={styles.metrics.iconWrapperSales}>
                <span className={styles.metrics.icon}>trending_up</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.totalSales.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextSales}>
                <span className={styles.metrics.subtextIcon}>receipt_long</span>
                <span>{cashDrawer.salesCount} vendas concluídas</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barSales}></div>
            </div>
          </div>

          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Em Dinheiro (Gaveta)
              </span>
              <span className={styles.metrics.iconWrapperCash}>
                <span className={styles.metrics.icon}>payments</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.cashInDrawer.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextCash}>
                <span>Troco (R$ {cashDrawer.openingFund.toFixed(2).replace('.', ',')}) + Entradas</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barCash}></div>
            </div>
          </div>

          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Recebimentos PIX
              </span>
              <span className={styles.metrics.iconWrapperPix}>
                <span className={styles.metrics.icon}>qr_code_2</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.pixTotal.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextPix}>
                <span className={styles.metrics.subtextIcon}>bolt</span>
                <span>100% compensação imediata</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barPix}></div>
            </div>
          </div>

          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Cartões (Débito & Crédito)
              </span>
              <span className={styles.metrics.iconWrapperCard}>
                <span className={styles.metrics.icon}>contactless</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {(cashDrawer.cardDebit + cashDrawer.cardCredit).toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextCard}>
                <span>Déb: R$ {cashDrawer.cardDebit.toFixed(2).replace('.', ',')}</span>
                <span>Créd: R$ {cashDrawer.cardCredit.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barCard}></div>
            </div>
          </div>

        </div>
  );
};
