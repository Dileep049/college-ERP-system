import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts = [], removeToast } = useAuth();

  if (!toasts || !Array.isArray(toasts) || toasts.length === 0) return null;

  const getToastClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10';
      case 'error':
        return 'bg-rose-500/10 dark:bg-rose-950/60 border-rose-500/40 text-rose-900 dark:text-rose-100 shadow-rose-500/10';
      case 'warning':
        return 'bg-amber-500/10 dark:bg-amber-950/60 border-amber-500/40 text-amber-900 dark:text-amber-100 shadow-amber-500/10';
      case 'info':
      default:
        return 'bg-blue-500/10 dark:bg-blue-950/60 border-blue-500/40 text-blue-900 dark:text-blue-100 shadow-blue-500/10';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'error':
        return <XCircle className="text-rose-500" size={18} />;
      case 'warning':
        return <AlertCircle className="text-amber-500" size={18} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto transform transition-all duration-300 animate-slide-up ${getToastClasses(
            toast.type
          )}`}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 text-xs font-bold leading-relaxed">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={14} className="opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
};
export default ToastContainer;
