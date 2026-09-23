import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { IconBack } from '@/components/icons';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, back, action }: Props) {
  const navigate = useNavigate();
  return (
    <header className="mb-4 flex items-start gap-3">
      {back && (
        <button
          aria-label="Kembali"
          onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:bg-page"
        >
          <IconBack width={20} height={20} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
