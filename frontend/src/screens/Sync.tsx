import { useState } from 'react';
import { useStore } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, CardBody, EmptyState, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { itemSummary } from '@/features/orders/status';
import { formatDateTime } from '@/lib/format';

export default function Sync() {
  const { orders, tenant, pendingSync, syncNow } = useStore();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const pending = orders.filter((o) => !o.synced);

  const run = () => {
    setBusy(true);
    // Simulate a short round-trip so the state change is observable.
    setTimeout(() => {
      syncNow();
      setBusy(false);
      toast.show('Semua data tersinkron (simulasi)', { tone: 'success' });
    }, 900);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Pusat sinkronisasi" subtitle="Kelola data yang dibuat saat offline" back={`/${tenant.slug}/account`} />

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-soft">Menunggu sinkron</p>
            <p className="text-2xl font-bold text-ink">{pendingSync}</p>
          </div>
          <Button disabled={busy || pendingSync === 0} onClick={run}>
            {busy ? 'Menyinkron…' : 'Sinkron sekarang'}
          </Button>
        </CardBody>
      </Card>

      {pending.length ? (
        <div className="space-y-2">
          {pending.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3 shadow-card">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{o.orderCode} · {itemSummary(o)}</p>
                <p className="text-xs text-ink-soft">Dibuat {formatDateTime(o.receivedAt)}</p>
              </div>
              <Badge tone="warning">Offline</Badge>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Semua tersinkron" description="Tidak ada data offline yang menunggu." />
      )}

      <MockNote>
        Ini simulasi antrean offline di peramban. Sinkronisasi server, retry latar belakang, dan
        upload storage sungguhan dibangun pada tahap backend.
      </MockNote>
    </div>
  );
}
