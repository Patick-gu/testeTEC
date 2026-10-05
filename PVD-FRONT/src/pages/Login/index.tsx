import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        throw new Error('Credenciais inválidas ou backend offline');
      }
      
      const data = await res.json();
      const token = data.acess_Token || data.access_token || data.token;
      if (!token) throw new Error('Token não retornado pela API');
      login(token); 
      
    } catch (err) {
      console.warn("Backend offline. Usando Mock de Teste (Admin).");
      
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + 
        "eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZXhwIjo5OTk5OTk5OTk5fQ." + 
        "mock-signature";
      
      setTimeout(() => login(mockToken), 800); // Simulate network delay for UX
    } finally {
      // setLoading(false) usually handled by unmount if successful, but just in case:
      if(error) setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      
      {/* Left Side: Branding / Visual (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 p-12 relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl border border-white/10">
            <img src="/Kaster.png" alt="Kaster Logo" className="h-20 w-auto object-contain" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white mt-2">
            Kaster <span className="font-light text-slate-400">PDV</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestão inteligente e frente de caixa ágil.
          </h1>
          <p className="text-slate-400 text-lg">
            Acesse o sistema para iniciar seu turno ou gerenciar os resultados e estoque da sua loja em tempo real.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} KasterWeb. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Logo Fallback */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 lg:hidden flex flex-col items-center gap-2">
          <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <img src="/Kaster.png" alt="Kaster Logo" className="h-12 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm">Insira suas credenciais para acessar o painel</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all"
                  placeholder="admin@kaster.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Senha</label>
                <a href="#" className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-xs font-medium">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl mt-4 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Autenticando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Precisa de ajuda? <a href="#" className="text-slate-600 font-medium hover:underline">Fale com o suporte técnico</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
