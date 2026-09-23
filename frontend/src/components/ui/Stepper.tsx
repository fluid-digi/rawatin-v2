import { cn } from '@/lib/cn';

interface Step { label: string; }

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                  done ? 'bg-mint-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-line text-ink-faint'
                )}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={cn('mt-1 text-[11px]', active ? 'text-brand-600 font-semibold' : 'text-ink-faint')}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn('mx-1 mb-4 h-0.5 flex-1 rounded', done ? 'bg-mint-500' : 'bg-line')} />}
          </div>
        );
      })}
    </div>
  );
}
