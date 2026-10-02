import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs transition-all animate-in slide-in-from-bottom-2 ${
        toast.type === 'success'
          ? 'bg-emerald-900/95 text-white border-emerald-700/60 shadow-emerald-950/20'
          : toast.type === 'error'
          ? 'bg-rose-900/95 text-white border-rose-700/60 shadow-rose-950/20'
          : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/20'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-100">{toast.title}</p>
        {toast.message && <p className="text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
