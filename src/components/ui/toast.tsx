"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: Toast["type"], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const icons = {
  success: { icon: Check, bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-600" },
  error: { icon: X, bg: "bg-red-50", border: "border-red-200", color: "text-red-600" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-600" },
  info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", color: "text-blue-600" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success", duration = 3000) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = icons[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg bg-white min-w-[300px] animate-slide-in ${config.border}`}>
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>

      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
