import { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Handle overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-lg shadow-xl">
            <div className="p-6">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4 pr-8">{title}</h2>
              <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
