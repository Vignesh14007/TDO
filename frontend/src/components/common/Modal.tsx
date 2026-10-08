import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-[1px]">
      <div
        className="w-full max-w-lg bg-white dark:bg-tdo-dark-surface rounded border border-tdo-border dark:border-tdo-dark-border shadow-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden text-tdo-primary dark:text-tdo-dark-primary"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-tdo-border dark:border-tdo-dark-border">
          <h3 className="text-base font-semibold text-tdo-primary dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-tdo-secondary dark:text-tdo-dark-secondary hover:text-tdo-primary dark:hover:text-white p-1 rounded hover:bg-tdo-surface dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
