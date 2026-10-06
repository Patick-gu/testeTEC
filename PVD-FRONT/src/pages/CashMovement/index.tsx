import React from 'react';
import { useCashMovementService } from './service';
import { styles } from './style';
import { TopBar } from './components/TopBar';
import { MetricsGrid } from './components/MetricsGrid';
import { ActionLauncher } from './components/ActionLauncher';
import { SummaryCard } from './components/SummaryCard';
import { Peripherals } from './components/Peripherals';
import { LedgerTable } from './components/LedgerTable';
import { Modals } from './components/Modals';

export const CashMovementScreen: React.FC = () => {
  const svc = useCashMovementService();

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        
        <TopBar svc={svc} />

        <MetricsGrid svc={svc} />

        <div className={styles.layout.grid}>
          
          <div className={styles.layout.leftCol}>
            <ActionLauncher svc={svc} />
            <SummaryCard svc={svc} />
            <Peripherals />
          </div>

          <div className={styles.layout.rightCol}>
            <LedgerTable svc={svc} />
          </div>

        </div>

      </div>

      <Modals svc={svc} />

    </div>
  );
};
