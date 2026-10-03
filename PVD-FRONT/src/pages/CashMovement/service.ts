import { useState } from 'react';
import { usePdv } from '../../context/PdvContext';

export const useCashMovementService = () => {
  const { cashDrawer, addCashMovement, closeTurno } = usePdv();

  const [filter, setFilter] = useState<'todos' | 'sangria' | 'suprimento'>('todos');
  const [modalType, setModalType] = useState<'sangria' | 'suprimento' | null>(null);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  // Form states
  const [opValue, setOpValue] = useState<string>('');
  const [opReason, setOpReason] = useState<string>('Excesso de numerário • Cofre Central');
  const [opAuth, setOpAuth] = useState<string>('');

  const [blindCount, setBlindCount] = useState<string>('');

  // Filtered movements
  const filteredMovements = cashDrawer.movements.filter((m) => {
    if (filter === 'todos') return true;
    return m.type === filter;
  });

  const handleOpenOpModal = (type: 'sangria' | 'suprimento') => {
    setModalType(type);
    setOpValue('');
    setOpAuth('');
    setOpReason(
      type === 'sangria'
        ? 'Excesso de numerário • Cofre Central'
        : 'Reforço de cédulas e moedas'
    );
  };

  const handleSaveOp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(opValue.replace(',', '.')) || 0;
    if (val <= 0 || !modalType) return;

    addCashMovement(modalType, val, opReason, opAuth || 'Sup. Marcos Silveira');
    setModalType(null);
  };

  const handleConfirmCloseTurno = () => {
    closeTurno();
    setShowCloseModal(false);
  };

  const handlePrintExtrato = () => {
    alert('Imprimindo relatório de conferência física na impressora térmica (EPSON TM-T20).');
  };

  return {
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
  };
};
