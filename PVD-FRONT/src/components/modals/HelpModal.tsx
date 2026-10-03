import React from 'react';
import { usePdv } from '../../context/PdvContext';

export const HelpModal: React.FC = () => {
  const { showHelpModal, setShowHelpModal } = usePdv();

  if (!showHelpModal) return null;

  const shortcuts = [
    { key: 'F1', desc: 'Ajuda / Atalhos do Sistema de Caixa' },
    { key: 'F2', desc: 'Consulta Rápida de Produtos e Catálogo com busca' },
    { key: 'F3', desc: 'Definir Quantidade de Multiplicação (ex: 3*789...)' },
    { key: 'F4', desc: 'Cancelar / Estornar Último Item Bipado' },
    { key: 'F5', desc: 'Pagamento em Dinheiro (Sugerir Valor Exato)' },
    { key: 'F6', desc: 'Pagamento Instantâneo via PIX Dinâmico TEF' },
    { key: 'F8', desc: 'Abertura rápida de Sangria ou Suprimento de Gaveta' },
    { key: 'F9', desc: 'Identificar Cliente / Inserir CPF na Nota Fiscal' },
    { key: 'F10', desc: 'Fechar Venda / Ir para Tela de Recebimento' },
    { key: 'F11', desc: 'Deixar Venda em Espera para atender próximo cliente' },
    { key: 'F12', desc: 'Imprimir Cupom Térmico / Reimprimir Bobina' },
    { key: 'ESC', desc: 'Retornar ao Terminal Direto / Fechar Modais' },
    { key: 'ENTER', desc: 'Confirmar Ação / Inserir Produto no Carrinho' },
    { key: 'ALT + 0..5', desc: 'Filtrar Categorias Rápidas no Catálogo' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-400 text-xl">keyboard</span>
            <span className="text-sm font-bold tracking-tight">Guia de Atalhos Operacionais Nexus PDV</span>
          </div>
          <button
            onClick={() => setShowHelpModal(false)}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3 max-h-[480px] overflow-y-auto">
          <p className="text-xs text-slate-500">
            O terminal Nexus PDV foi desenhado para operação de alto rendimento com 100% de suporte a navegação por teclado e leitor de código de barras.
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="font-mono-num font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {s.key}
                </span>
                <span className="text-slate-700 font-medium text-right">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setShowHelpModal(false)}
            className="px-5 h-9 rounded-lg bg-slate-800 text-white font-mono-num text-xs font-bold hover:bg-slate-900"
          >
            Entendido [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
