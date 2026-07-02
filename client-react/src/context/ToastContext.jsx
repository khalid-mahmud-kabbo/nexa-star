import { createContext, useContext, useCallback, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  info: 'border-purple-400/40 bg-purple-500/10 text-purple-100',
  success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  error: 'border-red-400/40 bg-red-500/10 text-red-100'
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`panel px-4 py-3 text-sm shadow-lg ${STYLES[t.type] || STYLES.info}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
