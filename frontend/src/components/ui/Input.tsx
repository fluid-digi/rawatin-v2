import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, leading, trailing, className, id, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <span
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white px-3 h-11 transition-colors',
          'focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400',
          error ? 'border-danger' : 'border-line'
        )}
      >
        {leading && <span className="text-ink-faint">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn('w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint outline-none', className)}
          {...rest}
        />
        {trailing}
      </span>
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
});
