import { cn } from '@/lib/cn';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

export function SegmentedTabs<T extends string>({ value, onChange, options, className }: Props<T>) {
  return (
    <div className={cn('flex gap-4 border-b border-line', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative -mb-px pb-2 text-sm font-semibold transition-colors',
              active ? 'text-brand-600' : 'text-ink-faint hover:text-ink-soft'
            )}
          >
            {o.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />}
          </button>
        );
      })}
    </div>
  );
}
