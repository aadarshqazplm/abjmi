import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent scrolling on the body when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      
      {/* Darkened Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-red-950">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable if content is long) */}
        <div className="overflow-y-auto p-6">
          {children}
        </div>
        
      </div>
    </div>
  );
}