import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'confirm':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-800';
      case 'error':
        return 'border-red-800';
      case 'warning':
        return 'border-yellow-800';
      case 'confirm':
        return 'border-orange-800';
      default:
        return 'border-blue-800';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-zinc-950 border ${getBorderColor()} rounded-xl p-6 w-full max-w-md relative`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <X size={20} />
        </button>

        {/* Icon and content */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              type === 'error' || type === 'confirm'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : type === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-black'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
