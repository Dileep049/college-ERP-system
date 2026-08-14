import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts = [], removeToast } = useAuth();

  if (!toasts || !Array.isArray(toasts) || toasts.length === 0) return null;

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 shadow-emerald-100/10';
      case 'error':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 shadow-rose-100/10';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 shadow-amber-100/10';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-250 shadow-blue-100/10';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-emerald-500" size={18} />;
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
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg pointer-events-auto transform translate-y-0 transition-all duration-300 animate-slide-up ${getToastStyle(
            toast.type
          )}`}
        >
          <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 p-0.5 rounded-lg hover:bg-slate-500/10 transition-colors"
          >
            <X size={14} className="opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
};
export default ToastContainer;
