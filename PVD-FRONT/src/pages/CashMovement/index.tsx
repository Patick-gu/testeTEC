import React from 'react';
import { useCashMovementService } from './service';
import { styles } from './style';

export const CashMovementScreen: React.FC = () => {
  const {
    cashDrawer,
    filter,
    setFilter,
    modalType,
    setModalType,
    showCloseModal,
    setShowCloseModal,
    opValue,
    setOpValue,
    opReason,
    setOpReason,
    opAuth,
    setOpAuth,
    blindCount,
    setBlindCount,
    filteredMovements,
    handleOpenOpModal,
    handleSaveOp,
    handleConfirmCloseTurno,
    handlePrintExtrato,
    isAdmin,
    mockRegisters,
    selectedCaixaId,
    setSelectedCaixaId
  } = useCashMovementService();

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        
        {/* Top Shift Context Bar */}
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
                  Hoje • 08:14:22
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

        {/* 4 Metrics Cards Grid matching Screenshot 4 */}
        <div className={styles.metrics.grid}>
          
          {/* Card 1: Total Vendas (Turno) */}
          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Total Vendas (Turno)
              </span>
              <span className={styles.metrics.iconWrapperSales}>
                <span className={styles.metrics.icon}>trending_up</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.totalSales.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextSales}>
                <span className={styles.metrics.subtextIcon}>receipt_long</span>
                <span>{cashDrawer.salesCount} vendas concluídas</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barSales}></div>
            </div>
          </div>

          {/* Card 2: Em Dinheiro (Gaveta) */}
          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Em Dinheiro (Gaveta)
              </span>
              <span className={styles.metrics.iconWrapperCash}>
                <span className={styles.metrics.icon}>payments</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.cashInDrawer.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextCash}>
                <span>Troco (R$ 250) + Entradas</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barCash}></div>
            </div>
          </div>

          {/* Card 3: Recebimentos PIX */}
          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Recebimentos PIX
              </span>
              <span className={styles.metrics.iconWrapperPix}>
                <span className={styles.metrics.icon}>qr_code_2</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {cashDrawer.pixTotal.toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextPix}>
                <span className={styles.metrics.subtextIcon}>bolt</span>
                <span>100% compensação imediata</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barPix}></div>
            </div>
          </div>

          {/* Card 4: Cartões (Débito & Crédito) */}
          <div className={styles.metrics.card}>
            <div className={styles.metrics.header}>
              <span className={styles.metrics.title}>
                Cartões (Débito & Crédito)
              </span>
              <span className={styles.metrics.iconWrapperCard}>
                <span className={styles.metrics.icon}>contactless</span>
              </span>
            </div>

            <div>
              <div className={styles.metrics.value}>
                R$ {(cashDrawer.cardDebit + cashDrawer.cardCredit).toFixed(2).replace('.', ',')}
              </div>
              <div className={styles.metrics.subtextCard}>
                <span>Déb: R$ {cashDrawer.cardDebit.toFixed(2).replace('.', ',')}</span>
                <span>Créd: R$ {cashDrawer.cardCredit.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className={styles.metrics.barWrapper}>
              <div className={styles.metrics.barCard}></div>
            </div>
          </div>

        </div>

        {/* Split Action & Ledger Layout */}
        <div className={styles.layout.grid}>
          
          {/* Left Column (4 cols): Physical Actions, Daily Balance, Peripherals */}
          <div className={styles.layout.leftCol}>
            
            {/* Action Launcher Card */}
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

            {/* Quick Summary Breakdown Mini-Card */}
            <div className={styles.summary.card}>
              <div className={styles.summary.header}>
                <span className={styles.summary.title}>Balanço do Dia</span>
                <span className={styles.summary.icon}>verified</span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>Fundo de Abertura</span>
                <span className={styles.summary.valNeutral}>
                  R$ {cashDrawer.openingFund.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(+) Vendas em Espécie</span>
                <span className={styles.summary.valPositive}>
                  + R$ 1.230,00
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(+) Suprimentos</span>
                <span className={styles.summary.valPositive}>
                  + R$ 100,00
                </span>
              </div>

              <div className={styles.summary.row}>
                <span className={styles.summary.label}>(-) Sangrias Executadas</span>
                <span className={styles.summary.valNegative}>
                  - R$ 400,00
                </span>
              </div>

              <div className={styles.summary.totalWrapper}>
                <span className={styles.summary.totalLabel}>
                  Total Físico Esperado
                </span>
                <span className={styles.summary.totalValue}>
                  R$ {cashDrawer.cashInDrawer.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Peripherals Status */}
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

          </div>

          {/* Right Column (8 cols): Audited Ledger Table */}
          <div className={styles.layout.rightCol}>
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

              {/* Ledger filter tabs */}
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

            {/* Table */}
            <div className={styles.ledger.tableWrapper}>
              <table className={styles.ledger.table}>
                <thead>
                  <tr className={styles.ledger.thead}>
                    <th className={styles.ledger.thLeft}>Horário</th>
                    <th className={styles.ledger.th}>Tipo / Descrição</th>
                    <th className={styles.ledger.th}>Motivo / Documento</th>
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

            {/* Bottom table bar */}
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

          </div>

        </div>

      </div>

      {/* MODAL: REGISTRAR SANGRIA / SUPRIMENTO */}
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

      {/* MODAL: ENCERRAMENTO DE TURNO */}
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

    </div>
  );
};
