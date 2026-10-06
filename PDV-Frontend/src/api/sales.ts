import { api } from './api';

export const SaleService = {
  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },
  getById: async (id: string | number) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/sales', data);
    return response.data;
  }
};
