import axios from 'axios';

// Cria a instância base do Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição (Antes de enviar para a API)
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const storedAuth = localStorage.getItem('token');
    if (storedAuth) {
      try {
        const token = storedAuth;
        if (token && config.headers) {
          // Injeta o token em TODAS as requisições automaticamente
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Ignora erro de parse silenciosamente
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta (Quando a API devolve o dado)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global para Token Expirado (401)
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado ou inválido. Deslogando usuário...');
      // Limpa o estado local
      localStorage.removeItem('token');
      // Força um recarregamento da página para limpar o estado em memória (ou redireciona para /login)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
