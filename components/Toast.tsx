
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Auto dismiss after 4s
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto min-w-[300px] max-w-sm w-full border rounded-xl shadow-2xl p-4 flex items-start gap-3 transform transition-all duration-300 animate-slide-in
              ${toast.type === 'success' ? 'bg-slate-900 border-emerald-500/50' : ''}
              ${toast.type === 'error' ? 'bg-slate-900 border-rose-500/50' : ''}
              ${toast.type === 'info' ? 'bg-slate-900 border-blue-500/50' : ''}
            `}
          >
            <div className={`mt-0.5 ${
               toast.type === 'success' ? 'text-emerald-400' : 
               toast.type === 'error' ? 'text-rose-400' : 'text-blue-400'
            }`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed text-slate-100">
              {toast.message}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
