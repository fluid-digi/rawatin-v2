import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { USERS, WA_TEMPLATES } from '@/data/fixtures';
import { Button, Card, CardBody, Input, Modal, Switch, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { formatIDR } from '@/lib/format';
import { IconChevron } from '@/components/icons';
import type { Role } from '@/data/types';

export default function Account() {
  const { tenant, services, currentUser, updateTenant, toggleService, switchRole, resetDemo, logout, pendingSync } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(tenant.name);
  const [disclaimer, setDisclaimer] = useState(tenant.disclaimerText);
  const [confirmReset, setConfirmReset] = useState(false);

  const saveOutlet = () => {
    updateTenant({ name, disclaimerText: disclaimer });
    toast.show('Pengaturan outlet disimpan', { tone: 'success' });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-ink">Akun &amp; pengaturan</h1>

      <Card>
        <CardBody className="space-y-3">
          <p className="font-semibold text-ink">Identitas outlet</p>
          <Input label="Nama outlet" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-page px-3 py-2">
              <p className="text-ink-faint">Slug</p>
              <p className="font-medium text-ink">{tenant.slug}</p>
            </div>
            <div className="rounded-xl bg-page px-3 py-2">
              <p className="text-ink-faint">Paket</p>
              <p className="font-medium capitalize text-ink">{tenant.plan}</p>
            </div>
          </div>
          <Button variant="secondary" block onClick={saveOutlet}>Simpan</Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <p className="font-semibold text-ink">Peran aktif (untuk mencoba UI)</p>
          <div className="grid grid-cols-2 gap-2">
            {(['owner', 'staff'] as Role[]).map((r) => {
              const u = USERS.find((x) => x.role === r)!;
              return (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(u.id);
                    toast.show(`Beralih ke ${r === 'owner' ? 'Pemilik' : 'Staf'}`);
                  }}
                  className={
                    'rounded-xl border px-3 py-2.5 text-sm font-semibold ' +
                    (currentUser.role === r ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-line text-ink-soft')
                  }
                >
                  {r === 'owner' ? 'Pemilik' : 'Staf'}
                  <span className="block text-xs font-normal text-ink-faint">{u.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink-faint">Staf tidak melihat Laporan/omzet; slot navigasi menjadi Tindak lanjut.</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <p className="font-semibold text-ink">Katalog layanan</p>
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-page px-3 py-2.5">
              <div>
                <p className={`text-sm font-medium ${s.isActive ? 'text-ink' : 'text-ink-faint line-through'}`}>{s.name}</p>
                <p className="text-xs text-ink-soft">{s.durationDays} hari · {formatIDR(s.price)}</p>
              </div>
              <Switch checked={s.isActive} onChange={() => toggleService(s.id)} label={s.name} />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <p className="font-semibold text-ink">Bukti &amp; disclaimer</p>
          <div className="flex items-center justify-between rounded-xl bg-page px-3 py-2.5">
            <div className="pr-3">
              <p className="text-sm font-medium text-ink">Wajib foto saat pengambilan</p>
              <p className="text-xs text-ink-soft">Direkomendasikan untuk anti-komplain.</p>
            </div>
            <Switch checked={tenant.requirePickupProof} onChange={(v) => updateTenant({ requirePickupProof: v })} label="Wajib bukti ambil" />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Teks disclaimer</span>
            <textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} rows={3} className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400" />
          </label>
          <Button variant="secondary" block onClick={saveOutlet}>Simpan disclaimer</Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <p className="font-semibold text-ink">Template WhatsApp</p>
          {WA_TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl bg-page px-3 py-2">
              <p className="text-sm font-medium text-ink">{t.label}</p>
              <p className="line-clamp-2 text-xs text-ink-soft">{t.body}</p>
            </div>
          ))}
          <p className="text-xs text-ink-faint">Editor template penuh menyusul; pratinjau &amp; kirim tersedia di setiap order.</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="divide-y divide-line">
          <LinkRow to={`/${tenant.slug}/labels`} label="Cetak label QR" />
          <LinkRow to={`/${tenant.slug}/sync`} label={`Pusat sinkronisasi${pendingSync ? ` · ${pendingSync} menunggu` : ''}`} />
        </CardBody>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" block onClick={() => setConfirmReset(true)}>Reset data demo</Button>
        <Button variant="ghost" block onClick={() => { logout(); navigate('/login', { replace: true }); }}>Keluar</Button>
      </div>

      <MockNote>Semua pengaturan &amp; data tersimpan lokal di peramban ini. Belum ada akun atau server.</MockNote>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <p className="text-lg font-semibold text-ink">Reset data demo?</p>
        <p className="mt-1 text-sm text-ink-soft">Semua order, foto, dan pengaturan kembali ke contoh awal.</p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" block onClick={() => setConfirmReset(false)}>Batal</Button>
          <Button variant="danger" block onClick={() => { resetDemo(); setConfirmReset(false); toast.show('Data demo direset', { tone: 'success' }); navigate(`/${tenant.slug}/dashboard`); }}>Reset</Button>
        </div>
      </Modal>
    </div>
  );
}

function LinkRow({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between py-3 text-sm font-medium text-ink first:pt-0 last:pb-0">
      {label}
      <IconChevron width={18} height={18} className="text-ink-faint" />
    </Link>
  );
}
