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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        {/* Scale Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-xl">scale</span>
            <div>
              <div className="text-sm font-bold tracking-tight">Balança Toledo Prix 3 Integrada</div>
              <div className="text-[10px] font-mono-num text-emerald-300">COMUNICAÇÃO SERIAL RS232: ATIVA</div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowScaleModal(false);
              setWeighingProduct(null);
            }}
            className="text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Product Being Weighed */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-white border border-slate-200 overflow-hidden shrink-0">
            {weighingProduct?.imageUrl && (
              <img
                src={weighingProduct.imageUrl}
                alt={productName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono-num uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              PRODUTO PESÁVEL
            </span>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {productName}
            </div>
            <div className="text-xs font-mono-num text-slate-600">
              Preço por KG: <strong className="text-emerald-700 font-bold">R$ {productPrice.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>
        </div>

        {/* Big LED Weight Display */}
        <form onSubmit={handleConfirmWeighing} className="p-5 flex flex-col gap-4">
          <div className="bg-[#0f172a] rounded-xl p-4 text-center border-4 border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full text-slate-400 text-[10px] font-mono-num mb-1">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ESTÁVEL
              </span>
              <span>CAPACIDADE: 15.000 KG</span>
            </div>

            <div className="flex items-baseline justify-center gap-2">
              <input
                autoFocus
                type="text"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                placeholder="0,000"
                className="w-48 bg-transparent text-center text-4xl sm:text-5xl font-mono-num font-extrabold text-emerald-400 focus:outline-none tracking-wider"
              />
              <span className="text-2xl font-bold font-mono-num text-emerald-600">kg</span>
            </div>

            <div className="text-xs font-mono-num text-slate-400 mt-1">
              Subtotal: <strong className="text-white font-bold text-sm">R$ {calculatedTotal.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          {/* Quick preset weight buttons & Tara */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-mono-num text-slate-500 font-bold">Simular Peso:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handlePresetWeight(0.250)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono-num font-bold"
              >
                0,250 kg
              </button>
              <button
                type="button"
                onClick={() => handlePresetWeight(0.450)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono-num font-bold"
              >
                0,450 kg
              </button>
              <button
                type="button"
                onClick={() => handlePresetWeight(1.200)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono-num font-bold"
              >
                1,200 kg
              </button>
              <button
                type="button"
                onClick={handleTare}
                className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-mono-num font-bold"
              >
                TARAR
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowScaleModal(false);
                setWeighingProduct(null);
              }}
              className="px-4 h-10 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs"
            >
              Cancelar [ESC]
            </button>
            <button
              type="submit"
              className="px-5 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Inserir no Caixa [ENTER]</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
