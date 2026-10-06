import React from 'react';
import { useCatalogService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCatalogService>;
}

export const TopCommandStrip: React.FC<Props> = ({ svc }) => {
  const {
    isAdmin,
    setShowCategoryModal,
    openCreateModal,
    setShowImportModal,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    handleKeyDown,
    filteredProducts,
    showOnlyCritical,
    setShowOnlyCritical,
    criticalStockCount,
  } = svc;

  
  return (
    <div className={styles.topStrip}>
      {/* Search Input Box (8 cols) */}
      <div className={styles.searchBox}>
        <div className={styles.searchHeader}>
          <div className={styles.searchHeaderLeft}>
            <span className={styles.searchTitle}>
              Busca de Catálogo F2
            </span>
            <span className={styles.searchStatusDot}></span>
            <span className={styles.searchStatusText}>
              Modo Operacional Ativo
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Nova Categoria
                </button>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add_box</span>
                  Novo Produto
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Importar XLSX
                </button>
              </>
            )}
            <div className={styles.searchShortcuts}>
              <span>[ESC] Voltar ao Caixa</span>
              <span>•</span>
              <span>[↑↓] Navegar</span>
              <span>•</span>
              <span>[ENTER] Inserir</span>
            </div>
          </div>
        </div>

        <div className={styles.searchInputWrapper}>
          <div className={styles.searchIconWrapper}>
            <span className={styles.searchIcon}>
              search
            </span>
          </div>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite código EAN, nome, marca ou referência do produto..."
            className={styles.searchInput}
          />

          <div className={styles.searchBadgesWrapper}>
            <span className={styles.searchBadgeF2}>
              F2
            </span>
            <span className={styles.searchBadgeFocus}>
              AUTO-FOCO
            </span>
          </div>
        </div>
      </div>

      {/* Quick Metrics Strip (4 cols) */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricTitle}>
            Itens na Lista
          </span>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              {filteredProducts.length}
            </span>
            <span className={styles.metricUnit}>SKUs</span>
          </div>
          <span className={`${styles.metricStatusWrapper} text-emerald-700`}>
            <span className={`${styles.metricStatusIcon} text-emerald-600`}>sync</span>
            100% Sincronizado
          </span>
        </div>

        <button 
          type="button"
          onClick={() => setShowOnlyCritical(!showOnlyCritical)}
          className={`${styles.metricCard} cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all text-left ${showOnlyCritical ? 'ring-2 ring-amber-500 bg-amber-50/50' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className={styles.metricTitle}>
              Estoque Crítico
            </span>
            {showOnlyCritical && (
              <span className="material-symbols-outlined text-amber-500 text-sm">filter_alt</span>
            )}
          </div>
          <div className={styles.metricValueWrapper}>
            <span className="text-xl font-bold text-amber-700 font-mono-num">
              {criticalStockCount}
            </span>
            <span className={styles.metricUnit}>Baixos</span>
          </div>
          <span className={`${styles.metricStatusWrapper} text-amber-700`}>
            <span className={`${styles.metricStatusIcon} text-amber-600`}>warning</span>
            Requer Reposição
          </span>
        </button>

        <div className={styles.metricCard}>
          <span className={styles.metricTitle}>
            Sessão Caixa
          </span>
          <div className={styles.metricValueWrapper}>
            <span className="text-lg font-bold text-[#004ac6] font-mono-num">#01</span>
            <span className={styles.metricUnit}>Terminal</span>
          </div>
          <span className={`${styles.metricStatusWrapper} text-emerald-700`}>
            <span className={styles.searchStatusDot}></span>
            OPERACIONAL
          </span>
        </div>
      </div>
    </div>
  );
};
