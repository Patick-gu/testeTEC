import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 min-w-[280px] bg-white border border-slate-200/60 shadow-lg rounded-xl p-4 animate-[slideInRight_0.3s_ease-out_forwards] pointer-events-auto transition-all"
          >
            {toast.type === 'success' && (
              <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-lg text-lg">
                check_circle
              </span>
            )}
            {toast.type === 'error' && (
              <span className="material-symbols-outlined text-red-500 bg-red-50 p-1.5 rounded-lg text-lg">
                error
              </span>
            )}
            {toast.type === 'info' && (
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg text-lg">
                info
              </span>
            )}
            <p className="text-sm font-medium text-slate-700">{toast.message}</p>
          </div>
        ))}
      </div>
      
      {/* Adicionando keyframes dinamicamente para garantir a animação mesmo se não tiver no tailwind config */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
