import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ToastTone = 'default' | 'success' | 'danger';
interface ToastItem { id: number; message: string; tone: ToastTone; action?: { label: string; onClick: () => void } }

interface ToastApi {
  show: (message: string, opts?: { tone?: ToastTone; action?: ToastItem['action'] }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback<ToastApi['show']>((message, opts) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone: opts?.tone ?? 'default', action: opts?.action }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm shadow-pop animate-scale-in',
              t.tone === 'danger' ? 'bg-danger text-white' : t.tone === 'success' ? 'bg-success text-white' : 'bg-ink text-white'
            )}
          >
            <span className="font-medium">{t.message}</span>
            {t.action && (
              <button
                className="shrink-0 font-semibold text-brand-200 underline"
                onClick={() => { t.action?.onClick(); setItems((prev) => prev.filter((x) => x.id !== t.id)); }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
