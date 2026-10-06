import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePdv } from '../../context/PdvContext';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'off';
  created_at?: string;
}

export const useTeamService = () => {
  const { token } = useAuth();
  const { showToast } = usePdv();
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

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Falha ao buscar equipe no banco de dados');
      const data = await res.json();
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
      const res = await fetch(`${API_URL}/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Erro ao deletar usuário no servidor');
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
      const url = editingMember ? `${API_URL}/users/${editingMember.id}` : `${API_URL}/users`;
      const method = editingMember ? 'PUT' : 'POST';
      
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // backend valida password conditionally

      const res = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao salvar os dados no servidor');
      }

      const savedUser = await res.json();
      
      if (editingMember) {
        setTeam(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
      } else {
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
