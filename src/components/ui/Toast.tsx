"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ─── Individual Toast Item ────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-[#108043] shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-[#005bd3] shrink-0" />,
  };

  const borders = {
    success: "border-green-100 bg-white",
    error: "border-red-100 bg-white",
    info: "border-blue-100 bg-white",
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-lg shadow-black/5 backdrop-blur-sm",
        "animate-in slide-in-from-bottom-2 fade-in duration-300",
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <p className="text-[12px] font-bold text-[#1a1a1a] flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#6d7175] hover:text-[#1a1a1a] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Provider + Container ─────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed bottom-center, above Floating Action Bar */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center space-y-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center space-y-2">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
