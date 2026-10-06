import { useState, useEffect } from 'react';
import { useUI, useCashflow } from '../../context/index';
import { useAuth } from '../../context/AuthContext';
import { CashflowService } from '../../api/cashflow';

export const useCashMovementService = () => {
  const { showToast } = useUI();
  const { cashDrawer, addCashMovement, closeTurno } = useCashflow();
  const { user, token } = useAuth();

  const [filter, setFilter] = useState<'todos' | 'sangria' | 'suprimento'>('todos');
  const [modalType, setModalType] = useState<'sangria' | 'suprimento' | null>(null);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [selectedCaixaId, setSelectedCaixaId] = useState<string>(user?.role === 'admin' ? 'todos' : 'local');

  // Form states
  const [opValue, setOpValue] = useState<string>('');
  const [opReason, setOpReason] = useState<string>('Excesso de numerário • Cofre Central');
  const [opAuth, setOpAuth] = useState<string>('');

  const [blindCount, setBlindCount] = useState<string>('');

  const [openRegisters, setOpenRegisters] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setSelectedCaixaId('todos');
    }
  }, [user?.role]);

  const fetchOpenRegisters = async () => {
    if (user?.role !== 'admin' || !token) return;
    try {
      const data = await CashflowService.getStatusAll();
      const formattedData = data.map((reg: any) => ({
        ...reg,
        data: {
          ...reg.data,
          movements: (reg.data.movements || []).map((m: any) => ({
            id: m.id,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : '',
            type: m.type,
            paymentMethod: m.payment_method,
            title: m.type === 'sangria' ? 'Sangria de Caixa' : m.type === 'suprimento' ? 'Suprimento' : m.type === 'entrada' ? 'Venda PDV' : 'Abertura',
            documentRef: `Recibo ${m.id?.substring(0,4) || 'XX'}`,
            reason: m.descricao || 'Operação de Caixa',
            operator: m.operator || 'Sistema',
            authorizer: m.role === 'admin' ? 'Supervisor' : 'Operador',
            amount: Number(m.valor)
          }))
        }
      }));
      setOpenRegisters(formattedData);
    } catch (e) {
      console.error('Failed to fetch open registers', e);
    }
  };

  useEffect(() => {
    fetchOpenRegisters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // If viewing local (or if not admin), use real local state, else use mock selected state
  const activeDrawer = (user?.role === 'admin' && selectedCaixaId !== 'local' && selectedCaixaId !== 'todos')
    ? openRegisters.find(r => r.id === selectedCaixaId)?.data || cashDrawer
    : cashDrawer;
    
  let displayDrawer = activeDrawer;

  // Se o admin selecionar "todos", soma todos os caixas ativos
  if (user?.role === 'admin' && selectedCaixaId === 'todos') {
    const allData = [...openRegisters.map(r => r.data)];
    displayDrawer = {
      openedAt: allData.length > 0 ? allData[0].openedAt : "",
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
  const filteredMovements = displayDrawer.movements.filter((m: any) => {
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

    let targetTurnoId = undefined;
    if (user?.role === 'admin') {
        if (selectedCaixaId === 'todos' || selectedCaixaId === 'local') {
            showToast('Por favor, selecione o caixa (turno) de um operador específico na parte superior da tela.');
            return;
        }
        targetTurnoId = selectedCaixaId; // It's the turno_id from mockRegisters
    }

    addCashMovement(modalType, val, opReason, opAuth, targetTurnoId).then(async (success) => {
      if (success !== false) {
        setModalType(null);
        if (user?.role === 'admin') {
          await fetchOpenRegisters();
        }
      }
    });
  };

  const handleConfirmCloseTurno = async () => {
    if (selectedCaixaId !== 'local' && selectedCaixaId !== 'todos') {
        showToast('Ação permitida apenas no seu próprio caixa (local).');
        setShowCloseModal(false);
        return;
    }
    const val = parseFloat(blindCount.replace(',', '.')) || 0;
    const success = await closeTurno(val);
    if (success) {
      setShowCloseModal(false);
    }
  };

  const handlePrintExtrato = () => {
    showToast('Imprimindo relatório de conferência física...');
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a text input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      if (isInput) return;

      if (e.key === 'F6') {
        e.preventDefault();
        if (user?.role === 'user') {
          handleOpenOpModal('sangria');
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        setShowCloseModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user?.role]);

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
    
    isAdmin: user?.role === 'admin',
    currentUser: user,
    mockRegisters: openRegisters,
    selectedCaixaId,
    setSelectedCaixaId
  };
};
