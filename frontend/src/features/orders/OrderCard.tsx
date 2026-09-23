import { Link } from 'react-router-dom';
import type { Order } from '@/data/types';
import { useStore } from '@/data/store';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatIDR, relativeDue } from '@/lib/format';
import {
  dueAmount,
  itemSummary,
  paymentMeta,
  statusLabel,
  STATUS_TONE
} from './status';
import { IconChevron } from '@/components/icons';

const TINT: Record<string, string> = {
  purple: 'border-brand-100 bg-brand-50/60',
  blue: 'border-sky-soft/30 bg-sky-50',
  mint: 'border-mint-soft/30 bg-mint-50',
  pink: 'border-pinky-soft/30 bg-pinky-50',
  success: 'border-mint-soft/30 bg-mint-50'
};

export function OrderCard({ order, to }: { order: Order; to?: string }) {
  const { tenant } = useStore();
  const tone = STATUS_TONE[order.status];
  const pay = paymentMeta(order.paymentStatus);
  const due = relativeDue(order.estimatedReadyAt);
  const href = to ?? `/${tenant.slug}/orders/${order.id}`;
  const thumb = order.items[0]?.photos.find((p) => p.type === 'after') ?? order.items[0]?.photos[0];

  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 shadow-card transition-transform active:scale-[0.99]',
        TINT[tone]
      )}
    >
      {thumb && (
        <img
          src={thumb.url}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-faint">{order.orderCode}</span>
          <Badge tone={tone as never}>{statusLabel(tenant, order.status)}</Badge>
          {!order.synced && <Badge tone="warning">Offline</Badge>}
        </div>
        <p className="mt-0.5 truncate font-semibold text-ink">{itemSummary(order)}</p>
        <p className="truncate text-sm text-ink-soft">{order.customerName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {order.status !== 'completed' && (
            <span
              className={cn(
                'font-medium',
                due.tone === 'late' ? 'text-danger' : due.tone === 'warn' ? 'text-warning' : 'text-ink-soft'
              )}
            >
              {due.label}
            </span>
          )}
          <Badge tone={pay.tone}>{pay.label}</Badge>
          {dueAmount(order) > 0 && (
            <span className="text-ink-soft">Sisa {formatIDR(dueAmount(order))}</span>
          )}
        </div>
      </div>
      <IconChevron className="shrink-0 text-ink-faint" width={18} height={18} />
    </Link>
  );
}
