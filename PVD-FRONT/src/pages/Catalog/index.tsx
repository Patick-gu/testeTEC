import React from 'react';
import { useCatalogService } from './service';
import { styles } from './style';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

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
    setShowScaleModal,
    isAdmin,
    loading,
    error,
    showImportModal,
    setShowImportModal,
    importFile,
    setImportFile,
    importLoading,
    handleImportSubmit,
    handleDownloadModel,
    showCategoryModal,
    setShowCategoryModal,
    newCategoryName,
    setNewCategoryName,
    categoryLoading,
    handleCreateCategory,
    dbCategories,
    itemsToDelete,
    setItemsToDelete,
    selectedProducts,
    toggleProductSelection,
    toggleSelectAll,
    confirmDelete,
    openEditModal,
    showEditModal,
    setShowEditModal,
    editForm,
    setEditForm,
    editLoading,
    handleSaveEdit,
    showOnlyCritical,
    setShowOnlyCritical
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
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Importar XLSX
                  </button>
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
          
          {isAdmin && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 ml-auto"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Nova Categoria</span>
            </button>
          )}
        </div>

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
      </div>

      {showImportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Importar Produtos (XLSX)</h3>
              <button onClick={() => setShowImportModal(false)} className={styles.modalCloseBtn}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleImportSubmit} className={styles.modalBody}>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 p-3 rounded-xl text-sm leading-relaxed">
                <span className="material-symbols-outlined text-[18px] float-left mr-2 mt-0.5">info</span>
                Importe seu catálogo usando nossa planilha padrão. Se você não tem o modelo, pode baixá-lo clicando no link abaixo.
              </div>

              <div className={styles.modalInputWrapper}>
                <label className={styles.modalLabel}>Selecione o arquivo (.xlsx)</label>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className={styles.modalFileInput}
                  required
                />
              </div>

              <div onClick={handleDownloadModel} className={styles.linkDownload}>
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">download</span>
                Baixar planilha modelo vazia
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowImportModal(false)} className={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={!importFile || importLoading} className={styles.btnConfirm}>
                  {importLoading ? 'Importando...' : 'Confirmar Importação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Nova Categoria</h3>
              <button onClick={() => setShowCategoryModal(false)} className={styles.modalCloseBtn}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className={styles.modalBody}>
              <div className={styles.modalInputWrapper}>
                <label className={styles.modalLabel}>Nome da Categoria</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Laticínios"
                  className={styles.modalFileInput.replace('file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer', '')}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={!newCategoryName.trim() || categoryLoading} className={styles.btnConfirm}>
                  {categoryLoading ? 'Salvando...' : 'Adicionar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Produto</h3>
              <button onClick={() => setShowEditModal(false)} className={styles.modalCloseBtn}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className={styles.modalBody}>
              <div className="grid grid-cols-2 gap-4">
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Código de Barras / Ref</label>
                  <input 
                    type="text" 
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Categoria</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  >
                    <option value="" disabled>Selecione...</option>
                    {dbCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalInputWrapper}>
                <label className={styles.modalLabel}>Nome do Produto</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Estoque Atual</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value, 10) })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Preço Atacado (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={editForm.wholesale_price || ''}
                    onChange={(e) => setEditForm({ ...editForm, wholesale_price: parseFloat(e.target.value) || 0 })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Qtd Mínima Atacado</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editForm.wholesale_min_quantity || ''}
                    onChange={(e) => setEditForm({ ...editForm, wholesale_min_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowEditModal(false)} className={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={editLoading} className={styles.btnConfirm}>
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProducts.length > 0 && isAdmin && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-sm font-bold">
              {selectedProducts.length}
            </span>
            <span className="text-sm font-medium">Produtos Selecionados</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <button
            onClick={() => toggleSelectAll()}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {selectedProducts.length === filteredProducts.length ? 'Desmarcar Todos' : 'Marcar Todos'}
          </button>
          <button
            onClick={() => setItemsToDelete(selectedProducts)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors ml-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Excluir
          </button>
        </div>
      )}

      <ConfirmModal 
        isOpen={itemsToDelete.length > 0}
        title={itemsToDelete.length > 1 ? `Excluir ${itemsToDelete.length} Produtos?` : "Excluir Produto?"}
        description={itemsToDelete.length > 1 
          ? "Esta ação removerá todos os produtos selecionados do catálogo e não pode ser desfeita. Deseja continuar?" 
          : "Esta ação removerá o produto do catálogo e não pode ser desfeita. Deseja continuar?"}
        confirmText={itemsToDelete.length > 1 ? "Sim, Excluir Todos" : "Sim, Excluir"}
        onConfirm={confirmDelete}
        onCancel={() => setItemsToDelete([])}
      />
    </div>
  );
};
