import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { OrderCard } from '@/features/orders/OrderCard';
import { WaSheet } from '@/features/orders/WaSheet';
import { dueAmount } from '@/features/orders/status';
import { Badge, Button, EmptyState, SegmentedTabs } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { daysSince, formatIDR } from '@/lib/format';
import type { Order } from '@/data/types';

type Tab = 'pickup' | 'payment' | 'review';

export default function FollowUps() {
  const { orders, markReviewSent } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) ?? 'pickup';
  const [wa, setWa] = useState<{ order: Order; template: string } | null>(null);

  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });

  const pickup = orders.filter((o) => o.status === 'ready');
  const payment = orders.filter((o) => dueAmount(o) > 0);
  const review = orders.filter((o) => o.status === 'completed' && !o.reviewRequestSentAt);

  const templateFor = (o: Order): string => {
    if (tab === 'payment') return 'wa_payment';
    if (tab === 'review') return 'wa_review';
    const age = o.readyAt ? daysSince(o.readyAt) : 0;
    return age >= 30 ? 'wa_reminder30' : age >= 14 ? 'wa_reminder14' : 'wa_ready';
  };

  const list = tab === 'pickup' ? pickup : tab === 'payment' ? payment : review;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">Tindak lanjut</h1>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'pickup', label: `Ambil (${pickup.length})` },
          { value: 'payment', label: `Piutang (${payment.length})` },
          { value: 'review', label: `Review (${review.length})` }
        ]}
      />

      {list.length === 0 ? (
        <EmptyState title="Tidak ada yang perlu ditindaklanjuti" description="Bagus! Semua sudah beres di tab ini." />
      ) : (
        <div className="space-y-3">
          {list.map((o) => {
            const age = o.readyAt ? daysSince(o.readyAt) : 0;
            return (
              <div key={o.id} className="space-y-2 rounded-2xl border border-line bg-white p-3 shadow-card">
                <OrderCard order={o} />
                <div className="flex items-center gap-2">
                  {tab === 'pickup' && age >= 14 && <Badge tone={age >= 30 ? 'danger' : 'warning'}>Menunggu {age} hari</Badge>}
                  {tab === 'payment' && <Badge tone="danger">Sisa {formatIDR(dueAmount(o))}</Badge>}
                  <Button
                    size="sm"
                    variant="soft"
                    className="ml-auto"
                    onClick={() => setWa({ order: o, template: templateFor(o) })}
                  >
                    Kirim WhatsApp
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MockNote>
        Umur menunggu dihitung sejak tanggal siap. Tidak ada denda atau klaim kepemilikan otomatis.
      </MockNote>

      {wa && (
        <WaSheet
          order={wa.order}
          open
          defaultTemplateId={wa.template}
          onClose={() => setWa(null)}
          onSent={() => {
            if (tab === 'review') markReviewSent(wa.order.id);
          }}
        />
      )}
    </div>
  );
}
