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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-400 text-xl">person_add</span>
            <span className="text-sm font-bold tracking-tight">Identificar Cliente [F9]</span>
          </div>
          <button
            onClick={() => setShowCustomerModal(false)}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono-num font-semibold text-slate-600 uppercase">
              CPF / CNPJ na Nota Fiscal
            </label>
            <input
              autoFocus
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="h-11 px-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg font-mono-num text-sm outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono-num font-semibold text-slate-600 uppercase">
              Nome do Cliente (Opcional / Clube Fidelidade)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Eduardo de Oliveira"
              className="h-11 px-3 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-base">info</span>
            O CPF será transmitido no layout oficial da NFC-e para o programa Nota Fiscal Paulista / Estadual.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCpf('');
                setName('');
                setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
                setShowCustomerModal(false);
              }}
              className="px-3 h-10 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs"
            >
              Remover Identificação
            </button>
            <button
              type="submit"
              className="px-5 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Salvar Cliente [ENTER]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
