import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { OrderCard } from '@/features/orders/OrderCard';
import { statusLabel } from '@/features/orders/status';
import { Badge, Button, Chip, EmptyState, Input } from '@/components/ui';
import { useToast } from '@/components/ui';
import { IconSearch } from '@/components/icons';
import type { Order, OrderStatus } from '@/data/types';
import { cn } from '@/lib/cn';

const COLUMNS: OrderStatus[] = ['received', 'in_progress', 'finishing', 'ready'];

export default function Orders() {
  const { orders, tenant, bulkAdvance } = useStore();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const statusParam = (params.get('status') as OrderStatus | 'all') ?? 'all';
  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusParam !== 'all' && o.status !== statusParam) return false;
      if (!q) return true;
      return (
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.items.some((it) => `${it.brand} ${it.color}`.toLowerCase().includes(q))
      );
    });
  }, [orders, statusParam, query]);

  const setStatus = (s: OrderStatus | 'all') => {
    const next = new URLSearchParams(params);
    if (s === 'all') next.delete('status');
    else next.set('status', s);
    setParams(next, { replace: true });
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulk = () => {
    const ids = [...selected];
    bulkAdvance(ids);
    toast.show(`${ids.length} order dinaikkan statusnya`, { tone: 'success' });
    setSelected(new Set());
    setSelectMode(false);
  };

  const filters: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Semua' },
    ...tenant.statuses.map((s) => ({ value: s.id, label: s.label }))
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Pesanan</h1>
        <button
          onClick={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
          className="text-sm font-semibold text-brand-600"
        >
          {selectMode ? 'Batal' : 'Pilih massal'}
        </button>
      </div>

      <Input
        leading={<IconSearch width={18} height={18} />}
        placeholder="Cari kode, pelanggan, atau barang"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
        {filters.map((f) => (
          <Chip key={f.value} active={statusParam === f.value} onClick={() => setStatus(f.value)} className="shrink-0">
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Mobile & tablet: filtered list */}
      <div className="space-y-2.5 lg:hidden">
        {filtered.length ? (
          filtered.map((o) =>
            selectMode ? (
              <SelectableRow key={o.id} order={o} checked={selected.has(o.id)} onToggle={() => toggle(o.id)} tenant={tenant} />
            ) : (
              <OrderCard key={o.id} order={o} />
            )
          )
        ) : (
          <EmptyState title="Tidak ada order" description="Coba ubah filter atau kata kunci pencarian." />
        )}
      </div>

      {/* Desktop: kanban board */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = filtered.filter((o) => o.status === col);
          return (
            <div key={col} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-ink">{statusLabel(tenant, col)}</span>
                <Badge tone="neutral">{items.length}</Badge>
              </div>
              {items.length ? (
                items.map((o) => <OrderCard key={o.id} order={o} />)
              ) : (
                <p className="rounded-2xl border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
                  Kosong
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectMode && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:p-0">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="text-sm text-ink-soft">{selected.size} dipilih</span>
            <Button className="ml-auto" disabled={selected.size === 0} onClick={runBulk}>
              Naikkan status
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-xs text-ink-faint">
            Order berstatus Siap tidak ikut naik—selesai hanya lewat konfirmasi pengambilan.
          </p>
        </div>
      )}

      {!selectMode && filtered.length === 0 && (
        <Link to={`/${tenant.slug}/orders/new`} className="block">
          <Button block>Buat order baru</Button>
        </Link>
      )}
    </div>
  );
}

function SelectableRow({
  order,
  checked,
  onToggle,
  tenant
}: {
  order: Order;
  checked: boolean;
  onToggle: () => void;
  tenant: ReturnType<typeof useStore>['tenant'];
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
        checked ? 'border-brand-400 bg-brand-50' : 'border-line bg-white'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
          checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-line'
        )}
      >
        {checked && '✓'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">
          {order.orderCode} · {order.customerName}
        </p>
        <p className="truncate text-sm text-ink-soft">{statusLabel(tenant, order.status)}</p>
      </div>
    </button>
  );
}
