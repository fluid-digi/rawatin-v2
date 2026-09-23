import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/** Clearly marks simulated behaviour so the demo is never mistaken for real transactions. */
export function MockNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'flex items-start gap-1.5 rounded-xl bg-page px-3 py-2 text-xs text-ink-soft',
        className
      )}
    >
      <span aria-hidden>🧪</span>
      <span>{children}</span>
    </p>
  );
}
