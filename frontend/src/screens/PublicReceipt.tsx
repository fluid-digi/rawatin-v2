import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { statusLabel, statusStep, paymentMeta, dueAmount } from '@/features/orders/status';
import { Badge, Button, Card, CardBody, Input } from '@/components/ui';
import { formatDate, formatDateTime, formatIDR } from '@/lib/format';
import { waLink } from '@/lib/wa';
import { IconLogo, IconWa, IconSearch } from '@/components/icons';

export default function PublicReceipt() {
  const { token } = useParams();
  const { getOrderByToken, tenant } = useStore();
  const [query, setQuery] = useState('');
  const order = token ? getOrderByToken(token) : undefined;

  if (!order) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
        <div className="mb-6 flex items-center gap-2">
          <IconLogo />
          <span className="font-bold text-ink">Rawatin</span>
        </div>
        <h1 className="text-xl font-bold text-ink">Resi tidak ditemukan</h1>
        <p className="mt-1 text-sm text-ink-soft">Cek kembali tautan, atau masukkan kode order Anda.</p>
        <div className="mt-4 flex gap-2">
          <Input leading={<IconSearch width={18} height={18} />} placeholder="mis. RWT-401" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={() => (window.location.href = `/r/${query.trim()}`)}>Cari</Button>
        </div>
      </div>
    );
  }

  const pay = paymentMeta(order.paymentStatus);
  const due = dueAmount(order);
  const step = statusStep(order.status);
  const item = order.items[0];
  const before = order.items.flatMap((it) => it.photos.filter((p) => p.type === 'before'));
  const after = order.items.flatMap((it) => it.photos.filter((p) => p.type === 'after'));

  return (
    <div className="min-h-dvh bg-page pb-10">
      <div className="mx-auto max-w-md space-y-4 px-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLogo />
            <div>
              <p className="font-bold text-ink">{tenant.name}</p>
              <p className="text-xs text-ink-faint">{tenant.city}</p>
            </div>
          </div>
          <Badge tone="purple">Resi digital</Badge>
        </div>

        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">{order.orderCode}</span>
              <Badge tone="mint">{statusLabel(tenant, order.status)}</Badge>
            </div>
            <ol className="flex items-center">
              {tenant.statuses.map((s, i) => (
                <li key={s.id} className="flex flex-1 items-center last:flex-none">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${i <= step ? 'bg-brand-500 text-white' : 'bg-line text-ink-faint'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {i < tenant.statuses.length - 1 && <span className={`mx-1 h-0.5 flex-1 rounded ${i < step ? 'bg-brand-500' : 'bg-line'}`} />}
                </li>
              ))}
            </ol>
            <p className="text-sm text-ink-soft">
              {order.status === 'completed'
                ? `Sudah diambil ${order.pickedUpAt ? formatDateTime(order.pickedUpAt) : ''}`
                : order.status === 'ready'
                ? 'Siap diambil 🎉'
                : `Estimasi siap ${formatDate(order.estimatedReadyAt)}`}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <p className="font-semibold text-ink">Barang</p>
            {order.items.map((it) => (
              <div key={it.id} className="text-sm">
                <p className="font-medium text-ink">
                  {it.brand} {it.color && `· ${it.color}`} <span className="text-ink-faint">×{it.quantity}</span>
                </p>
                <p className="text-ink-soft">{it.services.map((s) => s.serviceName).join(', ')}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {(before.length > 0 || after.length > 0) && (
          <Card>
            <CardBody className="space-y-3">
              <p className="font-semibold text-ink">Foto kondisi</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-ink-faint">Sebelum</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {before.map((p) => <img key={p.id} src={p.url} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />)}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-ink-faint">Sesudah</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {after.length ? after.map((p) => <img key={p.id} src={p.url} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />) : <span className="text-xs text-ink-faint">Menunggu hasil</span>}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Total</span>
              <span className="font-semibold text-ink">{formatIDR(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Pembayaran</span>
              <Badge tone={pay.tone}>{pay.label}</Badge>
            </div>
            {due > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-soft">Sisa</span>
                <span className="font-semibold text-danger">{formatIDR(due)}</span>
              </div>
            )}
          </CardBody>
        </Card>

        {order.pickupProof && (
          <Card>
            <CardBody className="space-y-2">
              <p className="font-semibold text-ink">Bukti pengambilan</p>
              <img src={order.pickupProof.url} alt="Bukti pengambilan" className="h-40 w-full rounded-xl object-cover" />
              <p className="text-xs text-ink-soft">Diterima oleh {order.pickedUpByName}.</p>
            </CardBody>
          </Card>
        )}

        <a href={waLink(tenant.whatsapp, `Halo ${tenant.name}, saya mau tanya order ${order.orderCode}`)} target="_blank" rel="noopener">
          <Button block size="lg" variant="soft">
            <IconWa width={20} height={20} /> Hubungi outlet
          </Button>
        </a>

        {order.status !== 'completed' && item && (
          <a href={tenant.googleMapsReviewUrl} target="_blank" rel="noopener" className="block text-center text-xs text-ink-faint">
            {tenant.name} · {tenant.city}
          </a>
        )}

        <p className="rounded-xl bg-white p-3 text-xs text-ink-soft">{tenant.disclaimerText}</p>
      </div>
    </div>
  );
}
