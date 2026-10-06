import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const LedgerTable: React.FC<Props> = ({ svc }) => {
  const { filter, setFilter, filteredMovements, handlePrintExtrato } = svc;

  return (
            <>
            <div className={styles.ledger.header}>
              <div>
                <div className={styles.ledger.titleWrapper}>
                  <span className={styles.ledger.title}>Extrato Operacional da Gaveta</span>
                  <span className={styles.ledger.badge}>
                    TEMPO REAL
                  </span>
                </div>
                <p className={styles.ledger.desc}>
                  Histórico auditado de aberturas, reforços, sangrias e operações manuais
                </p>
              </div>

              <div className={styles.ledger.filterWrapper}>
                {(['todos', 'sangria', 'suprimento'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`${styles.ledger.filterBtnBase} ${
                      filter === t
                        ? styles.ledger.filterBtnActive
                        : styles.ledger.filterBtnInactive
                    }`}
                  >
                    {t === 'todos' ? 'Todos' : t === 'sangria' ? 'Sangrias' : 'Suprimentos'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.ledger.tableWrapper}>
              <table className={styles.ledger.table}>
                <thead>
                  <tr className={styles.ledger.thead}>
                    <th className={styles.ledger.thLeft}>Horário</th>
                    <th className={styles.ledger.th}>Tipo / Descrição</th>
                    <th className={styles.ledger.th}>Motivo / Documento</th>
                    <th className={styles.ledger.th}>Método Pgto</th>
                    <th className={styles.ledger.th}>Operador / Autorizador</th>
                    <th className={styles.ledger.thRight}>Valor</th>
                  </tr>
                </thead>
                <tbody className={styles.ledger.tbody}>
                  {filteredMovements.map((mov) => {
                    const isSangria = mov.type === 'sangria';
                    const isAbertura = mov.type === 'abertura';
                    const corDot = isSangria ? 'bg-rose-500' : isAbertura ? 'bg-blue-600' : 'bg-emerald-500';
                    const corTexto = isSangria ? 'text-rose-600' : isAbertura ? 'text-blue-700' : 'text-emerald-700';
                    
                    const pMap: Record<string, string> = { cash: 'Dinheiro', pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', credit: 'Crédito', debit: 'Débito' };
                    const pmLabel = mov.paymentMethod ? pMap[mov.paymentMethod] || mov.paymentMethod : '-';

                    const sinal = isSangria ? '- ' : '+ ';

                    return (
                      <tr key={mov.id} className={styles.ledger.tr}>
                        <td className={styles.ledger.tdTime}>
                          {mov.time}
                        </td>
                        <td className={styles.ledger.tdType}>
                          <div className={styles.ledger.typeWrapper}>
                            <span className={`w-2 h-2 rounded-full ${corDot}`}></span>
                            <span className={`font-semibold ${corTexto}`}>
                              {mov.title}
                            </span>
                          </div>
                          <span className={styles.ledger.docRef}>
                            {mov.documentRef}
                          </span>
                        </td>
                        <td className={styles.ledger.tdReason}>
                          {mov.reason}
                        </td>
                        <td className={styles.ledger.tdType}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {pmLabel}
                          </span>
                        </td>
                        <td className={styles.ledger.tdOperator}>
                          <div className={styles.ledger.operatorName}>{mov.operator}</div>
                          <span className={styles.ledger.operatorAuth}>{mov.authorizer}</span>
                        </td>
                        <td className={`${styles.ledger.tdAmountBase} ${corTexto}`}>
                          {sinal}R$ {mov.amount.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMovements.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.ledger.emptyTr}>
                        Nenhum registro encontrado para este filtro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.ledger.footer}>
              <span>Exibindo {filteredMovements.length} registros do turno atual</span>
              <button
                type="button"
                onClick={handlePrintExtrato}
                className={styles.ledger.printBtn}
              >
                <span className={styles.ledger.printIcon}>print</span>
                <span>Reimprimir Extrato Físico (Bobina)</span>
              </button>
            </div>
            </>
  );
};
