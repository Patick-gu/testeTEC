import React from 'react';
import { useTeamService } from './service';
import { styles } from './style';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const TeamScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    loading,
    error,
    showModal,
    setShowModal,
    editingMember,
    formData,
    setFormData,
    filteredTeam,
    teamEmpty,
    requestDelete, confirmDelete, userToDelete, setUserToDelete,
    handleSave,
    openNewUserModal,
    openEditModal
  } = useTeamService();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header & Actions */}
        <div className={styles.headerWrapper}>
          <div>
            <h1 className={styles.headerTitle}>Gestão de Equipe</h1>
            <p className={styles.headerSubtitle}>Gerencie os acessos, permissões e status dos seus atendentes.</p>
          </div>
          <button onClick={openNewUserModal} className={styles.newUserBtn}>
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Usuário
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIconWrapper}>
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Buscar por nome ou e-mail no banco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Team List / Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableTh}>Usuário</th>
                  <th className={styles.tableTh}>Perfil (Role)</th>
                  <th className={styles.tableTh}>Status</th>
                  <th className={`text-right ${styles.tableTh}`}>Ações</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {loading && teamEmpty ? (
                  <tr><td colSpan={4} className={styles.emptyStateTd}>Carregando dados do servidor...</td></tr>
                ) : filteredTeam.map((member) => (
                  <tr key={member.id} className={styles.tableRow}>
                    <td className={styles.tableTd}>
                      <div className={styles.userCellWrapper}>
                        <div className={styles.userAvatar}>
                          <span className={styles.userAvatarText}>
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={styles.userName}>{member.name}</p>
                          <p className={styles.userEmail}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableTd}>
                      <span className={`${styles.roleBadgeBase} ${
                        member.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {member.role === 'admin' ? 'shield_person' : 'point_of_sale'}
                        </span>
                        {member.role === 'admin' ? 'Supervisor' : 'Operador'}
                      </span>
                    </td>
                    <td className={styles.tableTd}>
                      <span className={`${styles.statusBadgeBase} ${
                        member.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeOff
                      }`}>
                        <span className={`${styles.statusDotBase} ${
                          member.status === 'active' ? styles.statusDotActive : styles.statusDotOff
                        }`}></span>
                        {member.status === 'active' ? 'Ativo' : 'Inativo (Off)'}
                      </span>
                    </td>
                    <td className={`text-right ${styles.tableTd}`}>
                      <div className={styles.actionWrapper}>
                        <button onClick={() => openEditModal(member)} className={styles.editBtn} title="Editar Usuário">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => requestDelete(member.id)} className={styles.deleteBtn} title="Excluir">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyStateTd}>
                      <span className={styles.emptyStateIcon}>search_off</span>
                      <p className="text-sm">Nenhum membro da equipe encontrado no banco de dados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE USUÁRIO */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Excluir Usuário?"
        description="Esta ação removerá o usuário permanentemente do sistema. Deseja continuar?"
        confirmText="Sim, Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>
              {editingMember ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            
            <form onSubmit={handleSave} className={styles.formWrapper}>
              <div>
                <label className={styles.formLabel}>Nome Completo</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              
              <div>
                <label className={styles.formLabel}>E-mail</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className={styles.formInput}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Senha {editingMember && '(Deixe em branco para não alterar)'}</label>
                <input 
                  type="password" required={!editingMember} minLength={6}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className={styles.formInput}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={styles.formLabel}>Perfil (Role)</label>
                  <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="user">Operador</option>
                    <option value="admin">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className={styles.formLabel}>Status</label>
                  <select 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="active">Ativo</option>
                    <option value="off">Inativo / Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
