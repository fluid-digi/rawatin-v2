import { useRef, useState } from 'react';
import { compressImage } from '@/lib/image';
import { IconCamera } from '@/components/icons';
import { cn } from '@/lib/cn';

export function PhotoCapture({
  label = 'Ambil foto',
  onCapture,
  className
}: {
  label?: string;
  onCapture: (dataUrl: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await compressImage(file);
      onCapture(url);
    } catch {
      // Fallback: read raw file if canvas/WebP is unavailable in this browser.
      const reader = new FileReader();
      reader.onload = () => onCapture(String(reader.result));
      reader.readAsDataURL(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-60',
          className
        )}
      >
        <IconCamera width={22} height={22} />
        {busy ? 'Memproses…' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </>
  );
}
