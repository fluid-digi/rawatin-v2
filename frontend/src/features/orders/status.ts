import type { Order, OrderStatus, PaymentStatus, Tenant } from '@/data/types';

export function statusLabel(tenant: Tenant, id: OrderStatus): string {
  return tenant.statuses.find((s) => s.id === id)?.label ?? id;
}

export function statusStep(id: OrderStatus): number {
  return ['received', 'in_progress', 'finishing', 'ready', 'completed'].indexOf(id);
}

export const STATUS_TONE: Record<OrderStatus, 'purple' | 'blue' | 'mint' | 'pink' | 'success'> = {
  received: 'blue',
  in_progress: 'purple',
  finishing: 'pink',
  ready: 'mint',
  completed: 'success'
};

export function nextStatus(id: OrderStatus): OrderStatus | null {
  const order: OrderStatus[] = ['received', 'in_progress', 'finishing', 'ready'];
  const idx = order.indexOf(id);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : id === 'ready' ? null : null;
}

export function paymentMeta(status: PaymentStatus): { label: string; tone: 'danger' | 'warning' | 'success' } {
  switch (status) {
    case 'paid': return { label: 'Lunas', tone: 'success' };
    case 'partial': return { label: 'DP', tone: 'warning' };
    default: return { label: 'Belum Lunas', tone: 'danger' };
  }
}

export function dueAmount(o: Order): number {
  return Math.max(0, o.total - o.paidAmount);
}

export function itemSummary(o: Order): string {
  const first = o.items[0];
  const count = o.items.reduce((sum, it) => sum + it.quantity, 0);
  const label = `${first?.brand ?? 'Barang'}${first?.color ? ' ' + first.color : ''}`;
  return count > 1 ? `${label} +${count - 1} lainnya` : label;
}
