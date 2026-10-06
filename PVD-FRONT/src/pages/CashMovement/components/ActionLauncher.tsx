import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const ActionLauncher: React.FC<Props> = ({ svc }) => {
  const { handleOpenOpModal } = svc;

  return (
            <div className={styles.actions.card}>
              <div className={styles.actions.header}>
                <span className={styles.actions.title}>Operações Físicas</span>
                <span className={styles.actions.shortcut}>
                  ATALHO F8
                </span>
              </div>

              <p className={styles.actions.desc}>
                Lançamentos imediatos de retirada ou reforço com conciliação na memória fiscal.
              </p>

              <div className={styles.actions.grid}>
                <button
                  type="button"
                  onClick={() => handleOpenOpModal('sangria')}
                  className={styles.actions.btnSangria}
                >
                  <span className={styles.actions.btnIconSangria}>
                    remove_circle_outline
                  </span>
                  <span className={styles.actions.btnTitle}>Sangria</span>
                  <span className={styles.actions.btnSubSangria}>
                    Retirada (Cofre)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenOpModal('suprimento')}
                  className={styles.actions.btnSuprimento}
                >
                  <span className={styles.actions.btnIconSuprimento}>
                    add_circle_outline
                  </span>
                  <span className={styles.actions.btnTitle}>Suprimento</span>
                  <span className={styles.actions.btnSubSuprimento}>
                    Reforço de Troco
                  </span>
                </button>
              </div>
            </div>
  );
};
