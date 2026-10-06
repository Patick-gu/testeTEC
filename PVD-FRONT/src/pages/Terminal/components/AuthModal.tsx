import React from 'react';
import { useTerminalService } from '../service';

interface Props {
  svc: ReturnType<typeof useTerminalService>;
}

export const AuthModal: React.FC<Props> = ({ svc }) => {
  const {
    authModal,
    setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem,
  } = svc;

  if (!authModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Autorização Necessária</h3>
            <p className="text-xs text-slate-400">
              {authModal.actionType === 'clear_cart' ? 'Cancelamento de Venda' : 'Exclusão de item'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-600">
            {authModal.actionType === 'clear_cart' ? 'Ação:' : 'Item:'} <strong className="text-slate-800">{authModal.itemName}</strong>
          </p>
          <input
            type="password"
            placeholder="Senha do supervisor"
            value={authModal.authInput}
            onChange={(e) => setAuthInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmRemoveItem(); }}
            className="w-full h-11 px-3 bg-slate-50 border border-slate-200/60 text-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-center tracking-widest font-mono-num"
            autoFocus
          />
          {authModal.error && (
            <span className="text-xs text-red-500 font-medium text-center">Senha incorreta.</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={cancelRemoveItem}
            className="px-4 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmRemoveItem}
            className="px-5 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
          >
            Autorizar
          </button>
        </div>
      </div>
    </div>
  );
};
