import React, { createContext, useContext, useState, useEffect } from 'react';
import { CashMovementRecord } from '../types/pdv';
import { CashflowService } from '../api/cashflow';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { playBeep } from '../utils/audio';

interface CashflowContextType {
  cashDrawer: {
    openedAt: string;
    openingFund: number;
    totalSales: number;
    salesCount: number;
    cashInDrawer: number;
    pixTotal: number;
    cardDebit: number;
    cardCredit: number;
    movements: CashMovementRecord[];
  };
  setCashDrawer: React.Dispatch<React.SetStateAction<any>>;
  addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string, auth?: string, targetTurnoId?: string) => Promise<boolean>;
  closeTurno: (blindCount: number) => Promise<boolean>;
}

const CashflowContext = createContext<CashflowContextType | undefined>(undefined);

export const CashflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { showToast } = useUI();
  
  const [cashDrawer, setCashDrawer] = useState({
    openedAt: '',
    openingFund: 0,
    totalSales: 0,
    salesCount: 0,
    cashInDrawer: 0,
    pixTotal: 0,
    cardDebit: 0,
    cardCredit: 0,
    movements: [] as CashMovementRecord[]
  });

  useEffect(() => {
    if (!token) return;
    CashflowService.getMovements()
    .then((data: any[]) => {
      if (Array.isArray(data)) {
        const mappedMovements = data.map(item => {
          const time = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : '';
          return {
            id: item.id,
            time: time,
            type: item.type,
            paymentMethod: item.payment_method,
            title: item.type === 'sangria' ? 'Sangria de Caixa' : item.type === 'suprimento' ? 'Suprimento' : item.type === 'entrada' ? 'Venda PDV' : 'Abertura',
            documentRef: `Recibo ${item.type === 'sangria' ? 'SG' : item.type === 'suprimento' ? 'SP' : 'VD'}-${item.id.substring(0,4)}`,
            reason: item.descricao,
            operator: user?.name || 'Sistema',
            authorizer: user?.role === 'admin' ? 'Supervisor' : 'Operador',
            amount: Number(item.valor)
          };
        });
        setCashDrawer(prev => ({ ...prev, movements: mappedMovements }));
      }
    })
    .catch(err => console.error("Erro ao buscar movimentações", err));

    CashflowService.getStatus()
    .then((data: any) => {
      if (data && typeof data.totalSales !== 'undefined') {
        setCashDrawer(prev => ({
          ...prev,
          openedAt: data.openedAt || '',
          openingFund: data.openingFund,
          totalSales: data.totalSales,
          salesCount: data.salesCount,
          cashInDrawer: data.cashInDrawer,
          pixTotal: data.pixTotal,
          cardDebit: data.cardDebit,
          cardCredit: data.cardCredit
        }));
      }
    })
    .catch(err => console.error("Erro ao buscar status do caixa", err));
  }, [token, user]);

  const addCashMovement = async (type: 'sangria' | 'suprimento', amount: number, reason: string, auth?: string, targetTurnoId?: string) => {
    try {
      const isSangria = type === 'sangria';
      const payload: any = {
        type: type,
        valor: amount,
        descricao: reason || (isSangria ? 'Transferência de segurança para Cofre' : 'Reforço de Troco Miúdo')
      };
      if (targetTurnoId) payload.turno_id = targetTurnoId;

      const data = await CashflowService.createMovement(payload);
      const item = data.data;
      const nowStr = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : new Date().toLocaleTimeString('pt-BR', { hour12: false });
      
      const newMovement: CashMovementRecord = {
        id: item.id || `mov-${Date.now()}`,
        time: nowStr,
        type,
        title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
        documentRef: `Recibo ${isSangria ? 'SG' : 'SP'}-${item.id ? item.id.substring(0,4) : Math.floor(1000 + Math.random() * 9000)}`,
        reason: item.descricao || payload.descricao,
        operator: user?.name || 'Sistema',
        authorizer: user?.role === 'admin' ? 'Supervisor' : 'Operador',
        amount: Number(item.valor || amount)
      };

      setCashDrawer((prev) => {
        const newCash = isSangria ? prev.cashInDrawer - amount : prev.cashInDrawer + amount;
        return {
          ...prev,
          cashInDrawer: Number(newCash.toFixed(2)),
          movements: [newMovement, ...prev.movements]
        };
      });

      playBeep('drawer');
      showToast(`${isSangria ? 'Sangria' : 'Suprimento'} de R$ ${amount.toFixed(2).replace('.', ',')} efetuado com sucesso!`);
      return true;
    } catch (err: any) {
      if (err.response?.data) {
        showToast(`Erro: ${err.response.data.erro || 'Falha ao registrar movimentação'}`);
      } else {
        showToast('Erro de conexão ao registrar movimentação.');
      }
      return false;
    }
  };

  const closeTurno = async (blindCount: number) => {
    try {
      await CashflowService.closeShift({ valor_fechamento_informado: blindCount });
      playBeep('success');
      showToast('Turno encerrado com sucesso. Redução Z emitida.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      return true;
    } catch (err: any) {
      if (err.response?.data) {
        showToast(err.response.data.error || 'Erro ao fechar caixa');
      } else {
        showToast('Erro de conexão ao fechar o caixa.');
      }
      return false;
    }
  };

  return (
    <CashflowContext.Provider value={{ cashDrawer, setCashDrawer, addCashMovement, closeTurno }}>
      {children}
    </CashflowContext.Provider>
  );
};

export const useCashflow = () => {
  const context = useContext(CashflowContext);
  if (!context) throw new Error('useCashflow must be used within a CashflowProvider');
  return context;
};
