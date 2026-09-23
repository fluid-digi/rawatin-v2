export function formatIDR(value: number): string {
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${formatDate(iso)} · ${hh}.${mm}`;
}

/** Whole days from now until iso (negative = overdue). */
export function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  const ms = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function daysSince(iso: string): number {
  return -daysUntil(iso);
}

export function relativeDue(iso: string): { label: string; tone: 'ok' | 'warn' | 'late' } {
  const d = daysUntil(iso);
  if (d < 0) return { label: `Terlambat ${Math.abs(d)} hari`, tone: 'late' };
  if (d === 0) return { label: 'Jatuh tempo hari ini', tone: 'warn' };
  if (d === 1) return { label: 'Besok', tone: 'warn' };
  return { label: `${d} hari lagi`, tone: 'ok' };
}
