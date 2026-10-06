import { api } from './api';

export const AuthService = {
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  }
};
