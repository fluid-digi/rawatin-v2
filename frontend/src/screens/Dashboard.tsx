import { Link } from 'react-router-dom';
import { useStore } from '@/data/store';
import { OrderCard } from '@/features/orders/OrderCard';
import { dueAmount } from '@/features/orders/status';
import { Button, Card, CardBody, EmptyState } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatIDR, daysUntil } from '@/lib/format';
import { IconBell, IconBox, IconMoney, IconStar } from '@/components/icons';
import type { ReactNode } from 'react';

function StatCard({
  icon,
  label,
  value,
  tone,
  to
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
  to: string;
}) {
  return (
    <Link to={to} className={`flex flex-col gap-1 rounded-2xl border p-3.5 shadow-card ${tone}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70">{icon}</span>
      <span className="mt-1 text-2xl font-bold text-ink">{value}</span>
      <span className="text-xs font-medium text-ink-soft">{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { orders, tenant, currentUser } = useStore();
  const isOwner = currentUser.role === 'owner';

  const ready = orders.filter((o) => o.status === 'ready');
  const dueToday = orders.filter((o) => o.status !== 'completed' && o.status !== 'ready' && daysUntil(o.estimatedReadyAt) <= 0);
  const receivable = orders.reduce((s, o) => s + dueAmount(o), 0);
  const reviewPending = orders.filter((o) => o.status === 'completed' && !o.reviewRequestSentAt);
  const active = orders.filter((o) => o.status !== 'completed');
  const todayRevenue = orders
    .filter((o) => daysUntil(o.receivedAt) === 0)
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-soft">Halo, {currentUser.name.split(' ')[0]} 👋</p>
          <h1 className="text-2xl font-bold text-ink">{tenant.name}</h1>
        </div>
        <Link
          to={`/${tenant.slug}/follow-ups`}
          aria-label="Tindak lanjut"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink-soft"
        >
          <IconBell width={22} height={22} />
          {(ready.length > 0 || reviewPending.length > 0) && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-pinky-soft" />
          )}
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<IconBox width={18} height={18} className="text-mint-700" />}
          label="Siap diambil"
          value={String(ready.length)}
          tone="border-mint-soft/30 bg-mint-50"
          to={`/${tenant.slug}/orders?status=ready`}
        />
        <StatCard
          icon={<IconBell width={18} height={18} className="text-warning" />}
          label="Jatuh tempo hari ini"
          value={String(dueToday.length)}
          tone="border-[#FFE7B8] bg-[#FFF6E6]"
          to={`/${tenant.slug}/orders`}
        />
        <StatCard
          icon={<IconMoney width={18} height={18} className="text-danger" />}
          label="Total piutang"
          value={formatIDR(receivable)}
          tone="border-pinky-soft/30 bg-pinky-50"
          to={`/${tenant.slug}/follow-ups?tab=payment`}
        />
        <StatCard
          icon={<IconStar width={18} height={18} className="text-brand-600" />}
          label="Review belum diminta"
          value={String(reviewPending.length)}
          tone="border-brand-100 bg-brand-50/60"
          to={`/${tenant.slug}/follow-ups?tab=review`}
        />
      </section>

      {isOwner && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-soft">Omzet order masuk hari ini</p>
              <p className="text-2xl font-bold text-ink">{formatIDR(todayRevenue)}</p>
            </div>
            <Link to={`/${tenant.slug}/reports`} className="text-sm font-semibold text-brand-600">
              Lihat laporan →
            </Link>
          </CardBody>
        </Card>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Siap diambil</h2>
          <Link to={`/${tenant.slug}/orders?status=ready`} className="text-sm font-semibold text-brand-600">
            Lihat semua
          </Link>
        </div>
        {ready.length ? (
          <div className="space-y-2.5">
            {ready.slice(0, 3).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada yang siap diambil" description="Order akan muncul di sini setelah ditandai siap." />
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Sedang dikerjakan</h2>
          <Link to={`/${tenant.slug}/orders`} className="text-sm font-semibold text-brand-600">
            Papan kerja
          </Link>
        </div>
        {active.length ? (
          <div className="space-y-2.5">
            {active.slice(0, 4).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada order aktif"
            description="Buat order pertama untuk mulai."
            action={
              <Link to={`/${tenant.slug}/orders/new`}>
                <Button>Order baru</Button>
              </Link>
            }
          />
        )}
      </section>

      <MockNote>
        Semua angka dihitung dari data contoh di peramban. Reset kapan saja lewat Akun → Data demo.
      </MockNote>
    </div>
  );
}
