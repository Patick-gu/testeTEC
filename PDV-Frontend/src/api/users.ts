import { api } from './api';

export const UserService = {
  getAll: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
