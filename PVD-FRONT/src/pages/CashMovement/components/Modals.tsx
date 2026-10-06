import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const Modals: React.FC<Props> = ({ svc }) => {
  const {
    modalType, setModalType,
    showCloseModal, setShowCloseModal,
    opValue, setOpValue,
    opReason, setOpReason,
    opAuth, setOpAuth,
    blindCount, setBlindCount,
    handleSaveOp,
    handleConfirmCloseTurno,
    cashDrawer
  } = svc;

  return (
    <>
      {modalType && (
        <div className={styles.modal.overlay}>
          <div className={styles.modal.box}>
            <div className={styles.modal.header}>
              <div className={styles.modal.headerLeft}>
                <span
                  className={
                    modalType === 'sangria'
                      ? styles.modal.iconWrapperSangria
                      : styles.modal.iconWrapperSuprimento
                  }
                >
                  <span className={styles.modal.icon}>
                    {modalType === 'sangria' ? 'remove_circle' : 'add_circle'}
                  </span>
                </span>
                <div>
                  <h3 className={styles.modal.title}>
                    {modalType === 'sangria' ? 'Registrar Sangria' : 'Registrar Suprimento'}
                  </h3>
                  <div className={styles.modal.desc}>
                    {modalType === 'sangria'
                      ? 'Retirada física de cédulas para segurança'
                      : 'Aporte de troco ou reforço de caixa'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className={styles.modal.closeBtn}
              >
                <span className={styles.modal.closeBtnIcon}>close</span>
              </button>
            </div>

            <form onSubmit={handleSaveOp} className={styles.modal.form}>
              <div className={styles.modal.fieldGroup}>
                <label className={styles.modal.label}>
                  Valor da Operação (R$)
                </label>
                <div className={styles.modal.inputWrapper}>
                  <span className={styles.modal.currencySymbol}>R$</span>
                  <input
                    autoFocus
                    type="text"
                    required
                    value={opValue}
                    onChange={(e) => setOpValue(e.target.value)}
                    placeholder="0,00"
                    className={styles.modal.inputLarge}
                  />
                </div>
              </div>

              <div className={styles.modal.fieldGroup}>
                <label className={styles.modal.label}>
                  Motivo / Justificativa
                </label>
                <select
                  value={opReason}
                  onChange={(e) => setOpReason(e.target.value)}
                  className={styles.modal.select}
                >
                  <option value="Excesso de numerário • Cofre Central">
                    Excesso de numerário • Cofre Central
                  </option>
                  <option value="Pagamento de fornecedor local">
                    Pagamento de fornecedor local
                  </option>
                  <option value="Reforço de cédulas/moedas">
                    Reforço de troco miúdo
                  </option>
                  <option value="Outro motivo operacional">
                    Outro motivo operacional
                  </option>
                </select>
              </div>

              <div className={styles.modal.fieldGroup}>
                <label className={styles.modal.label}>
                  Senha ou Matrícula Supervisor
                </label>
                <input
                  type="password"
                  required
                  value={opAuth}
                  onChange={(e) => setOpAuth(e.target.value)}
                  placeholder="Código do supervisor (ex: 1234)"
                  className={styles.modal.inputNormal}
                />
              </div>

              <div className={styles.modal.footer}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className={styles.modal.btnCancel}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    modalType === 'sangria'
                      ? styles.modal.btnConfirmSangria
                      : styles.modal.btnConfirmSuprimento
                  }
                >
                  <span className={styles.modal.btnConfirmIcon}>done</span>
                  <span>
                    {modalType === 'sangria' ? 'Confirmar Sangria' : 'Confirmar Suprimento'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className={styles.modal.overlay}>
          <div className={styles.modal.box}>
            <div className={styles.modal.header}>
              <div className={styles.modal.headerLeft}>
                <span className={styles.modal.iconWrapperClose}>
                  <span className={styles.modal.icon}>lock</span>
                </span>
                <div>
                  <h3 className={styles.modal.title}>Encerrar Turno e Caixa</h3>
                  <div className={styles.modal.desc}>
                    Terminal POS-01-SP • Operador Juliana Costa
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className={styles.modal.closeBtn}
              >
                <span className={styles.modal.closeBtnIcon}>close</span>
              </button>
            </div>

            <div className={styles.modal.summaryBox}>
              <div className={styles.modal.summaryRow}>
                <span>Saldo em Gaveta Esperado:</span>
                <span className={styles.modal.summaryValSuccess}>
                  R$ {cashDrawer.cashInDrawer.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.modal.summaryRow}>
                <span>Total Acumulado Não-Fiscal:</span>
                <span className={styles.modal.summaryValNeutral}>
                  R$ {cashDrawer.totalSales.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.modal.summaryNote}>
                A impressão da Redução Z / Fechamento de Caixa será emitida automaticamente pela impressora térmica cadastrada.
              </div>
            </div>

            <div className={styles.modal.fieldGroup}>
              <label className={styles.modal.label}>
                Contagem Física da Gaveta (Conferência Cega)
              </label>
              <input
                type="text"
                value={blindCount}
                onChange={(e) => setBlindCount(e.target.value)}
                placeholder="R$ 0,00"
                className={styles.modal.inputBlind}
              />
            </div>

            <div className={styles.modal.footer}>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className={styles.modal.btnCancel}
              >
                Voltar ao Terminal
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseTurno}
                className={styles.modal.btnConfirmClose}
              >
                Emitir Fechamento (Redução Z)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
