import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 h-8 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        active
          ? 'bg-brand-500 text-white border border-brand-500'
          : 'bg-white text-ink-soft border border-line hover:border-brand-300 hover:text-brand-600',
        className
      )}
      {...rest}
    />
  );
}
