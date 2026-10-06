import React from 'react';
import { useCatalogService } from './service';
import { TopCommandStrip } from './components/TopCommandStrip';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { CatalogGrid } from './components/CatalogGrid';
import { Modals } from './components/Modals';
import { styles } from './style';

export const CatalogScreen: React.FC = () => {
  const svc = useCatalogService();
  
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <TopCommandStrip svc={svc} />
        <CategoryFilterBar svc={svc} />
        <CatalogGrid svc={svc} />
      </div>
      <Modals svc={svc} />
    </div>
  );
};
