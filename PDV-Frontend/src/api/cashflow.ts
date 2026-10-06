import { api } from './api';

export const CashflowService = {
  // Turno
  getCurrentShift: async () => {
    const response = await api.get('/caixa/turno-atual');
    return response.data;
  },
  openShift: async (data: any) => {
    const response = await api.post('/caixa/abrir', data);
    return response.data;
  },
  closeShift: async (data: any) => {
    const response = await api.post('/caixa/fechar', data);
    return response.data;
  },

  // Status & Movimentações
  getStatusAll: async () => {
    const response = await api.get('/caixa/status/all');
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/caixa/status');
    return response.data;
  },
  getMovements: async () => {
    const response = await api.get('/caixa/movimentacoes');
    return response.data;
  },
  createMovement: async (data: any) => {
    const response = await api.post('/caixa/movimentacoes', data);
    return response.data;
  }
};
