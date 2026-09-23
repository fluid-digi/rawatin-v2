import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useStore } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { receiptUrl } from '@/features/orders/waVars';
import { itemSummary } from '@/features/orders/status';
import { Button, Chip } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { cn } from '@/lib/cn';

export default function Labels() {
  const { orders, tenant } = useStore();
  const active = useMemo(() => orders.filter((o) => o.status !== 'completed'), [orders]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(active.map((o) => o.id)));
  const [qr, setQr] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      active.map(async (o) => [o.id, await QRCode.toDataURL(receiptUrl(o), { margin: 1, width: 220 })] as const)
    ).then((pairs) => {
      if (!cancelled) setQr(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chosen = active.filter((o) => selected.has(o.id));

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="print:hidden">
        <PageHeader title="Cetak label QR" subtitle="Pilih order lalu cetak label A4" back={`/${tenant.slug}/account`} />

        <div className="mb-3 flex flex-wrap gap-2">
          {active.map((o) => (
            <Chip key={o.id} active={selected.has(o.id)} onClick={() => toggle(o.id)}>
              {o.orderCode}
            </Chip>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSelected(new Set(active.map((o) => o.id)))}>Pilih semua</Button>
          <Button className="flex-1" disabled={chosen.length === 0} onClick={() => window.print()}>
            Cetak {chosen.length} label
          </Button>
        </div>

        <MockNote className="mt-3">
          Cetak memakai dialog print peramban (bisa "Simpan sebagai PDF"). Ekspor PDF A4 khusus dan
          scan-untuk-masuk menyusul pada tahap backend.
        </MockNote>
      </div>

      {/* Print/preview sheet */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2">
        {chosen.map((o) => (
          <div
            key={o.id}
            className={cn(
              'flex flex-col items-center gap-1 rounded-2xl border border-line bg-white p-3 text-center',
              'print:break-inside-avoid print:rounded-none'
            )}
          >
            <p className="text-xs font-semibold text-ink-soft">{tenant.name}</p>
            {qr[o.id] ? <img src={qr[o.id]} alt={`QR ${o.orderCode}`} className="h-24 w-24" /> : <div className="h-24 w-24 animate-pulse rounded bg-line" />}
            <p className="text-lg font-black tracking-tight text-ink">{o.orderCode}</p>
            <p className="truncate text-xs text-ink-soft w-full">{itemSummary(o)}</p>
            <p className="truncate text-xs text-ink-faint w-full">{o.customerName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
