import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { USERS } from '@/data/fixtures';
import { Button, Card, CardBody, Input, Stepper, Switch } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { IconCheck } from '@/components/icons';

const STEPS = [{ label: 'Outlet' }, { label: 'Layanan' }, { label: 'Bukti' }, { label: 'Selesai' }];

export default function Onboarding() {
  const { tenant, services, updateTenant, login } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [city, setCity] = useState(tenant.city);
  const [disclaimer, setDisclaimer] = useState(tenant.disclaimerText);
  const [requireProof, setRequireProof] = useState(tenant.requirePickupProof);

  const slugTaken = ['admin', 'app', 'api', 'rawatin'].includes(slug.trim().toLowerCase());

  const finish = () => {
    updateTenant({ name, slug: slug.trim().toLowerCase(), city, disclaimerText: disclaimer, requirePickupProof: requireProof });
    const owner = USERS.find((u) => u.role === 'owner')!;
    login(owner.id);
    navigate(`/${slug.trim().toLowerCase()}/dashboard`, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <button onClick={() => navigate('/login')} className="mb-4 self-start text-sm font-semibold text-ink-soft">
        ← Kembali ke masuk
      </button>
      <h1 className="text-2xl font-bold text-ink">Atur outlet Anda</h1>
      <p className="mt-1 text-sm text-ink-soft">Empat langkah singkat sebelum mulai menerima order.</p>

      <div className="my-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <Card className="flex-1">
        <CardBody className="space-y-4 p-5">
          {step === 0 && (
            <>
              <Input label="Nama outlet" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Slug resi publik"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, ''))}
                leading={<span className="text-sm">rawatin.app/</span>}
                error={slugTaken ? 'Slug ini sudah dipakai, coba yang lain.' : undefined}
                hint={!slugTaken ? 'Dipakai untuk tautan resi pelanggan.' : undefined}
              />
              <Input label="Kota" value={city} onChange={(e) => setCity(e.target.value)} />
            </>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                Kami sudah menyiapkan layanan umum. Anda bisa mengubahnya nanti di Akun → Katalog.
              </p>
              <ul className="space-y-2">
                {services.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl bg-page px-3 py-2.5 text-sm">
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="text-ink-soft">
                      {s.durationDays} hari · Rp{s.price.toLocaleString('id-ID')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Teks disclaimer serah-terima</span>
                <textarea
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400"
                />
              </label>
              <div className="flex items-center justify-between rounded-xl bg-page px-3 py-3">
                <div className="pr-4">
                  <p className="text-sm font-medium text-ink">Wajib foto bukti saat pengambilan</p>
                  <p className="text-xs text-ink-soft">Mengurangi komplain "barang tertukar".</p>
                </div>
                <Switch checked={requireProof} onChange={setRequireProof} label="Wajib bukti ambil" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-50 text-mint-700">
                <IconCheck width={28} height={28} />
              </div>
              <p className="text-lg font-semibold text-ink">Outlet siap dipakai</p>
              <p className="mt-1 text-sm text-ink-soft">
                Tambahkan Rawatin ke layar utama lewat menu peramban untuk pengalaman seperti aplikasi.
              </p>
              <MockNote className="mt-4 text-left">
                Instalasi PWA nyata tersedia saat aplikasi berjalan di HTTPS. Preview ini tetap berfungsi
                penuh di peramban.
              </MockNote>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-5 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} className="flex-1">
            Sebelumnya
          </Button>
        )}
        {step < 3 ? (
          <Button size="lg" className="flex-1" disabled={step === 0 && (slugTaken || !name.trim())} onClick={() => setStep((s) => s + 1)}>
            Lanjut
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={finish}>
            Mulai kelola order
          </Button>
        )}
      </div>
    </div>
  );
}
