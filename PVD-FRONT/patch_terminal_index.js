const fs = require('fs');

const path = 'src/pages/Terminal/index.tsx';
let code = fs.readFileSync(path, 'utf8');

// We need to destructure the new variables from useTerminalService()
const hookRegex = /const {\s*cart,/m;
const hookReplacement = `const {
    products,
    filteredProducts,
    isDropdownOpen,
    setIsDropdownOpen,
    isLoadingProducts,
    selectProduct,
    cart,`;

code = code.replace(hookRegex, hookReplacement);

// We need to change the input to have a dropdown
const formRegex = /<form onSubmit=\{handleBarcodeSubmit\} className=\{styles\.barcodeForm\}>[\s\S]*?<\/form>/;
const formReplacement = `<form onSubmit={handleBarcodeSubmit} className={styles.barcodeForm}>
              <div className={styles.barcodeIconWrapper}>
                <span className={styles.barcodeIcon}>barcode_scanner</span>
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
                  placeholder="Busque por nome ou código do produto..."
                  className={styles.barcodeInput}
                />
                
                {isDropdownOpen && barcodeInput.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {isLoadingProducts ? (
                      <div className="p-4 text-center text-sm text-slate-500">Carregando produtos...</div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product.id}
                          className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                          onClick={() => selectProduct(product)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-500">Cód: {product.code}</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">Nenhum produto encontrado.</div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.barcodeActions}>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalogo')}
                  className={styles.btnSearch}
                >
                  F2 BUSCA
                </button>

                <button type="submit" className={styles.btnEnter}>
                  ENTER
                </button>

                <div className={styles.qtyControl}>
                  <span className={styles.qtyLabel}>QTD [F3]</span>
                  <button
                    type="button"
                    onClick={() => setQuantityMultiplier(Math.max(1, quantityMultiplier - 1))}
                    className={styles.qtyBtnMinus}
                  >
                    -
                  </button>
                  <span className={styles.qtyValue}>{quantityMultiplier}</span>
                  <button
                    type="button"
                    onClick={() => setQuantityMultiplier(quantityMultiplier + 1)}
                    className={styles.qtyBtnPlus}
                  >
                    +
                  </button>
                </div>
              </div>
            </form>`;

code = code.replace(formRegex, formReplacement);

fs.writeFileSync(path, code);
