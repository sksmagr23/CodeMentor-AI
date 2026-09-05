import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4" strokeWidth={2.25} />,
  error: <XCircle className="w-4 h-4" strokeWidth={2.25} />,
  info: <Info className="w-4 h-4" strokeWidth={2.25} />,
  warning: <AlertTriangle className="w-4 h-4" strokeWidth={2.25} />,
};

const ACCENT: Record<ToastType, string> = {
  success: 'bg-[#16a34a] text-white',
  error: 'bg-[#dc2626] text-white',
  info: 'bg-[#014d6f] text-ink',
  warning: 'bg-[#eab308] text-ink',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ToastItem = { duration: 3200, ...opts, id };
      setToasts((prev) => [...prev.slice(-4), item]);
      window.setTimeout(() => dismiss(id), item.duration);
    },
    [dismiss]
  );

  const api = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, message) => toast({ type: 'success', title, message }),
      error: (title, message) => toast({ type: 'error', title, message }),
      info: (title, message) => toast({ type: 'info', title, message }),
      warning: (title, message) => toast({ type: 'warning', title, message }),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(100vw-2rem,360px)] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto panel-brutal animate-slide-up-toast flex gap-3 p-3"
            role="status"
          >
            <div className={`shrink-0 w-8 h-8 flex items-center justify-center border-2 border-accent ${ACCENT[t.type]}`}>
              {ICONS[t.type]}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-ink leading-tight">{t.title}</p>
              {t.message && (
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1 hover:bg-accent-soft text-muted hover:text-accent-bright transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
