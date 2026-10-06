import React from 'react';
import { useCatalogService } from '../service';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCatalogService>;
}

export const Modals: React.FC<Props> = ({ svc }) => {
  const {
    showImportModal,
    setShowImportModal,
    handleImportSubmit,
    setImportFile,
    importFile,
    handleDownloadModel,
    importLoading,
    showCreateModal,
    setShowCreateModal,
    handleSaveCreate,
    createForm,
    setCreateForm,
    dbCategories,
    createLoading,
    showCategoryModal,
    setShowCategoryModal,
    handleCreateCategory,
    newCategoryName,
    setNewCategoryName,
    categoryLoading,
    showEditModal,
    setShowEditModal,
    handleSaveEdit,
    editForm,
    setEditForm,
    editLoading,
    selectedProducts,
    isAdmin,
    filteredProducts,
    toggleSelectAll,
    setItemsToDelete,
    itemsToDelete,
    confirmDelete
  } = svc;
  
  return (
    <>
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

      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Novo Produto</h3>
              <button onClick={() => setShowCreateModal(false)} className={styles.modalCloseBtn}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveCreate} className={styles.modalBody}>
              <div className="grid grid-cols-2 gap-4">
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Código de Barras / Ref</label>
                  <input 
                    type="text" 
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Categoria</label>
                  <select 
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
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
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
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
                    value={createForm.price || ''}
                    onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                    required
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Estoque Inicial</label>
                  <input 
                    type="number" 
                    min="0"
                    value={createForm.stock || ''}
                    onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value, 10) })}
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
                    value={createForm.wholesale_price || ''}
                    onChange={(e) => setCreateForm({ ...createForm, wholesale_price: parseFloat(e.target.value) || 0 })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                  />
                </div>
                <div className={styles.modalInputWrapper}>
                  <label className={styles.modalLabel}>Qtd Mínima Atacado</label>
                  <input 
                    type="number" 
                    min="0"
                    value={createForm.wholesale_min_quantity || ''}
                    onChange={(e) => setCreateForm({ ...createForm, wholesale_min_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="border border-slate-200/60 rounded-xl bg-slate-50 p-2 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowCreateModal(false)} className={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading} className={styles.btnConfirm}>
                  {createLoading ? 'Salvando...' : 'Adicionar Produto'}
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
    </>
  );
};
