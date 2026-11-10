import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-600',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-rose-600',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-600',
      icon: Info,
    },
  };

  const { bg, icon: Icon } = typeConfig[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`${bg} text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-md border border-white/20`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-xs font-semibold leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors ml-auto"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};
