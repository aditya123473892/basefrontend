'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-900/90 border-emerald-700';
      case 'error':
        return 'bg-red-900/90 border-red-700';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700';
      default:
        return 'bg-blue-900/90 border-blue-700';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-2xl min-w-[320px] max-w-md ${getBackgroundColor()} ${
        isExiting ? 'animate-[slideOut_0.3s_ease-out]' : 'animate-[slideIn_0.3s_ease-out]'
      }`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        {message && <p className="text-slate-300 text-xs mt-1 line-clamp-2">{message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors duration-200"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}