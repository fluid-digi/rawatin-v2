import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/data/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhotoCapture } from '@/features/photos/PhotoCapture';
import { Button, Card, CardBody, Chip, EmptyState, useToast } from '@/components/ui';
import { MockNote } from '@/components/MockNote';
import { shareOrDownload } from '@/lib/share';

type Format = 'square' | 'story';
const DIMS: Record<Format, [number, number]> = { square: [1080, 1080], story: [1080, 1920] };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function ShareCard() {
  const { id } = useParams();
  const { getOrder, tenant } = useStore();
  const toast = useToast();
  const order = id ? getOrder(id) : undefined;

  const firstAfter = order?.items.flatMap((it) => it.photos).find((p) => p.type === 'after')?.url;
  const firstAny = order?.items[0]?.photos[0]?.url;
  const [photo, setPhoto] = useState<string | undefined>(firstAfter ?? firstAny);
  const [format, setFormat] = useState<Format>('square');
  const [caption, setCaption] = useState(
    order ? `${order.items[0]?.brand ?? 'Sepatu'} kinclong lagi! ✨ Rawatan by ${tenant.name}. #cucisepatu #${tenant.slug}` : ''
  );
  const [preview, setPreview] = useState<string>('');

  const render = useCallback(async () => {
    if (!order) return;
    const [w, h] = DIMS[format];
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#CA6FDF');
    grad.addColorStop(1, '#82ACFF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const isStory = format === 'story';
    // Layout tuned so title, photo, subtitle, and badge all fit within the canvas.
    const titleY = isStory ? 250 : 110;
    const panelSize = isStory ? w - 180 : 640;
    const panelX = (w - panelSize) / 2;
    const panelY = isStory ? 340 : 170;
    const subtitleY = panelY + panelSize + 90;
    const badgeY = subtitleY + 50;

    // Title (outlet name)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 64px Outfit, sans-serif';
    ctx.fillText(tenant.name, w / 2, titleY);

    if (photo) {
      try {
        const img = await loadImage(photo);
        const r = 48;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelSize, panelSize, r);
        ctx.clip();
        const scale = Math.max(panelSize / img.width, panelSize / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, panelX + (panelSize - dw) / 2, panelY + (panelSize - dh) / 2, dw, dh);
        ctx.restore();
      } catch {
        /* ignore image load failure, keep gradient */
      }
    }

    ctx.font = '500 38px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText('Hasil rawatan ✨ Sebelum → Sesudah', w / 2, subtitleY);

    if (tenant.shareCounterEnabled) {
      const badge = `⭐ ${tenant.totalCaredItems.toLocaleString('id-ID')} pasang terawat`;
      ctx.font = '600 40px Outfit, sans-serif';
      const tw = ctx.measureText(badge).width;
      const bx = (w - tw - 80) / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.roundRect(bx, badgeY, tw + 80, 82, 41);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badge, w / 2, badgeY + 55);
    }

    setPreview(canvas.toDataURL('image/png'));
  }, [order, format, photo, tenant]);

  useEffect(() => {
    render();
  }, [render]);

  if (!order) {
    return (
      <div className="px-4 py-4">
        <PageHeader title="Bagikan hasil" back={`/${tenant.slug}/orders`} />
        <EmptyState title="Order tidak ditemukan" />
      </div>
    );
  }

  const share = async () => {
    if (!preview) return;
    const res = await shareOrDownload({ dataUrl: preview, filename: `rawatin-${order.orderCode}.png`, text: caption });
    toast.show(res === 'downloaded' ? 'Kartu diunduh' : res === 'shared' ? 'Kartu dibagikan' : 'Dibatalkan', { tone: 'success' });
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.show('Caption disalin', { tone: 'success' });
    } catch {
      toast.show('Gagal menyalin caption', { tone: 'danger' });
    }
  };

  return (
    <div className="px-4 pb-10 pt-4 lg:px-8">
      <PageHeader title="Bagikan hasil" subtitle={order.orderCode} back={`/${tenant.slug}/orders/${order.id}`} />

      {!order.publishConsent && (
        <div className="mb-4 rounded-xl bg-[#FDE8EC] px-3 py-2.5 text-sm text-danger">
          Pelanggan belum memberi izin publikasi foto. Minta izin dulu sebelum membagikan ke publik.
        </div>
      )}

      <div className="mx-auto max-w-xs">
        {preview ? (
          <img src={preview} alt="Pratinjau kartu" className={`w-full rounded-2xl shadow-card ${format === 'story' ? 'aspect-[9/16]' : 'aspect-square'} object-cover`} />
        ) : (
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-line" />
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Chip active={format === 'square'} onClick={() => setFormat('square')}>Feed 1:1</Chip>
        <Chip active={format === 'story'} onClick={() => setFormat('story')}>Story 9:16</Chip>
      </div>

      <Card className="mt-4">
        <CardBody className="space-y-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Foto</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {order.items.flatMap((it) => it.photos).map((p) => (
                <button key={p.id} onClick={() => setPhoto(p.url)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${photo === p.url ? 'border-brand-500' : 'border-transparent'}`}>
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              <PhotoCapture label="Foto baru" className="h-16 w-16" onCapture={setPhoto} />
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Caption</span>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400" />
          </label>
        </CardBody>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={copyCaption}>Salin caption</Button>
        <Button onClick={share}>Bagikan / Unduh</Button>
      </div>

      <MockNote className="mt-4">
        Membuka menu bagikan bukan jaminan konten terunggah ke media sosial. Penghitung "pasang terawat"
        memakai data contoh.
      </MockNote>
    </div>
  );
}
