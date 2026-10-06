import React from 'react';
import { useCatalogService } from '../service';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCatalogService>;
}

export const CatalogGrid: React.FC<Props> = ({ svc }) => {
  const {
    isAdmin,
    filteredProducts,
    selectedProducts,
    toggleSelectAll,
    toggleProductSelection,
    openEditModal,
    setItemsToDelete,
    searchQuery
  } = svc;
  
  return (
    <>
        {/* Catalog Grid & Right Mini-Cart Sidebar */}
        <div className={styles.mainLayout}>
          
          <div className={styles.productsGrid}>
            {isAdmin && filteredProducts.length > 0 && (
              <div className="flex items-center justify-between px-2 mb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Selecionar Todos ({filteredProducts.length} produtos listados)
                  </span>
                </label>
              </div>
            )}
            
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                
                className={styles.productCard}
              >
                 <div className="flex items-center gap-4 flex-1 min-w-0">
                  {isAdmin && (
                    <input 
                      type="checkbox"
                      checked={selectedProducts.includes(prod.id)}
                      onChange={() => toggleProductSelection(prod.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  )}

                  {/* Title & Metadata */}
                  <div className={styles.productInfoWrapper}>
                    <h3 className={styles.productTitle}>
                      {prod.name}
                    </h3>
                    <span className={styles.productBrand}>
                      {prod.brand}
                    </span>
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className={styles.productActionWrapper}>
                  <div className={styles.productPriceRow}>
                    <div className={styles.productPriceCol}>
                      <span className={styles.productPriceLabel}>
                        {prod.unit === 'KG' ? 'PREÇO POR KG' : 'PREÇO UNITÁRIO'}
                      </span>
                      <div className={styles.productPriceValueWrapper}>
                        <span className={styles.productPriceCurrency}>R$</span>
                        <span className={styles.productPriceValue}>
                          {prod.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      {!!prod.wholesale_min_quantity && !!prod.wholesale_price && (
                        <div className="mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          Atacado: R$ {prod.wholesale_price.toFixed(2).replace('.', ',')} (a partir de {prod.wholesale_min_quantity}un)
                        </div>
                      )}
                    </div>

                    <div className={styles.productStockCol}>
                      <span className={styles.productStockLabel}>
                        DISPONÍVEL
                      </span>
                      <span
                        className={`${styles.productStockValueBase} ${
                          prod.lowStock ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {prod.stock} {prod.unit.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(prod);
                        }}
                        className={styles.editButton}
                        title="Editar Produto"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemsToDelete([prod.id]);
                        }}
                        className={styles.deleteButton}
                        title="Excluir Produto"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>
                  search_off
                </span>
                Nenhum produto encontrado para &quot;{searchQuery}&quot; nesta categoria.
              </div>
            )}
          </div>
        </div>
    </>
  );
};
