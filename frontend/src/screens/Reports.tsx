import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { dueAmount } from '@/features/orders/status';
import { Card, CardBody, SegmentedTabs, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatIDR, daysSince } from '@/lib/format';

type Period = '7' | '30';
const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function Reports() {
  const { orders, customers, currentUser, tenant } = useStore();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>('7');
  const days = Number(period);

  const inPeriod = useMemo(
    () => orders.filter((o) => daysSince(o.receivedAt) < days && daysSince(o.receivedAt) >= 0),
    [orders, days]
  );

  const revenue = inPeriod.reduce((s, o) => s + o.total, 0);
  const completed = inPeriod.filter((o) => o.status === 'completed').length;
  const receivable = orders.reduce((s, o) => s + dueAmount(o), 0);
  const reviewsRequested = inPeriod.filter((o) => o.reviewRequestSentAt).length;
  const avg = inPeriod.length ? Math.round(revenue / inPeriod.length) : 0;

  const chart = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { label: DAY_LABELS[d.getDay()], value: 0 };
    });
    orders.forEach((o) => {
      const ago = daysSince(o.receivedAt);
      if (ago >= 0 && ago <= 6) buckets[6 - ago].value += 1;
    });
    return buckets;
  }, [orders]);
  const maxBar = Math.max(1, ...chart.map((c) => c.value));

  const topServices = useMemo(() => {
    const counts = new Map<string, number>();
    inPeriod.forEach((o) => o.items.forEach((it) => it.services.forEach((s) => counts.set(s.serviceName, (counts.get(s.serviceName) ?? 0) + it.quantity))));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [inPeriod]);

  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4);
  const aging = orders
    .filter((o) => o.status === 'ready' && o.readyAt)
    .map((o) => ({ o, age: daysSince(o.readyAt!) }))
    .sort((a, b) => b.age - a.age)
    .slice(0, 4);

  const exportCsv = () => {
    const rows = [
      ['Kode', 'Pelanggan', 'Status', 'Total', 'Dibayar', 'Sisa', 'Diterima'],
      ...orders.map((o) => [o.orderCode, o.customerName, o.status, o.total, o.paidAmount, dueAmount(o), o.receivedAt.slice(0, 10)])
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `rawatin-laporan-${period}hari.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('CSV diunduh', { tone: 'success' });
  };

  // Staff never see revenue/reports; block direct URL access, not just the nav.
  if (currentUser.role !== 'owner') {
    return <Navigate to={`/${tenant.slug}/dashboard`} replace />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Laporan</h1>
        <button onClick={exportCsv} className="text-sm font-semibold text-brand-600">Export CSV</button>
      </div>

      <SegmentedTabs value={period} onChange={setPeriod} options={[{ value: '7', label: '7 hari' }, { value: '30', label: '30 hari' }]} />

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Order masuk" value={String(inPeriod.length)} />
        <Stat label="Omzet" value={formatIDR(revenue)} />
        <Stat label="Order selesai" value={String(completed)} />
        <Stat label="Rata-rata / order" value={formatIDR(avg)} />
        <Stat label="Total piutang" value={formatIDR(receivable)} tone="text-danger" />
        <Stat label="Review diminta" value={String(reviewsRequested)} />
      </div>

      <Card>
        <CardBody>
          <p className="mb-3 font-semibold text-ink">Order masuk 7 hari terakhir</p>
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {chart.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-lg bg-brand-500 transition-all" style={{ height: `${(c.value / maxBar) * 100}%`, minHeight: c.value ? 6 : 2 }} />
                </div>
                <span className="text-[11px] text-ink-faint">{c.label}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <ListCard title="Layanan terpopuler" rows={topServices.map(([name, n]) => [name, `${n}x`])} empty="Belum ada data" />
      <ListCard title="Pelanggan teratas" rows={topCustomers.map((c) => [c.name, formatIDR(c.totalSpent)])} empty="Belum ada data" />
      <ListCard title="Menunggu diambil terlama" rows={aging.map(({ o, age }) => [`${o.orderCode} · ${o.customerName}`, `${age} hari`])} empty="Tidak ada" />

      <MockNote>Angka dihitung dari data contoh di peramban; definisi final divalidasi saat backend.</MockNote>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 shadow-card">
      <p className={`text-xl font-bold ${tone ?? 'text-ink'}`}>{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}

function ListCard({ title, rows, empty }: { title: string; rows: [string, string][]; empty: string }) {
  return (
    <Card>
      <CardBody>
        <p className="mb-2 font-semibold text-ink">{title}</p>
        {rows.length ? (
          <ul className="space-y-2">
            {rows.map(([a, b], i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="truncate pr-3 text-ink-soft">{a}</span>
                <span className="shrink-0 font-semibold text-ink">{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-faint">{empty}</p>
        )}
      </CardBody>
    </Card>
  );
}
