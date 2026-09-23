// Lightweight inline SVG "photos" so the demo needs no external assets or network.
const PALETTES: Record<string, [string, string]> = {
  before: ['#B8BCC8', '#7C8194'],
  after: ['#CA6FDF', '#82ACFF'],
  issue: ['#FF9AA2', '#B4233D'],
  pickup_proof: ['#55D8C1', '#1FA98A']
};

export function placeholderPhoto(kind: keyof typeof PALETTES, label: string): string {
  const [a, b] = PALETTES[kind] ?? PALETTES.before;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
    </linearGradient></defs>
    <rect width='320' height='320' fill='url(#g)'/>
    <g fill='rgba(255,255,255,0.9)'>
      <path d='M60 210q30-70 90-70 40 0 70 26l30-4q22-2 22 18v22q0 12-12 12H72q-16 0-16-16z'/>
      <circle cx='118' cy='150' r='10' fill='rgba(255,255,255,0.6)'/>
    </g>
    <text x='160' y='300' font-family='Outfit, sans-serif' font-size='22' font-weight='700'
      fill='rgba(255,255,255,0.95)' text-anchor='middle'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
