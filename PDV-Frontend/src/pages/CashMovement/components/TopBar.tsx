import React from 'react';
import { useCashMovementService } from '../service';
import { styles } from '../style';

interface Props {
  svc: ReturnType<typeof useCashMovementService>;
}

export const TopBar: React.FC<Props> = ({ svc }) => {
  const { isAdmin, selectedCaixaId, setSelectedCaixaId, mockRegisters, currentUser, cashDrawer, setShowCloseModal } = svc;

  return (
        <div className={styles.topBar.wrapper}>
          <div className={styles.topBar.leftSection}>
            
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">admin_panel_settings</span>
                <select 
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={selectedCaixaId}
                  onChange={(e) => setSelectedCaixaId(e.target.value)}
                >
                  <option value="todos">Visão Geral (Todos os Caixas)</option>
                  <option value="local">Meu Caixa (#00) - Você</option>
                  {mockRegisters.map(r => (
                    <option key={r.id} value={r.id}>
                      Caixa #{r.number} - {r.operator}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={styles.topBar.statusBadge}>
                <span className={styles.topBar.statusIcon}>account_balance_wallet</span>
                <span className={styles.topBar.statusText}>CAIXA ABERTO</span>
              </div>
            )}

            <div className={styles.topBar.shiftInfo}>
              <span className={styles.topBar.shiftNumber}>TURNO #02</span>
              <span className={styles.topBar.shiftDot}>•</span>
              <span className={styles.topBar.operatorText}>
                Operador: <strong className={styles.topBar.operatorName}>
                  {selectedCaixaId === 'todos' ? 'Múltiplos' : 
                   selectedCaixaId === 'local' ? 'Você (Local)' : 
                   mockRegisters.find(r => r.id === selectedCaixaId)?.operator}
                </strong>
              </span>
            </div>
          </div>

          <div className={styles.topBar.rightSection}>
            <div className={styles.topBar.timeWrapper}>
              <span className={styles.topBar.timeIcon}>schedule</span>
              <div>
                <div className={styles.topBar.timeLabel}>
                  Abertura
                </div>
                <div className={styles.topBar.timeValue}>
                  {cashDrawer.openedAt 
                    ? new Date(cashDrawer.openedAt).toLocaleDateString('pt-BR') + ' • ' + new Date(cashDrawer.openedAt).toLocaleTimeString('pt-BR', { hour12: false }) 
                    : 'Hoje • 08:14:22'}
                </div>
              </div>
            </div>

            <div className={styles.topBar.fundWrapper}>
              <span className={styles.topBar.fundIcon}>savings</span>
              <div>
                <div className={styles.topBar.fundLabel}>
                  Fundo de Troco
                </div>
                <div className={styles.topBar.fundValue}>
                  R$ {cashDrawer.openingFund.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCloseModal(true)}
              className={styles.topBar.closeButton}
            >
              <span className={styles.topBar.closeIcon}>lock</span>
              <span className={styles.topBar.closeText}>
                Encerrar Turno
              </span>
            </button>
          </div>
        </div>
  );
};
