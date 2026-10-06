import React, { useState } from 'react';
import { usePdv } from '../../context/PdvContext';

export const CustomerModal: React.FC = () => {
  const { showCustomerModal, setShowCustomerModal, customer, setCustomer, showToast } = usePdv();
  const [cpf, setCpf] = useState<string>(customer.cpf);
  const [name, setName] = useState<string>(customer.name.startsWith('Consumidor') ? '' : customer.name);

  if (!showCustomerModal) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.trim()) {
      setCustomer({
        cpf: cpf.trim(),
        name: name.trim() || `Consumidor (CPF ${cpf.trim()})`
      });
      showToast(`Cliente vinculado: CPF ${cpf.trim()}`);
    } else {
      setCustomer({
        cpf: '',
        name: 'Consumidor Final (CPF não informado)'
      });
      showToast('Consumidor final selecionado');
    }
    setShowCustomerModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-md w-full flex flex-col animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Identificar Cliente [F9]</h2>
              <p className="text-xs text-slate-400">Vincule um cliente à venda</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomerModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-800">
              CPF / CNPJ na Nota Fiscal
            </label>
            <input
              autoFocus
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="h-11 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Nome do Cliente (Opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Eduardo de Oliveira"
              className="h-11 px-3 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCpf('');
                setName('');
                setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
                setShowCustomerModal(false);
              }}
              className="px-4 h-11 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 rounded-xl font-medium text-sm transition-colors"
            >
              Remover
            </button>
            <button
              type="submit"
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Salvar [ENTER]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
