import React from 'react';
import { useCatalogService } from '../service';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCatalogService>;
}

export const CategoryFilterBar: React.FC<Props> = ({ svc }) => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchInputRef
  } = svc;
  
  return (
    <>
        {/* Category Filter Bar */}
        <div className={styles.categoryFilterBar}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  searchInputRef.current?.focus();
                }}
                className={`${styles.categoryButtonBase} ${
                  isActive ? styles.categoryButtonActive : styles.categoryButtonInactive
                }`}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`${styles.categoryShortcutBase} ${
                    isActive ? styles.categoryShortcutActive : styles.categoryShortcutInactive
                  }`}
                >
                  {cat.shortcut}
                </span>
              </button>
            );
          })}
        </div>

    </>
  );
};
