export async function shareOrDownload(opts: {
  dataUrl: string;
  filename: string;
  title?: string;
  text?: string;
}): Promise<'shared' | 'downloaded' | 'cancelled'> {
  try {
    const res = await fetch(opts.dataUrl);
    const blob = await res.blob();
    const file = new File([blob], opts.filename, { type: blob.type || 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: opts.title, text: opts.text });
      return 'shared';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    // fall through to download
  }
  const a = document.createElement('a');
  a.href = opts.dataUrl;
  a.download = opts.filename;
  a.click();
  return 'downloaded';
}
