export const fmt = {
  n: (v, d = 0) =>
    v == null || isNaN(v) ? '—' : Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }),
  money: (v, d = 0) =>
    v == null || isNaN(v) ? '—' : '$' + Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }),
  pct: (v, d = 1) =>
    v == null || isNaN(v) ? '—' : Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%',
  compact: (v) => {
    if (v == null || isNaN(v)) return '—';
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'k';
    return String(Math.round(v));
  },
};

export function niceTicks(min, max, count = 5) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  step *= mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let t = start; t <= max + step * 0.001; t += step) {
    ticks.push(Math.abs(t) < step * 1e-9 ? 0 : t);
  }
  return ticks;
}
