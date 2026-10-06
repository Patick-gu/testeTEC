import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
const API_URL = import.meta.env.VITE_API_URL;

export const ShiftGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [hasShift, setHasShift] = useState(false);
  const [openingFund, setOpeningFund] = useState('');

  useEffect(() => {
    if (!user || !token) return;

    if (user.role === 'admin') {
      setHasShift(true);
      setLoading(false);
      return;
    }

    const checkShift = async () => {
      try {
        const res = await fetch(`${API_URL}/caixa/turno-atual`, {
          headers: {
          'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'aberto') {
          setHasShift(true);
        } else {
          setHasShift(false);
        }
      } catch (err) {
        console.error("Erro ao checar turno:", err);
      } finally {
        setLoading(false);
      }
    };

    checkShift();
  }, [user, token]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(openingFund.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      showToast('Por favor, informe um valor de abertura válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/caixa/abrir`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valor_abertura: val })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao abrir caixa.');
      } else {
        showToast('Caixa aberto com sucesso!');
        setHasShift(true);
      }
    } catch (err) {
      showToast('Erro de conexão ao abrir caixa.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="mt-4 text-slate-500 font-medium">Verificando status do caixa...</p>
      </div>
    );
  }

  if (!hasShift && user?.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">point_of_sale</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Caixa Fechado</h2>
          <p className="text-slate-500 text-center mb-8">
            Para iniciar suas vendas, por favor informe o fundo de troco atual da sua gaveta e abra o caixa.
          </p>

          <form onSubmit={handleOpenShift} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fundo de Troco (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                <input
                  autoFocus
                  type="text"
                  required
                  value={openingFund}
                  onChange={(e) => setOpeningFund(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined">lock_open</span>
              <span>Abrir Caixa Agora</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
