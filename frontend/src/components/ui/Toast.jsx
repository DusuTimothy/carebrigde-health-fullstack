import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import cn from '../../lib/cn.js';

const ToastContext = createContext({ push: () => {}, dismiss: () => {} });

const icons = { success: CheckCircle2, info: Info, warning: AlertTriangle, danger: XCircle };
const accents = {
  success: 'border-l-success-solid',
  info: 'border-l-accent',
  warning: 'border-l-warning-solid',
  danger: 'border-l-danger-solid',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (title, msg, tone = 'success', opts = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((t) => [...t, { id, title, msg, tone }]);
      const duration = opts.duration ?? 4200;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div aria-live="polite" className="fixed right-4 top-4 z-[700] flex max-w-[400px] flex-col gap-3">
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'flex items-start gap-3 rounded-lg border border-line border-l-4 bg-surface-raised p-4 shadow-md animate-toast-in',
                accents[t.tone]
              )}
            >
              <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.msg && <p className="mt-0.5 text-sm text-ink-secondary">{t.msg}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}