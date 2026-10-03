import React from 'react';
import { useCatalogService } from './service';
import { styles } from './style';

export const CatalogScreen: React.FC = () => {
  const {
    cart,
    total,
    scaleWeight,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    searchInputRef,
    categories,
    filteredProducts,
    criticalStockCount,
    handleCardClick,
    handleKeyDown,
    openPaymentModal,
    setActiveTab,
    setShowScaleModal
  } = useCatalogService();

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        {/* Top Command Strip: Search & Live KPIs */}
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
              <div className={styles.searchShortcuts}>
                <span>[ESC] Voltar ao Caixa</span>
                <span>•</span>
                <span>[↑↓] Navegar</span>
                <span>•</span>
                <span>[ENTER] Inserir</span>
              </div>
            </div>

            <div className={styles.searchInputWrapper}>
              <div className={styles.searchIconWrapper}>
                <span className={styles.searchIcon}>
                  barcode_scanner
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

            <div className={styles.metricCard}>
              <span className={styles.metricTitle}>
                Estoque Crítico
              </span>
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
            </div>

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

        {/* Category Filter Bar */}
        <div className={styles.categoryFilterBar}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
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

        {/* Catalog Grid & Right Mini-Cart Sidebar */}
        <div className={styles.mainLayout}>
          
          {/* Products Grid (9 cols) */}
          <div className={styles.productsGrid}>
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleCardClick(prod)}
                className={styles.productCard}
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className={styles.productImageWrapper}>
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className={styles.productImage}
                      referrerPolicy="no-referrer"
                    />

                    <span className={styles.productCodeBadge}>
                      #{prod.code}
                    </span>

                    <span
                      className={`${styles.productCategoryBadgeBase} ${
                        prod.isWeighable || prod.lowStock
                          ? styles.productCategoryBadgeAmber
                          : styles.productCategoryBadgeBlue
                      }`}
                    >
                      {prod.categoryLabel}
                    </span>
                  </div>

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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(prod);
                    }}
                    className={styles.productActionButton}
                  >
                    <span className={styles.productActionIcon}>
                      {prod.isWeighable ? 'scale' : 'add_shopping_cart'}
                    </span>
                    <span>
                      {prod.isWeighable ? '+ Pesar & Inserir' : '+ Inserir no Caixa'}
                    </span>
                    <span className={styles.productActionShortcut}>
                      [ENTER]
                    </span>
                  </button>
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

          {/* Right Live Mini-Cart & Toledo Scale Widget (3 cols) */}
          <div className={styles.sidebarLayout}>
            
            {/* Active Sale Summary Card */}
            <div className={styles.activeSaleCard}>
              <div className={styles.activeSaleHeader}>
                <div className={styles.activeSaleTitleWrapper}>
                  <span className={styles.activeSaleIcon}>
                    point_of_sale
                  </span>
                  <span className={styles.activeSaleTitle}>
                    VENDA ATIVA #04928
                  </span>
                </div>
                <span className={styles.activeSaleStatus}>
                  ABERTA
                </span>
              </div>

              {/* Total Display */}
              <div className={styles.totalDisplay}>
                <span className={styles.totalDisplayLabel}>
                  Total do Cupom Fiscal
                </span>
                <div className={styles.totalDisplayValueWrapper}>
                  <span className={styles.totalDisplayCurrency}>R$</span>
                  <span className={styles.totalDisplayValue}>
                    {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className={styles.totalDisplayFooter}>
                  <span>
                    Itens adicionados: <strong className="text-slate-900">{cart.length}</strong>
                  </span>
                  <span>Desc.: R$ 0,00</span>
                </div>
              </div>

              {/* Recently added items list */}
              <div>
                <div className={styles.recentItemsHeader}>
                  <span className={styles.recentItemsTitle}>
                    Últimos Lançamentos
                  </span>
                  <span className={styles.recentItemsStatus}>
                    Ao Vivo
                  </span>
                </div>

                <div className={styles.recentItemsList}>
                  {cart.slice().reverse().map((item) => (
                    <div
                      key={item.id}
                      className={styles.recentItemCard}
                    >
                      <div className={styles.recentItemInfo}>
                        <div className={styles.recentItemName}>
                          {item.product.name}
                        </div>
                        <div className={styles.recentItemDetails}>
                          {item.quantity} {item.product.unit} × R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <span className={styles.recentItemPrice}>
                        R$ {item.subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className={styles.emptyCartState}>
                      Cesto de compras vazio
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.saleActions}>
                <button
                  onClick={() => {
                    if (cart.length > 0) {
                      openPaymentModal('cash');
                    }
                  }}
                  disabled={cart.length === 0}
                  className={styles.finishSaleBtn}
                >
                  <span className={styles.finishSaleIcon}>payments</span>
                  <span>Finalizar Venda [F10]</span>
                </button>

                <button
                  onClick={() => setActiveTab('terminal')}
                  className={styles.returnBtn}
                >
                  <span className={styles.returnIcon}>arrow_back</span>
                  <span>Retornar ao Terminal Direto [ESC]</span>
                </button>
              </div>
            </div>

            {/* Toledo Scale Widget */}
            <div
              onClick={() => setShowScaleModal(true)}
              className={styles.scaleWidget}
              title="Clique para configurar pesagem na balança"
            >
              <div className={styles.scaleWidgetHeader}>
                <span className={styles.scaleWidgetTitleWrapper}>
                  <span className={styles.scaleWidgetIcon}>scale</span>
                  Balança Toledo Prix 3
                </span>
                <span className={styles.scaleWidgetStatus}>
                  ESTÁVEL
                </span>
              </div>

              <div className={styles.scaleWidgetDisplay}>
                <span className={styles.scaleWidgetLabel}>
                  PESO ATUAL:
                </span>
                <span className={styles.scaleWidgetValue}>
                  {scaleWeight.toFixed(3).replace('.', ',')}{' '}
                  <span className={styles.scaleWidgetUnit}>kg</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
