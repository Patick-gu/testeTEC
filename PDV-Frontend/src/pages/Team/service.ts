import { useState, useEffect } from 'react';
import { useUI } from '../../context/index';
import { UserService } from '../../api/users';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'off';
  created_at?: string;
}

export const useTeamService = () => {
  const { showToast } = useUI();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user', 
    status: 'active' 
  });

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await UserService.getAll();
      setTeam(data);
    } catch (err: any) {
      console.error(err);
      setTeam([]);
      setError('Erro ao carregar usuários. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id: string) => setUserToDelete(id);
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await UserService.delete(userToDelete);
      setTeam(prev => prev.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
      showToast('Usuário removido com sucesso!');
    } catch (err: any) {
      setUserToDelete(null);
      showToast("Erro ao excluir usuário: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // backend valida password conditionally

      let savedUser: any;
      if (editingMember) {
        savedUser = await UserService.update(editingMember.id, payload);
        setTeam(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      } else {
        savedUser = await UserService.create(payload);
        setTeam(prev => [...prev, savedUser]);
      }
      setShowModal(false);
    } catch (err: any) {
      showToast("Falha de conexão com a API: " + err.message);
    }
  };

  const openNewUserModal = () => {
    setEditingMember(null);
    setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ name: member.name, email: member.email, password: '', role: member.role, status: member.status });
    setShowModal(true);
  };

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
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
    teamEmpty: team.length === 0,
    requestDelete, confirmDelete, userToDelete, setUserToDelete,
    handleSave,
    openNewUserModal,
    openEditModal
  };
};
