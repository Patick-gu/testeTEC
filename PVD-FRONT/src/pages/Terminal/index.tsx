import React from 'react';
import { useTerminalService } from './service';
import { usePdv } from '../../context/PdvContext';
import { styles } from './style';

export const TerminalScreen: React.FC = () => {
  const { addItemByCode } = usePdv();
  const {
    cart,
    subtotal,
    discount,
    addition,
    total,
    totalQuantity,
    lastScannedItem,
    quantityMultiplier,
    setQuantityMultiplier,
    updateItemQuantity,
    clearCart,
    parkCurrentSale,
    setActiveTab,
    setShowCustomerModal,
    customer,
    startCheckout,
    showToast,
    barcodeInput,
    setBarcodeInput,
    inputRef,
    handleBarcodeSubmit,
    handleQuickPayment,
    authModal,
    requestRemoveItem,
    setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem
  } = useTerminalService();

  // Focus the quantity input of the last scanned item automatically
  React.useEffect(() => {
    if (lastScannedItem) {
      setTimeout(() => {
        const qtyInput = document.getElementById('lastItemQtyInput');
        if (qtyInput) {
          qtyInput.focus();
          // Optionally select the text so typing overwrites it
          (qtyInput as HTMLInputElement).select();
        }
      }, 50);
    }
  }, [lastScannedItem?.id]);
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          
          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>
            
            <form onSubmit={handleBarcodeSubmit} className={styles.barcodeForm}>
              <div className={styles.barcodeIconWrapper}>
                <span className={styles.barcodeIcon}>barcode_scanner</span>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escaneie o código de barras ou digite o código / F2 busca"
                className={styles.barcodeInput}
              />

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
            </form>

            {lastScannedItem && (
              <div className={styles.lastScannedContainer}>
                <div className={styles.lastScannedLeft}>
                  <div className={styles.lastScannedImgWrapper}>
                    <img
                      src={lastScannedItem.product.imageUrl}
                      alt={lastScannedItem.product.name}
                      className={styles.lastScannedImg}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={styles.lastScannedInfo}>
                    <div className={styles.lastScannedTagWrapper}>
                      <span className={styles.lastScannedTag}>ÚLTIMO BIPADO</span>
                      <span className={styles.lastScannedCode}>{lastScannedItem.product.code}</span>
                    </div>
                    <h2 className={styles.lastScannedName}>{lastScannedItem.product.name}</h2>
                  </div>
                </div>

                <div className={styles.lastScannedRight}>
                  <div className="flex items-center gap-2">
                    <input
                      id="lastItemQtyInput"
                      type="number"
                      min="0.1"
                      step={lastScannedItem.product.isWeighable ? "0.1" : "1"}
                      value={lastScannedItem.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) updateItemQuantity(lastScannedItem.id, val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          inputRef.current?.focus(); // return to barcode input
                        }
                      }}
                      className="w-20 h-10 px-2 bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg text-lg font-bold font-mono-num text-slate-800 text-center transition-all outline-none"
                    />
                    <span className={styles.lastScannedDetails}>
                      {lastScannedItem.product.unit === 'UN' ? '' : lastScannedItem.product.unit} × R$ {lastScannedItem.unitPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className={styles.lastScannedSubtotal}>
                    R$ {lastScannedItem.subtotal.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr className={styles.trHead}>
                      <th className={styles.thHash}>#</th>
                      <th className={styles.thCode}>Cód. Barras</th>
                      <th className={styles.thDesc}>Descrição do Produto</th>
                      <th className={styles.thQty}>Qtd</th>
                      <th className={styles.thPrice}>Preço Un.</th>
                      <th className={styles.thSubtotal}>Subtotal</th>
                      <th className={styles.thAction}>Ação</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tbody}>
                    {cart.map((item, index) => {
                      const isLast = lastScannedItem?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`${styles.trBodyBase} ${isLast ? styles.trBodyLast : styles.trBodyNormal}`}
                        >
                          <td className={styles.tdHash}>
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className={styles.tdCode}>
                            {item.product.code}
                          </td>
                          <td className={styles.tdDesc}>
                            <div className={styles.tdDescWrapper}>
                              <span className={styles.tdDescName}>{item.product.name}</span>
                              {isLast && (
                                <span className={styles.tdDescIcon} title="Último inserido">bolt</span>
                              )}
                            </div>
                          </td>
                          <td className={styles.tdQty}>
                            <div className={styles.tdQtyWrapper}>
                              <button
                                onClick={() => {
                                  const step = item.product.isWeighable ? 0.1 : 1;
                                  const newQty = item.quantity - step;
                                  if (newQty <= 0) {
                                    requestRemoveItem(item.id, item.product.name);
                                  } else {
                                    updateItemQuantity(item.id, newQty);
                                  }
                                }}
                                className={styles.tdQtyBtn}
                              >
                                -
                              </button>
                              <span className={`${styles.tdQtyTextBase} ${isLast ? styles.tdQtyTextLast : styles.tdQtyTextNormal}`}>
                                {item.quantity} {item.product.unit === 'UN' ? '' : item.product.unit}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + (item.product.isWeighable ? 0.1 : 1))}
                                className={styles.tdQtyBtn}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className={styles.tdPrice}>
                            R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                          </td>
                          <td className={`${styles.tdSubtotalBase} ${isLast ? styles.tdSubtotalLast : styles.tdSubtotalNormal}`}>
                            R$ {item.subtotal.toFixed(2).replace('.', ',')}
                          </td>
                          <td className={styles.tdAction}>
                            <button
                              onClick={() => requestRemoveItem(item.id, item.product.name)}
                              className={styles.tdActionBtn}
                              title="Remover item [F4]"
                            >
                              <span className={styles.tdActionIcon}>delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={7} className={styles.tdEmpty}>
                          <span className={styles.tdEmptyIcon}>shopping_cart</span>
                          Caixa livre. Bipe o primeiro item ou aperte F2 para buscar no catálogo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableBottom}>
                <div className={styles.tableBottomLeft}>
                  <span className={styles.tableBottomStat}>
                    <span className={styles.tableBottomIcon}>view_list</span>
                    Total de Itens: <strong className={styles.tableBottomStrong}>{cart.length} itens</strong>
                  </span>
                  <span>•</span>
                  <span className={styles.tableBottomStat}>
                    <span className={styles.tableBottomIcon}>inventory_2</span>
                    Volume Total: <strong className={styles.tableBottomStrong}>{totalQuantity} un</strong>
                  </span>
                </div>
                <div className={styles.tableBottomRight}>
                  <span className={styles.tableBottomRightIcon}>print</span>
                  Impressora Térmica: Pronta
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            

            <div className={styles.totalsCard}>
              <div className={styles.totalsRow}>
                <span className={styles.totalsLabel}>Subtotal Bruto</span>
                <span className={styles.totalsValueGross}>
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.totalsRow}>
                <div className={styles.totalsRowDiscountLeft}>
                  <span className={styles.totalsLabel}>Descontos / Cupons</span>
                  <span className={styles.totalsPromoTag}>PROMO</span>
                </div>
                <span className={styles.totalsValueDiscount}>
                  - R$ {discount.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.totalsRow}>
                <span className={styles.totalsLabel}>Acréscimos</span>
                <span className={styles.totalsValueAddition}>
                  + R$ {addition.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.hugeTotalCard}>
                <span className={styles.hugeTotalLabel}>VALOR TOTAL A PAGAR</span>
                <div className={styles.hugeTotalValueWrapper}>
                  <span className={styles.hugeTotalCurrency}>R$</span>
                  {total.toFixed(2).replace('.', ',')}
                </div>
                <div className={styles.hugeTotalStatus}>
                  <span className={styles.hugeTotalPulse}></span>
                  Aguardando seleção de forma de recebimento
                </div>
              </div>

              <div className={styles.quickPaymentSection}>
                <span className={styles.quickPaymentTitle}>Pagamento Rápido</span>
                <div className={styles.quickPaymentGrid}>
                  <button onClick={() => handleQuickPayment('cash')} className={styles.quickPaymentBtn}>
                    <span className={styles.quickPaymentIconCash}>payments</span>
                    <span className={styles.quickPaymentBtnLabel}>DINHEIRO</span>
                    <span className={styles.quickPaymentBtnKey}>[F5]</span>
                  </button>

                  <button onClick={() => handleQuickPayment('pix')} className={styles.quickPaymentBtn}>
                    <span className={styles.quickPaymentIconPix}>qr_code_2</span>
                    <span className={styles.quickPaymentBtnLabel}>PIX TEF</span>
                    <span className={styles.quickPaymentBtnKey}>[F6]</span>
                  </button>

                  <button onClick={() => handleQuickPayment('debit')} className={styles.quickPaymentBtn}>
                    <span className={styles.quickPaymentIconDebit}>credit_card</span>
                    <span className={styles.quickPaymentBtnLabel}>DÉBITO</span>
                    <span className={styles.quickPaymentBtnKey}>[F8]</span>
                  </button>

                  <button onClick={() => handleQuickPayment('credit')} className={styles.quickPaymentBtn}>
                    <span className={styles.quickPaymentIconCredit}>credit_score</span>
                    <span className={styles.quickPaymentBtnLabel}>CRÉDITO</span>
                    <span className={styles.quickPaymentBtnKey}>[F9]</span>
                  </button>
                </div>
              </div>

              <div className={styles.mainActionsSection}>
                <button
                  onClick={() => {
                    if (cart.length > 0) {
                      startCheckout('cash');
                    } else {
                      showToast('Adicione produtos para fechar a venda');
                    }
                  }}
                  className={styles.btnFinish}
                >
                  <div className={styles.btnFinishLeft}>
                    <span className={styles.btnFinishIcon}>check_circle</span>
                    <span>FINALIZAR VENDA</span>
                  </div>
                  <span className={styles.btnFinishKey}>F10</span>
                </button>

                <div className={styles.secondaryActionsGrid}>
                  <button
                    onClick={parkCurrentSale}
                    disabled={cart.length === 0}
                    className={styles.btnPark}
                  >
                    <span className={styles.btnParkIcon}>pause_circle</span>
                    DEIXAR EM ESPERA [F11]
                  </button>

                  <button
                    onClick={clearCart}
                    disabled={cart.length === 0}
                    className={styles.btnCancel}
                  >
                    <span className={styles.btnCancelIcon}>cancel</span>
                    CANCELAR [ESC]
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Auth Modal for Item Removal */}
      {authModal.open && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Autorização Necessária</h3>
                <p className="text-xs text-slate-400">Exclusão de item</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                Item: <strong className="text-slate-800">{authModal.itemName}</strong>
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
      )}
    </div>
  );
};
