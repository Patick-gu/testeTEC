import React, { useState } from 'react';
import { usePdv } from '../../context/PdvContext';

export const ScaleModal: React.FC = () => {
  const {
    showScaleModal,
    setShowScaleModal,
    weighingProduct,
    setWeighingProduct,
    addProductToCart,
    scaleWeight,
    setScaleWeight
  } = usePdv();

  const [inputWeight, setInputWeight] = useState<string>(
    scaleWeight > 0 ? scaleWeight.toFixed(3).replace('.', ',') : '0,450'
  );

  if (!showScaleModal) return null;

  const currentWeightNum = parseFloat(inputWeight.replace(',', '.')) || 0;
  const productPrice = weighingProduct ? weighingProduct.price : 18.50;
  const productName = weighingProduct ? weighingProduct.name : 'Pão Francês Tradicional';
  const calculatedTotal = Number((currentWeightNum * productPrice).toFixed(2));

  const handleTare = () => {
    setInputWeight('0,000');
    setScaleWeight(0.000);
  };

  const handlePresetWeight = (w: number) => {
    setInputWeight(w.toFixed(3).replace('.', ','));
    setScaleWeight(w);
  };

  const handleConfirmWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWeightNum <= 0) return;

    setScaleWeight(currentWeightNum);

    if (weighingProduct) {
      addProductToCart(weighingProduct, currentWeightNum);
    }

    setShowScaleModal(false);
    setWeighingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 max-w-md w-full flex flex-col animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-xl">scale</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Balança Integrada</h2>
              <p className="text-xs text-slate-400">Comunicação Serial Ativa</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowScaleModal(false);
              setWeighingProduct(null);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">image</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-800 truncate mb-1">
              {productName}
            </div>
            <div className="text-xs text-slate-500">
              Preço por KG: <strong className="text-slate-800">R$ {productPrice.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirmWeighing} className="flex flex-col gap-4">
          <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200/60 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full text-slate-400 text-[10px] font-mono-num mb-2">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> ESTÁVEL
              </span>
              <span>MAX: 15.000 KG</span>
            </div>

            <div className="flex items-baseline justify-center gap-2 mb-2">
              <input
                autoFocus
                type="text"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                placeholder="0,000"
                className="w-48 bg-transparent text-center text-4xl sm:text-5xl font-mono-num font-semibold text-slate-800 focus:outline-none tracking-tight"
              />
              <span className="text-xl font-medium font-mono-num text-slate-500">kg</span>
            </div>

            <div className="text-sm text-slate-500 mt-2 border-t border-slate-200/60 pt-3 w-full">
              Subtotal: <strong className="text-slate-800 font-semibold text-lg">R$ {calculatedTotal.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-medium">Simular Peso:</span>
            <div className="flex gap-2">
              {[0.250, 0.450, 1.200].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handlePresetWeight(w)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                >
                  {w.toFixed(3).replace('.', ',')}
                </button>
              ))}
              <button
                type="button"
                onClick={handleTare}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                TARAR
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowScaleModal(false);
                setWeighingProduct(null);
              }}
              className="px-4 h-11 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 rounded-xl font-medium text-sm transition-colors"
            >
              Cancelar [ESC]
            </button>
            <button
              type="submit"
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check</span>
              Inserir no Caixa [ENTER]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
