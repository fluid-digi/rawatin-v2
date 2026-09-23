import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/data/store';
import { USERS } from '@/data/fixtures';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { IconLogo } from '@/components/icons';
import type { Role } from '@/data/types';

export default function Login() {
  const { login, tenant } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('owner');
  const [phone, setPhone] = useState('0811-2223-334');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pin.replace(/\D/g, '').length < 4) {
      setError('Masukkan PIN 4 digit (contoh 1234).');
      return;
    }
    const user = USERS.find((u) => u.role === role) ?? USERS[0];
    login(user.id);
    navigate(`/${tenant.slug}/dashboard`, { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50">
          <IconLogo width={40} height={40} />
        </div>
        <h1 className="text-2xl font-bold text-ink">Selamat datang di Rawatin</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sistem operasional outlet cuci &amp; perawatan sepatu. Masuk untuk mengelola order.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4 p-5">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Masuk sebagai</span>
            <div className="grid grid-cols-2 gap-2">
              {(['owner', 'staff'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={
                    'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ' +
                    (role === r
                      ? 'border-brand-400 bg-brand-50 text-brand-600'
                      : 'border-line bg-white text-ink-soft')
                  }
                >
                  {r === 'owner' ? 'Pemilik outlet' : 'Staf'}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Nomor WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="08xx-xxxx-xxxx"
          />
          <Input
            label="PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            inputMode="numeric"
            maxLength={6}
            placeholder="Masukkan PIN"
            error={error || undefined}
            hint="Demo: PIN apa pun 4 digit dapat digunakan."
          />

          <Button block size="lg" onClick={submit}>
            Masuk
          </Button>
        </CardBody>
      </Card>

      <button
        onClick={() => navigate('/onboarding')}
        className="mt-4 text-center text-sm font-semibold text-brand-600"
      >
        Belum punya outlet? Daftar &amp; atur di sini
      </button>

      <MockNote className="mt-6">
        Login ini simulasi lokal—tanpa server, OTP, atau verifikasi nomor. Data tersimpan di
        peramban Anda saja.
      </MockNote>
    </div>
  );
}
