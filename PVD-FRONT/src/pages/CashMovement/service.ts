import { useState } from 'react';
import { usePdv } from '../../context/PdvContext';
import { useAuth } from '../../context/AuthContext';

export const useCashMovementService = () => {
  const { cashDrawer, addCashMovement, closeTurno, showToast } = usePdv();
  const { user } = useAuth();

  const [filter, setFilter] = useState<'todos' | 'sangria' | 'suprimento'>('todos');
  const [modalType, setModalType] = useState<'sangria' | 'suprimento' | null>(null);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [selectedCaixaId, setSelectedCaixaId] = useState<string>('local');

  // Form states
  const [opValue, setOpValue] = useState<string>('');
  const [opReason, setOpReason] = useState<string>('Excesso de numerário • Cofre Central');
  const [opAuth, setOpAuth] = useState<string>('');

  const [blindCount, setBlindCount] = useState<string>('');

  // Mock for admin to see multiple open registers
  const mockRegisters = [
    { id: 'caixa-01', operator: 'João Silva', number: '01', data: { openingFund: 150, totalSales: 850.5, salesCount: 12, cashInDrawer: 300, pixTotal: 300, cardDebit: 200, cardCredit: 50.5, movements: [] } },
    { id: 'caixa-02', operator: 'Maria Fernandes', number: '02', data: { openingFund: 200, totalSales: 1420.0, salesCount: 35, cashInDrawer: 650, pixTotal: 400, cardDebit: 200, cardCredit: 170, movements: [] } },
  ];

  // If viewing local (or if not admin), use real local state, else use mock selected state
  const activeDrawer = (user?.role === 'admin' && selectedCaixaId !== 'local' && selectedCaixaId !== 'todos')
    ? mockRegisters.find(r => r.id === selectedCaixaId)?.data || cashDrawer
    : cashDrawer;
    
  let displayDrawer = activeDrawer;

  // Se o admin selecionar "todos", soma todos os caixas ativos + o local (para simular consolidação)
  if (user?.role === 'admin' && selectedCaixaId === 'todos') {
    const allData = [cashDrawer, ...mockRegisters.map(r => r.data)];
    displayDrawer = {
      openingFund: allData.reduce((acc, curr) => acc + curr.openingFund, 0),
      totalSales: allData.reduce((acc, curr) => acc + curr.totalSales, 0),
      salesCount: allData.reduce((acc, curr) => acc + curr.salesCount, 0),
      cashInDrawer: allData.reduce((acc, curr) => acc + curr.cashInDrawer, 0),
      pixTotal: allData.reduce((acc, curr) => acc + curr.pixTotal, 0),
      cardDebit: allData.reduce((acc, curr) => acc + curr.cardDebit, 0),
      cardCredit: allData.reduce((acc, curr) => acc + curr.cardCredit, 0),
      movements: allData.flatMap(curr => curr.movements)
    };
  }

  // Filtered movements
  const filteredMovements = displayDrawer.movements.filter((m) => {
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

    if (selectedCaixaId !== 'local' && selectedCaixaId !== 'todos') {
        showToast('Ação permitida apenas no seu próprio caixa (local).');
        setModalType(null);
        return;
    }

    addCashMovement(modalType, val, opReason, opAuth || 'Sup. Marcos Silveira').then((success) => {
      if (success !== false) setModalType(null);
    });
  };

  const handleConfirmCloseTurno = () => {
    if (selectedCaixaId !== 'local' && selectedCaixaId !== 'todos') {
        showToast('Ação permitida apenas no seu próprio caixa (local).');
        setShowCloseModal(false);
        return;
    }
    closeTurno();
    setShowCloseModal(false);
  };

  const handlePrintExtrato = () => {
    showToast('Imprimindo relatório de conferência física...');
  };

  return {
    cashDrawer: displayDrawer,
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
    
    // New exports for admin
    isAdmin: user?.role === 'admin',
    mockRegisters,
    selectedCaixaId,
    setSelectedCaixaId
  };
};
