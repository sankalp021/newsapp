import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Close if clicking outside of modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={handleBackdropClick}
    >
      <div 
        className="animate-fade-up bg-black border border-white/20 rounded-lg shadow-modal w-full max-w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto"
        ref={modalRef}
      >
        <div className="sticky top-0 z-10 bg-black border-b border-white/10 flex justify-between items-center p-3 sm:p-4">
          {title && <h2 className="text-xl sm:text-2xl font-bold heading">{title}</h2>}
          <button 
            onClick={onClose}
            className="ml-auto rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
