import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, type IntakeDraftItem } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhotoCapture } from '@/features/photos/PhotoCapture';
import { Button, Card, CardBody, Chip, Input, Switch, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatIDR } from '@/lib/format';
import { IconClose, IconPlus } from '@/components/icons';
import type { PaymentMethod } from '@/data/types';

const CONDITION_TAGS = ['Sol menguning', 'Noda', 'Bau', 'Lecet', 'Sobek', 'Warna pudar', 'Jamur'];
const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer' }
];

function blankItem(serviceId: string): IntakeDraftItem {
  return { brand: '', color: '', conditionTags: [], conditionNotes: '', quantity: 1, serviceId, addonIds: [], photos: [] };
}

export default function Intake() {
  const navigate = useNavigate();
  const toast = useToast();
  const { services, addons, tenant, createOrder, findCustomerByPhone } = useStore();
  const activeServices = services.filter((s) => s.isActive);
  const activeAddons = addons.filter((a) => a.isActive);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [items, setItems] = useState<IntakeDraftItem[]>([blankItem(activeServices[0]?.id ?? '')]);
  const [discount, setDiscount] = useState('');
  const [paid, setPaid] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [consent, setConsent] = useState(true);
  const [disclaimer, setDisclaimer] = useState(false);
  const [offline, setOffline] = useState(false);

  const matched = useMemo(() => (phone.replace(/\D/g, '').length >= 6 ? findCustomerByPhone(phone) : undefined), [phone, findCustomerByPhone]);

  const patchItem = (i: number, patch: Partial<IntakeDraftItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const svc = services.find((s) => s.id === it.serviceId);
      const addonTotal = it.addonIds.reduce((a, id) => a + (addons.find((x) => x.id === id)?.price ?? 0), 0);
      return sum + ((svc?.price ?? 0) + addonTotal) * it.quantity;
    }, 0);
    const disc = Number(discount.replace(/\D/g, '')) || 0;
    return { subtotal, discount: disc, total: Math.max(0, subtotal - disc) };
  }, [items, services, addons, discount]);

  const canSubmit =
    (name.trim() || matched) && phone.replace(/\D/g, '').length >= 8 && items.every((it) => it.brand.trim() && it.serviceId) && disclaimer;

  const submit = () => {
    if (!canSubmit) {
      toast.show('Lengkapi data pelanggan, barang, dan persetujuan dulu.', { tone: 'danger' });
      return;
    }
    const order = createOrder({
      customerName: matched?.name ?? name.trim(),
      customerPhone: phone,
      items,
      discount: totals.discount,
      paid: Number(paid.replace(/\D/g, '')) || 0,
      paymentMethod: method,
      publishConsent: consent,
      disclaimerAccepted: disclaimer,
      offline
    });
    toast.show(`Order ${order.orderCode} dibuat`, { tone: 'success' });
    navigate(`/${tenant.slug}/orders/${order.id}`, { replace: true });
  };

  return (
    <div className="px-4 pb-40 pt-4 lg:px-8">
      <PageHeader title="Order baru" subtitle="Catat kondisi barang saat serah-terima" back={`/${tenant.slug}/orders`} />

      {/* Customer */}
      <Card className="mb-4">
        <CardBody className="space-y-3">
          <Input
            label="Nomor WhatsApp pelanggan"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="08xx-xxxx-xxxx"
          />
          {matched ? (
            <div className="rounded-xl bg-mint-50 px-3 py-2 text-sm text-mint-700">
              Pelanggan dikenali: <span className="font-semibold">{matched.name}</span> · {matched.totalOrders}x order
            </div>
          ) : (
            <Input label="Nama pelanggan" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pelanggan" />
          )}
        </CardBody>
      </Card>

      {/* Items */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-ink">Barang</h2>
        <span className="text-sm text-ink-soft">{items.length} item</span>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => {
          const svc = services.find((s) => s.id === it.serviceId);
          return (
            <Card key={i}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Item {i + 1}</p>
                  {items.length > 1 && (
                    <button
                      onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-faint hover:bg-page"
                      aria-label="Hapus item"
                    >
                      <IconClose width={16} height={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Merek (mis. Nike AF1)" value={it.brand} onChange={(e) => patchItem(i, { brand: e.target.value })} />
                  <Input placeholder="Warna" value={it.color} onChange={(e) => patchItem(i, { color: e.target.value })} />
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Layanan</span>
                  <div className="flex flex-wrap gap-2">
                    {activeServices.map((s) => (
                      <Chip key={s.id} active={it.serviceId === s.id} onClick={() => patchItem(i, { serviceId: s.id })}>
                        {s.name} · {formatIDR(s.price)}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Add-on</span>
                  <div className="flex flex-wrap gap-2">
                    {activeAddons.map((a) => (
                      <Chip
                        key={a.id}
                        active={it.addonIds.includes(a.id)}
                        onClick={() =>
                          patchItem(i, {
                            addonIds: it.addonIds.includes(a.id) ? it.addonIds.filter((x) => x !== a.id) : [...it.addonIds, a.id]
                          })
                        }
                      >
                        {a.name} · {formatIDR(a.price)}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Kondisi awal</span>
                  <div className="flex flex-wrap gap-2">
                    {CONDITION_TAGS.map((t) => (
                      <Chip
                        key={t}
                        active={it.conditionTags.includes(t)}
                        onClick={() =>
                          patchItem(i, {
                            conditionTags: it.conditionTags.includes(t) ? it.conditionTags.filter((x) => x !== t) : [...it.conditionTags, t]
                          })
                        }
                      >
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Input placeholder="Catatan kondisi (opsional)" value={it.conditionNotes} onChange={(e) => patchItem(i, { conditionNotes: e.target.value })} />

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">Jumlah</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => patchItem(i, { quantity: Math.max(1, it.quantity - 1) })} className="h-8 w-8 rounded-full border border-line text-lg leading-none">−</button>
                    <span className="w-6 text-center font-semibold">{it.quantity}</span>
                    <button onClick={() => patchItem(i, { quantity: it.quantity + 1 })} className="h-8 w-8 rounded-full border border-line text-lg leading-none">+</button>
                  </div>
                  <span className="ml-auto text-sm font-semibold text-ink">
                    {svc ? formatIDR((svc.price + it.addonIds.reduce((a, id) => a + (addons.find((x) => x.id === id)?.price ?? 0), 0)) * it.quantity) : '—'}
                  </span>
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink">Foto kondisi (sebelum)</span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {it.photos.map((p, pi) => (
                      <div key={pi} className="relative shrink-0">
                        <img src={p.url} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                        <button
                          onClick={() => patchItem(i, { photos: it.photos.filter((_, idx) => idx !== pi) })}
                          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                          aria-label="Hapus foto"
                        >
                          <IconClose width={14} height={14} />
                        </button>
                      </div>
                    ))}
                    <PhotoCapture label="Foto" onCapture={(url) => patchItem(i, { photos: [...it.photos, { url }] })} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Button variant="secondary" block className="mt-3" onClick={() => setItems((prev) => [...prev, blankItem(activeServices[0]?.id ?? '')])}>
        <IconPlus width={18} height={18} /> Tambah item
      </Button>

      {/* Payment & consent */}
      <Card className="mt-4">
        <CardBody className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Diskon" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" leading={<span className="text-sm">Rp</span>} />
            <Input label="Bayar sekarang" value={paid} onChange={(e) => setPaid(e.target.value.replace(/\D/g, ''))} inputMode="numeric" leading={<span className="text-sm">Rp</span>} placeholder="0 = belum bayar" />
          </div>
          <div className="flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <Chip key={m.value} active={method === m.value} onClick={() => setMethod(m.value)}>
                {m.label}
              </Chip>
            ))}
          </div>
          <ConsentRow label="Izin publikasi foto hasil" desc="Untuk kartu hasil & galeri. Bisa diubah nanti." checked={consent} onChange={setConsent} />
          <ConsentRow label="Pelanggan setuju disclaimer serah-terima" desc={tenant.disclaimerText} checked={disclaimer} onChange={setDisclaimer} required />
          <ConsentRow label="Simpan sebagai draft offline" desc="Simulasi mode tanpa sinyal; sinkron nanti dari Pusat Sinkronisasi." checked={offline} onChange={setOffline} />
        </CardBody>
      </Card>

      <MockNote className="mt-4">
        Order disimpan lokal di peramban—belum ada server, pembayaran, atau sinkronisasi sungguhan.
      </MockNote>

      {/* Sticky summary bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div>
            <p className="text-xs text-ink-soft">Total</p>
            <p className="text-lg font-bold text-ink">{formatIDR(totals.total)}</p>
          </div>
          <Button size="lg" className="ml-auto flex-1" disabled={!canSubmit} onClick={submit}>
            Simpan order
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  label,
  desc,
  checked,
  onChange,
  required
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-page px-3 py-2.5">
      <div className="pr-2">
        <p className="text-sm font-medium text-ink">
          {label} {required && <span className="text-danger">*</span>}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
