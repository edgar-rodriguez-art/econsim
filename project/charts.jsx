/* ============================================================
   EconSim — Chart primitives (SVG, editorial)
   Mirrors what the production app builds with Recharts.
   Exposes: useMeasure, Chart, niceTicks, fmt
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* responsive width measurement */
function useMeasure() {
  const ref = useRef(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      if (cw > 0) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* number formatting helpers */
const fmt = {
  n: (v, d = 0) => (v == null || isNaN(v)) ? "—" : Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }),
  money: (v, d = 0) => (v == null || isNaN(v)) ? "—" : "$" + Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }),
  pct: (v, d = 1) => (v == null || isNaN(v)) ? "—" : Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }) + "%",
  compact: (v) => {
    if (v == null || isNaN(v)) return "—";
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "k";
    return String(Math.round(v));
  }
};

/* nice axis ticks */
function niceTicks(min, max, count = 5) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  let step;
  if (norm < 1.5) step = 1; else if (norm < 3) step = 2; else if (norm < 7) step = 5; else step = 10;
  step *= mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let t = start; t <= max + step * 0.001; t += step) ticks.push(Math.abs(t) < step * 1e-9 ? 0 : t);
  return ticks;
}

/*
  <Chart>
  props:
    height        : number (px, internal coordinate height)
    series        : [{ type:'line'|'area'|'bar'|'scatter', data:[[x,y]...], color, dash, width, fill, opacity, name, dotR, barWidth }]
    xDomain,yDomain : [min,max]   (auto from data if omitted)
    xLabel,yLabel
    formatX,formatY : fn(v)=>string
    xTicks,yTicks : count
    refLines      : [{ x | y, label, color, dash }]
    regions       : [{ x0,x1,y0,y1, color, opacity, label }]
    markers       : [{ x,y, color, r, label, ring }]
    tipFor        : fn(xValue) => {label, rows:[{name,val,color}]}  (vertical crosshair tooltip)
    padL,padR,padT,padB overrides
*/
function Chart(props) {
  const {
    height = 360, series = [], xDomain, yDomain, xLabel, yLabel,
    formatX = (v) => fmt.compact(v), formatY = (v) => fmt.compact(v),
    xTicks = 6, yTicks = 5, refLines = [], regions = [], markers = [],
    tipFor, gridX = true,
  } = props;

  const [ref, W] = useMeasure();
  const [hover, setHover] = useState(null);

  const padL = props.padL ?? 52, padR = props.padR ?? 18, padT = props.padT ?? 14, padB = props.padB ?? 40;
  const H = height;
  const iw = Math.max(40, W - padL - padR);
  const ih = H - padT - padB;

  // domains
  let xs = [], ys = [];
  series.forEach(s => s.data.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  regions.forEach(r => { if (r.x0 != null) xs.push(r.x0, r.x1); if (r.y0 != null) ys.push(r.y0, r.y1); });
  const xMin = xDomain ? xDomain[0] : Math.min(...xs, 0);
  const xMax = xDomain ? xDomain[1] : Math.max(...xs, 1);
  const yMin = yDomain ? yDomain[0] : Math.min(...ys, 0);
  const yMax = yDomain ? yDomain[1] : Math.max(...ys, 1) * 1.05;

  const sx = (x) => padL + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * iw;
  const sy = (y) => padT + ih - (yMax === yMin ? 0.5 : (y - yMin) / (yMax - yMin)) * ih;

  const xt = niceTicks(xMin, xMax, xTicks);
  const yt = niceTicks(yMin, yMax, yTicks);

  const linePath = (data) => data.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join(' ');
  const areaPath = (data) => {
    if (!data.length) return '';
    const top = data.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join(' ');
    return `${top} L${sx(data[data.length - 1][0]).toFixed(2)},${sy(yMin).toFixed(2)} L${sx(data[0][0]).toFixed(2)},${sy(yMin).toFixed(2)} Z`;
  };

  const onMove = (e) => {
    if (!tipFor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = W / rect.width;
    const px = (e.clientX - rect.left) * scale;
    const xVal = xMin + ((px - padL) / iw) * (xMax - xMin);
    const clamped = Math.max(xMin, Math.min(xMax, xVal));
    const tip = tipFor(clamped);
    if (tip) setHover({ x: sx(tip.x ?? clamped), px: (sx(tip.x ?? clamped) / scale), tip });
  };

  // bar width
  const barCount = Math.max(1, (series.find(s => s.type === 'bar')?.data.length) || 1);
  const slot = iw / barCount;

  return (
    <div className="chart-wrap" ref={ref}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} height={H} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {/* y grid + labels */}
        {yt.map((t, i) => (
          <g key={'y' + i}>
            <line x1={padL} x2={padL + iw} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" strokeWidth="1" />
            <text x={padL - 9} y={sy(t) + 3.5} textAnchor="end" fontSize="10.5">{formatY(t)}</text>
          </g>
        ))}
        {/* x grid + labels */}
        {xt.map((t, i) => (
          <g key={'x' + i}>
            {gridX && <line x1={sx(t)} x2={sx(t)} y1={padT} y2={padT + ih} stroke="var(--grid-soft)" strokeWidth="1" />}
            <text x={sx(t)} y={padT + ih + 18} textAnchor="middle" fontSize="10.5">{formatX(t)}</text>
          </g>
        ))}

        {/* regions (shaded) */}
        {regions.map((r, i) => {
          const x0 = sx(r.x0 ?? xMin), x1 = sx(r.x1 ?? xMax);
          const y1 = sy(r.y1 ?? yMax), y0 = sy(r.y0 ?? yMin);
          return <rect key={'r' + i} x={Math.min(x0, x1)} y={Math.min(y0, y1)} width={Math.abs(x1 - x0)} height={Math.abs(y0 - y1)} fill={r.color} opacity={r.opacity ?? 0.12} />;
        })}

        {/* axis baselines */}
        <line x1={padL} x2={padL + iw} y1={padT + ih} y2={padT + ih} stroke="var(--ink-mute)" strokeWidth="1.2" opacity="0.5" />
        <line x1={padL} x2={padL} y1={padT} y2={padT + ih} stroke="var(--ink-mute)" strokeWidth="1.2" opacity="0.5" />

        {/* series */}
        {series.map((s, i) => {
          if (s.type === 'area') {
            return <g key={i}>
              <path d={areaPath(s.data)} fill={s.fill || s.color} opacity={s.opacity ?? 0.14} />
              <path d={linePath(s.data)} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dash || 'none'} strokeLinejoin="round" strokeLinecap="round" />
            </g>;
          }
          if (s.type === 'bar') {
            const bw = s.barWidth ?? Math.min(38, slot * 0.62);
            return <g key={i}>{s.data.map(([x, y], j) => {
              const h = Math.abs(sy(y) - sy(Math.max(0, yMin)));
              const yTop = y >= 0 ? sy(y) : sy(0);
              return <rect key={j} x={sx(x) - bw / 2} y={yTop} width={bw} height={Math.max(1, h)} rx="2.5" fill={s.color} opacity={s.opacity ?? 0.9} />;
            })}</g>;
          }
          if (s.type === 'scatter') {
            return <g key={i}>{s.data.map(([x, y], j) => <circle key={j} cx={sx(x)} cy={sy(y)} r={s.dotR ?? 3} fill={s.color} opacity={s.opacity ?? 0.85} />)}</g>;
          }
          return <g key={i}>
            <path d={linePath(s.data)} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash || 'none'} strokeLinejoin="round" strokeLinecap="round" opacity={s.opacity ?? 1} />
            {s.dotR ? s.data.map(([x, y], j) => <circle key={j} cx={sx(x)} cy={sy(y)} r={s.dotR} fill={s.color} />) : null}
          </g>;
        })}

        {/* reference lines */}
        {refLines.map((r, i) => {
          if (r.x != null) return <g key={'rl' + i}>
            <line x1={sx(r.x)} x2={sx(r.x)} y1={padT} y2={padT + ih} stroke={r.color || 'var(--ink-mute)'} strokeWidth="1.4" strokeDasharray={r.dash || '5 4'} opacity="0.8" />
            {r.label && <text x={sx(r.x) + 5} y={padT + 12} fontSize="10" fill={r.color || 'var(--ink-mute)'} fontWeight="600">{r.label}</text>}
          </g>;
          return <g key={'rl' + i}>
            <line x1={padL} x2={padL + iw} y1={sy(r.y)} y2={sy(r.y)} stroke={r.color || 'var(--ink-mute)'} strokeWidth="1.4" strokeDasharray={r.dash || '5 4'} opacity="0.8" />
            {r.label && <text x={padL + iw - 4} y={sy(r.y) - 5} textAnchor="end" fontSize="10" fill={r.color || 'var(--ink-mute)'} fontWeight="600">{r.label}</text>}
          </g>;
        })}

        {/* markers */}
        {markers.map((m, i) => <g key={'m' + i}>
          {m.ring && <circle cx={sx(m.x)} cy={sy(m.y)} r={(m.r ?? 5) + 5} fill={m.color} opacity="0.16" />}
          <circle cx={sx(m.x)} cy={sy(m.y)} r={m.r ?? 5} fill={m.color} stroke="var(--surface)" strokeWidth="2" />
          {m.label && <text x={sx(m.x)} y={sy(m.y) - 12} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={m.color}>{m.label}</text>}
        </g>)}

        {/* hover crosshair */}
        {hover && <line x1={hover.x} x2={hover.x} y1={padT} y2={padT + ih} stroke="var(--ink-soft)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />}

        {/* axis titles */}
        {yLabel && <text className="axis-title" transform={`rotate(-90 14 ${padT + ih / 2})`} x={14} y={padT + ih / 2} textAnchor="middle" fontSize="11">{yLabel}</text>}
        {xLabel && <text className="axis-title" x={padL + iw / 2} y={H - 4} textAnchor="middle" fontSize="11">{xLabel}</text>}
      </svg>

      {hover && hover.tip && (
        <div className="chart-tip" style={{ left: hover.px, top: padT * (1) + 8 }}>
          <div style={{ marginBottom: 3, opacity: .75 }}>{hover.tip.label}</div>
          {hover.tip.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, display: 'inline-block' }} />{r.name}
              </span>
              <b>{r.val}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* legend helper component */
function Legend({ items }) {
  return (
    <div className="chart-legend">
      {items.map((it, i) => (
        <span className="lg-item" key={i}>
          <span className={"lg-swatch" + (it.dot ? " dot" : "") + (it.dash ? " dash" : "")}
            style={it.dash ? { borderColor: it.color, color: it.color } : { background: it.color }} />
          {it.name}
        </span>
      ))}
    </div>
  );
}

Object.assign(window, { useMeasure, Chart, Legend, niceTicks, fmt });
