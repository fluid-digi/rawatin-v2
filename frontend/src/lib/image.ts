/**
 * Client-side compression mirroring the PRD target: longest side <=1200px, WebP,
 * aiming for <=150KB. Returns a data URL usable directly in <img> for the demo.
 */
export async function compressImage(file: File, maxSide = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D tidak tersedia');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  for (const quality of [0.7, 0.6, 0.5, 0.4]) {
    const url = canvas.toDataURL('image/webp', quality);
    // ~4/3 blowup for base64; stop once under the byte budget.
    if (url.length * 0.75 <= 150 * 1024) return url;
  }
  return canvas.toDataURL('image/webp', 0.4);
}

export function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  return Math.round((dataUrl.length - comma - 1) * 0.75);
}
