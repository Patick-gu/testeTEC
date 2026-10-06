import { api } from './api';
import { Product } from '../types/pdv';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/produtos');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/produtos', data);
    return response.data;
  },
  update: async (id: string | number, data: any) => {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data;
  },
  delete: async (id: string | number) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },
  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/produtos/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  }
};
