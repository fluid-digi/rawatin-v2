import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhotoCapture } from '@/features/photos/PhotoCapture';
import { dueAmount } from '@/features/orders/status';
import { Button, Card, CardBody, Chip, EmptyState, Input, Switch, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatIDR } from '@/lib/format';
import { IconClose } from '@/components/icons';
import type { PaymentMethod } from '@/data/types';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' }
];

export default function Pickup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, tenant, addPayment, confirmPickup } = useStore();
  const toast = useToast();
  const order = id ? getOrder(id) : undefined;

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [override, setOverride] = useState(false);
  const [overrideNote, setOverrideNote] = useState('');
  const [proof, setProof] = useState<string | null>(null);
  const [pickerName, setPickerName] = useState('');

  if (!order) {
    return (
      <div className="px-4 py-4">
        <PageHeader title="Pengambilan" back={`/${tenant.slug}/orders`} />
        <EmptyState title="Order tidak ditemukan" />
      </div>
    );
  }

  const due = dueAmount(order);
  const paymentOk = due === 0 || override;
  const proofOk = !tenant.requirePickupProof || !!proof;
  const canConfirm = paymentOk && proofOk && (!override || overrideNote.trim());

  const confirm = () => {
    if (!canConfirm) return;
    if (due > 0 && !override) addPayment(order.id, due, method);
    confirmPickup(order.id, proof ?? '', pickerName, override ? overrideNote.trim() : undefined);
    toast.show('Pengambilan dikonfirmasi', { tone: 'success' });
    navigate(`/${tenant.slug}/orders/${order.id}`, { replace: true });
  };

  return (
    <div className="px-4 pb-32 pt-4 lg:px-8">
      <PageHeader title="Konfirmasi pengambilan" subtitle={`${order.orderCode} · ${order.customerName}`} back={`/${tenant.slug}/orders/${order.id}`} />

      <Card className="mb-4">
        <CardBody className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="font-medium text-ink">{formatIDR(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">Sisa tagihan</span>
            <span className={`font-bold ${due > 0 ? 'text-danger' : 'text-success'}`}>{formatIDR(due)}</span>
          </div>
        </CardBody>
      </Card>

      {due > 0 && (
        <Card className="mb-4">
          <CardBody className="space-y-3">
            <p className="font-semibold text-ink">Pelunasan</p>
            {!override ? (
              <>
                <p className="text-sm text-ink-soft">Terima pelunasan {formatIDR(due)} sebelum barang diserahkan.</p>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map((m) => (
                    <Chip key={m.value} active={method === m.value} onClick={() => setMethod(m.value)}>
                      {m.label}
                    </Chip>
                  ))}
                </div>
              </>
            ) : (
              <Input
                label="Alasan override (wajib)"
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="mis. sisa dibayar transfer nanti, disetujui pemilik"
              />
            )}
            <div className="flex items-center justify-between rounded-xl bg-page px-3 py-2.5">
              <div className="pr-3">
                <p className="text-sm font-medium text-ink">Override tanpa pelunasan</p>
                <p className="text-xs text-ink-soft">Tercatat di riwayat siapa &amp; kapan.</p>
              </div>
              <Switch checked={override} onChange={setOverride} label="Override pelunasan" />
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardBody className="space-y-3">
          <p className="font-semibold text-ink">
            Foto bukti serah-terima {tenant.requirePickupProof && <span className="text-danger">*</span>}
          </p>
          <p className="text-sm text-ink-soft">Foto barang saat diserahkan mengurangi komplain "tertukar".</p>
          <div className="flex gap-2">
            {proof ? (
              <div className="relative">
                <img src={proof} alt="Bukti pengambilan" className="h-28 w-28 rounded-2xl object-cover" />
                <button
                  onClick={() => setProof(null)}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"
                  aria-label="Hapus foto"
                >
                  <IconClose width={16} height={16} />
                </button>
              </div>
            ) : (
              <PhotoCapture label="Foto bukti" className="h-28 w-28" onCapture={setProof} />
            )}
          </div>
          <Input label="Nama pengambil (opsional)" value={pickerName} onChange={(e) => setPickerName(e.target.value)} placeholder={order.customerName} hint="Kosongkan jika diambil pelanggan sendiri." />
        </CardBody>
      </Card>

      <MockNote>Foto tersimpan lokal di peramban. Belum ada upload ke storage sungguhan.</MockNote>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl">
          <Button block size="lg" disabled={!canConfirm} onClick={confirm}>
            Konfirmasi &amp; tandai selesai
          </Button>
          {!canConfirm && (
            <p className="mt-2 text-center text-xs text-ink-faint">
              {!proofOk ? 'Foto bukti wajib. ' : ''}
              {!paymentOk ? 'Lunasi atau aktifkan override. ' : ''}
              {override && !overrideNote.trim() ? 'Isi alasan override.' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
