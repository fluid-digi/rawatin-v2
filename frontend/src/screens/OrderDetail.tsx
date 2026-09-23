import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { WaSheet } from '@/features/orders/WaSheet';
import { PhotoCapture } from '@/features/photos/PhotoCapture';
import { receiptUrl } from '@/features/orders/waVars';
import {
  dueAmount,
  nextStatus,
  paymentMeta,
  statusLabel,
  statusStep
} from '@/features/orders/status';
import { Badge, Button, Card, CardBody, Chip, EmptyState, Sheet, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatDate, formatDateTime, formatIDR, relativeDue } from '@/lib/format';
import {
  IconBox,
  IconCheck,
  IconMoney,
  IconShare,
  IconWa
} from '@/components/icons';
import type { PaymentMethod } from '@/data/types';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' }
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, tenant, advanceStatus, addPayment, addAfterPhoto, markReviewSent } = useStore();
  const toast = useToast();
  const order = id ? getOrder(id) : undefined;

  const [waOpen, setWaOpen] = useState(false);
  const [waTemplate, setWaTemplate] = useState<string | undefined>();
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');

  if (!order) {
    return (
      <div>
        <PageHeader title="Order tidak ditemukan" back={`/${tenant.slug}/orders`} />
        <EmptyState title="Order tidak ada" description="Mungkin sudah dihapus atau tautan salah." />
      </div>
    );
  }

  const next = nextStatus(order.status);
  const pay = paymentMeta(order.paymentStatus);
  const due = dueAmount(order);
  const step = statusStep(order.status);

  const openWa = (templateId?: string) => {
    setWaTemplate(templateId);
    setWaOpen(true);
  };

  const submitPayment = () => {
    const amount = Number(payAmount.replace(/\D/g, ''));
    if (amount <= 0) return;
    addPayment(order.id, Math.min(amount, due || amount), payMethod);
    toast.show('Pembayaran dicatat', { tone: 'success' });
    setPayOpen(false);
    setPayAmount('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={order.orderCode}
        subtitle={`${order.customerName} · diterima ${formatDate(order.receivedAt)}`}
        back={`/${tenant.slug}/orders`}
        action={<Badge tone={pay.tone}>{pay.label}</Badge>}
      />

      {/* Status & progress */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-soft">Status saat ini</p>
              <p className="text-lg font-bold text-ink">{statusLabel(tenant, order.status)}</p>
            </div>
            {order.status !== 'completed' && (
              <span className={`text-sm font-medium ${relativeDue(order.estimatedReadyAt).tone === 'late' ? 'text-danger' : 'text-ink-soft'}`}>
                {relativeDue(order.estimatedReadyAt).label}
              </span>
            )}
          </div>

          <ol className="flex items-center">
            {tenant.statuses.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.id} className="flex flex-1 items-center last:flex-none">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      done ? 'bg-mint-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-line text-ink-faint'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  {i < tenant.statuses.length - 1 && (
                    <span className={`mx-1 h-0.5 flex-1 rounded ${done ? 'bg-mint-500' : 'bg-line'}`} />
                  )}
                </li>
              );
            })}
          </ol>

          {order.status === 'ready' ? (
            <Button block size="lg" onClick={() => navigate(`/${tenant.slug}/orders/${order.id}/pickup`)}>
              <IconCheck width={20} height={20} /> Konfirmasi pengambilan
            </Button>
          ) : order.status === 'completed' ? (
            <div className="rounded-xl bg-mint-50 p-3 text-sm text-mint-700">
              Diambil {order.pickedUpAt ? formatDateTime(order.pickedUpAt) : ''} oleh{' '}
              <span className="font-semibold">{order.pickedUpByName}</span>
              {order.pickupConfirmedByName ? ` · dikonfirmasi ${order.pickupConfirmedByName}` : ''}
            </div>
          ) : (
            next && (
              <Button
                block
                size="lg"
                onClick={() => {
                  advanceStatus(order.id, next);
                  toast.show(`Status → ${statusLabel(tenant, next)}`, { tone: 'success' });
                }}
              >
                Naikkan ke {statusLabel(tenant, next)}
              </Button>
            )
          )}
        </CardBody>
      </Card>

      {/* Items */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-ink">
          <IconBox width={18} height={18} /> Barang &amp; kondisi
        </h2>
        {order.items.map((it) => {
          const before = it.photos.filter((p) => p.type === 'before');
          const after = it.photos.filter((p) => p.type === 'after');
          return (
            <Card key={it.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">
                    {it.brand} {it.color && <span className="font-normal text-ink-soft">· {it.color}</span>}
                  </p>
                  <span className="text-sm text-ink-soft">
                    {it.quantity} {tenant.itemLabel} · {formatIDR(it.lineTotal)}
                  </span>
                </div>
                <p className="text-sm text-ink-soft">
                  {it.services.map((s) => s.serviceName).join(', ')}
                </p>
                {it.conditionTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {it.conditionTags.map((t) => (
                      <Badge key={t} tone="warning">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {it.conditionNotes && <p className="text-sm text-ink-soft">Catatan: {it.conditionNotes}</p>}

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">Sebelum</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {before.map((p) => (
                      <img key={p.id} src={p.url} alt="Kondisi sebelum" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    ))}
                    {before.length === 0 && <span className="text-sm text-ink-faint">Tidak ada foto</span>}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">Sesudah</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {after.map((p) => (
                      <img key={p.id} src={p.url} alt="Hasil perawatan" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    ))}
                    <PhotoCapture
                      label="Foto after"
                      onCapture={(url) => {
                        addAfterPhoto(order.id, it.id, url);
                        toast.show('Foto after ditambahkan', { tone: 'success' });
                      }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </section>

      {/* Payment */}
      <section className="space-y-2">
        <h2 className="flex items-center gap-2 font-semibold text-ink">
          <IconMoney width={18} height={18} /> Pembayaran
        </h2>
        <Card>
          <CardBody className="space-y-3">
            <Row label="Subtotal" value={formatIDR(order.subtotal)} />
            {order.discount > 0 && <Row label="Diskon" value={`- ${formatIDR(order.discount)}`} />}
            <Row label="Total" value={formatIDR(order.total)} strong />
            <Row label="Dibayar" value={formatIDR(order.paidAmount)} />
            <Row label="Sisa" value={formatIDR(due)} strong tone={due > 0 ? 'danger' : 'success'} />
            {order.payments.length > 0 && (
              <ul className="space-y-1 border-t border-line pt-2 text-xs text-ink-soft">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>
                      {METHODS.find((m) => m.value === p.method)?.label} · {formatDate(p.createdAt)}
                    </span>
                    <span>{formatIDR(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            {due > 0 && (
              <Button variant="secondary" block onClick={() => setPayOpen(true)}>
                Terima pembayaran
              </Button>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Review CTA for completed orders */}
      {order.status === 'completed' && (
        <Card>
          <CardBody className="space-y-2">
            <p className="font-semibold text-ink">Minta review Google</p>
            {order.reviewRequestSentAt ? (
              <p className="text-sm text-mint-700">
                Sudah diminta {formatDate(order.reviewRequestSentAt)} oleh {order.reviewRequestSentByName}.
              </p>
            ) : (
              <>
                <p className="text-sm text-ink-soft">
                  Kirim ucapan terima kasih sekaligus ajakan review yang jujur.
                </p>
                <Button
                  variant="secondary"
                  block
                  onClick={() => {
                    openWa('wa_review');
                    markReviewSent(order.id);
                  }}
                >
                  Kirim &amp; tandai diminta
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <section className="grid grid-cols-2 gap-3">
        <Button variant="soft" onClick={() => openWa()}>
          <IconWa width={18} height={18} /> WhatsApp
        </Button>
        <Button variant="soft" onClick={() => navigate(`/${tenant.slug}/orders/${order.id}/share`)}>
          <IconShare width={18} height={18} /> Bagikan hasil
        </Button>
        <a href={receiptUrl(order)} target="_blank" rel="noopener" className="col-span-2">
          <Button variant="ghost" block>
            Lihat resi pelanggan ↗
          </Button>
        </a>
      </section>

      <div className="rounded-2xl bg-page p-3 text-xs text-ink-soft">
        <p>
          Estimasi siap: <span className="font-medium text-ink">{formatDate(order.estimatedReadyAt)}</span>
        </p>
        <p className="mt-1">Persetujuan disclaimer: {order.disclaimerAcceptedAt ? formatDateTime(order.disclaimerAcceptedAt) : '—'}</p>
        <p className="mt-1">Izin publikasi foto: {order.publishConsent ? 'Ya' : 'Tidak'}</p>
      </div>

      <MockNote>Order ini data contoh. Perubahan tersimpan lokal dan bisa direset kapan saja.</MockNote>

      {due > 0 && (
        <Sheet open={payOpen} onClose={() => setPayOpen(false)} title="Terima pembayaran">
          <p className="mb-3 text-sm text-ink-soft">Sisa tagihan {formatIDR(due)}.</p>
          <div className="mb-3 flex gap-2">
            {METHODS.map((m) => (
              <Chip key={m.value} active={payMethod === m.value} onClick={() => setPayMethod(m.value)}>
                {m.label}
              </Chip>
            ))}
          </div>
          <label className="mb-3 flex items-center gap-2 rounded-xl border border-line bg-white px-3 h-12">
            <span className="text-ink-faint">Rp</span>
            <input
              autoFocus
              inputMode="numeric"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/\D/g, ''))}
              placeholder={String(due)}
              className="w-full bg-transparent text-lg font-semibold text-ink outline-none"
            />
          </label>
          <div className="mb-3 flex gap-2">
            <Chip onClick={() => setPayAmount(String(due))}>Pas ({formatIDR(due)})</Chip>
            <Chip onClick={() => setPayAmount(String(Math.round(due / 2)))}>Setengah</Chip>
          </div>
          <Button block size="lg" onClick={submitPayment}>
            Catat pembayaran
          </Button>
        </Sheet>
      )}

      <WaSheet order={order} open={waOpen} onClose={() => setWaOpen(false)} defaultTemplateId={waTemplate} />
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  tone
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'danger' | 'success';
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-soft">{label}</span>
      <span
        className={`${strong ? 'font-bold' : 'font-medium'} ${
          tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
