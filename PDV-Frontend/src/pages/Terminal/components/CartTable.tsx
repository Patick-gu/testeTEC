import React from 'react';
import { useTerminalService } from '../service';
import { styles } from '../style';


interface Props {
  svc: ReturnType<typeof useTerminalService>;
}

export const CartTable: React.FC<Props> = ({ svc }) => {
  const {
    cart,
    lastScannedItem,
    requestRemoveItem,
    updateItemQuantity,
    totalQuantity,
  } = svc;

  return (
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
                    {item.unitPrice < item.product.price ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-[10px] text-slate-400 line-through">
                          R$ {item.product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1 rounded">
                          Atacado
                        </span>
                      </div>
                    ) : (
                      <>R$ {item.unitPrice.toFixed(2).replace('.', ',')}</>
                    )}
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
  );
};
