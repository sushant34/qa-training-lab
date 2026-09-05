import React, { useEffect, useRef } from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        confirmRef.current?.focus();
      });
    }
  }, [isOpen]);

  const variantConfig = {
    danger: {
      buttonClass: 'btn-danger',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconClass: 'text-red-600 dark:text-red-400',
      Icon: AlertTriangle,
    },
    warning: {
      buttonClass: 'btn',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconClass: 'text-amber-600 dark:text-amber-400',
      Icon: AlertCircle,
    },
    info: {
      buttonClass: 'btn-primary',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600 dark:text-blue-400',
      Icon: Info,
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-full ${config.iconBg} flex-shrink-0`}>
          <config.Icon size={24} className={config.iconClass} />
        </div>
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="btn btn-outline">
          {cancelText}
        </button>
        <button
          ref={confirmRef}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn ${config.buttonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
