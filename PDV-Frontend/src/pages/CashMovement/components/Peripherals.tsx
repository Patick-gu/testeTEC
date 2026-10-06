import React from 'react';
import { styles } from '../style';

export const Peripherals: React.FC = () => {
  return (
            <div className={styles.peripherals.card}>
              <span className={styles.peripherals.title}>
                Periféricos & Conexões
              </span>

              <div className={styles.peripherals.grid}>
                <div className={styles.peripherals.item}>
                  <span className={styles.peripherals.dotActive}></span>
                  <span className={styles.peripherals.textActive}>
                    Gaveta Impressora
                  </span>
                </div>

                <div className={styles.peripherals.item}>
                  <span className={styles.peripherals.dotActive}></span>
                  <span className={styles.peripherals.textActive}>
                    PINPad / TEF
                  </span>
                </div>

                <div className={styles.peripherals.item}>
                  <span className={styles.peripherals.dotActive}></span>
                  <span className={styles.peripherals.textActive}>
                    NFC-e / SAT Sefaz
                  </span>
                </div>

                <div className={styles.peripherals.item}>
                  <span className={styles.peripherals.dotInactive}></span>
                  <span className={styles.peripherals.textInactive}>
                    Balança (Inativa)
                  </span>
                </div>
              </div>
            </div>
  );
};
