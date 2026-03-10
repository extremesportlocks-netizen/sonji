"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ open, onClose, title, subtitle, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full ${widths[size]} animate-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          animation: modalIn 0.15s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
