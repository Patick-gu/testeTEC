import React from 'react';
import { useCashMovementService } from './service';
import { TopBar } from './components/TopBar';
import { MetricsGrid } from './components/MetricsGrid';
import { ActionLauncher } from './components/ActionLauncher';
import { SummaryCard } from './components/SummaryCard';
import { Peripherals } from './components/Peripherals';
import { LedgerTable } from './components/LedgerTable';
import { Modals } from './components/Modals';
import { styles } from './style';

export const CashMovementScreen: React.FC = () => {
  const svc = useCashMovementService();

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full px-4 lg:px-6 py-5 flex flex-col gap-5">
        
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
