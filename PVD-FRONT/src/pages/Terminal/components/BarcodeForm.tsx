import React from 'react';
import { useTerminalService } from '../service';

declare const styles: Record<string, string>;

interface Props {
  svc: ReturnType<typeof useTerminalService>;
}

export const BarcodeForm: React.FC<Props> = ({ svc }) => {
  const {
    barcodeInput,
    setBarcodeInput,
    setIsDropdownOpen,
    handleSearchKeyDown,
    isDropdownOpen,
    isLoadingProducts,
    filteredProducts,
    selectedIndex,
    setSelectedIndex,
    selectProduct,
    handleBarcodeSubmit,
    inputRef,
  } = svc;

  return (
    <form onSubmit={handleBarcodeSubmit} className={styles.barcodeForm}>
      <div className={styles.barcodeIconWrapper}>
        <span className="material-symbols-outlined text-slate-400">search</span>
      </div>

      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={barcodeInput}
          onChange={(e) => {
            setBarcodeInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Busque por nome ou código do produto [F3]"
          className={styles.barcodeInput}
        />
        
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
            {isLoadingProducts ? (
              <div className="p-5 text-center text-slate-500">Carregando produtos...</div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className={`flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer transition-colors ${index === selectedIndex ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => selectProduct(product)}
                >
                  <div>
                    <p className="text-base font-bold text-slate-800">{product.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Cód: {product.code}</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-5 text-center text-slate-500">Nenhum produto encontrado.</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.barcodeActions}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsDropdownOpen(prev => !prev)}
          className={styles.btnSearch}
        >
          BUSCAR
        </button>
      </div>
    </form>
  );
};
