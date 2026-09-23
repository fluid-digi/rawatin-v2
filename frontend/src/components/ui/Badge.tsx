import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'purple' | 'blue' | 'mint' | 'pink' | 'success' | 'warning' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  purple: 'bg-brand-50 text-brand-600',
  blue: 'bg-sky-50 text-sky-700',
  mint: 'bg-mint-50 text-mint-700',
  pink: 'bg-pinky-50 text-pinky-500',
  success: 'bg-mint-50 text-success',
  warning: 'bg-[#FFF6E6] text-warning',
  danger: 'bg-[#FDE8EC] text-danger',
  neutral: 'bg-line/50 text-ink-soft'
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}
