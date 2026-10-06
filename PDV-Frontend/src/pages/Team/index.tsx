import React from 'react';
import { useTeamService } from './service';
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
    <div className="flex-1 bg-slate-50 p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestão de Equipe</h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie os acessos, permissões e status dos seus atendentes.</p>
          </div>
          <button onClick={openNewUserModal} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Usuário
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200/60 text-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              placeholder="Buscar por nome ou e-mail no banco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Team List / Table */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil (Role)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className={`text-right $"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"`}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && teamEmpty ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Carregando dados do servidor...</td></tr>
                ) : filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-slate-600 font-bold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`$"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider" ${
                        member.role === 'admin' ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {member.role === 'admin' ? 'shield_person' : 'point_of_sale'}
                        </span>
                        {member.role === 'admin' ? 'Supervisor' : 'Operador'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`$"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" ${
                        member.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`$"w-1.5 h-1.5 rounded-full" ${
                          member.status === 'active' ? "bg-emerald-500" : "bg-slate-400"
                        }`}></span>
                        {member.status === 'active' ? 'Ativo' : 'Inativo (Off)'}
                      </span>
                    </td>
                    <td className={`text-right $"px-6 py-4"`}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(member)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar Usuário">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => requestDelete(member.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Excluir">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingMember ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Senha {editingMember && '(Deixe em branco para não alterar)'}</label>
                <input 
                  type="password" required={!editingMember} minLength={6}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil (Role)</label>
                  <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="user">Operador</option>
                    <option value="admin">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="active">Ativo</option>
                    <option value="off">Inativo / Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
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
