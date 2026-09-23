import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, action, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-pop animate-sheet-up',
          'sm:rounded-3xl',
          'pb-[max(1.25rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        {(title || action) && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
