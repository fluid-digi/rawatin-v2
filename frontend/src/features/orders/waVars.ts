import type { Order, Tenant } from '@/data/types';
import { formatDate, formatIDR } from '@/lib/format';
import { itemSummary, dueAmount } from './status';
import type { TemplateVars } from '@/lib/wa';

export function receiptUrl(order: Order): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/r/${order.publicToken}`;
}

export function buildVars(order: Order, tenant: Tenant): TemplateVars {
  return {
    customer: order.customerName,
    code: order.orderCode,
    items: itemSummary(order),
    estimate: formatDate(order.estimatedReadyAt),
    total: formatIDR(order.total),
    due: formatIDR(dueAmount(order)),
    receipt: receiptUrl(order),
    maps: tenant.googleMapsReviewUrl
  };
}
