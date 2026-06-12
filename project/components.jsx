/* ============================================================
   EconSim — Componentes UI compartidos
   ============================================================ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Slider({ label, value, min, max, step = 1, onChange, fmt: f = (v) => v, hint, unit = "" }) {
  return (
    <div className="ctrl">
      <label>
        <span className="name">{label}</span>
        <span className="val">{f(value)}{unit}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="segmented">
      {options.map(o => (
        <button key={o.value} className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <div className="switch-row">
      <span className="name">{label}</span>
      <button className={"switch" + (checked ? " on" : "")} onClick={() => onChange(!checked)} aria-pressed={checked} />
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="ctrl">
      <label style={{ marginBottom: hint ? 6 : 8 }}><span className="name">{label}</span></label>
      {children}
      {hint && <div className="hint" style={{ marginTop: 7 }}>{hint}</div>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="panel">
      {title && <div className="panel-title">{title}{action}</div>}
      <div className="controls">{children}</div>
    </div>
  );
}

function KPI({ label, value, unit, sub, color }) {
  return (
    <div className="kpi" style={{ "--accent-line": color || "var(--primary)" }}>
      <div className="k-label">{label}</div>
      <div className="k-val">{value}{unit && <small> {unit}</small>}</div>
      {sub && <div className="k-sub">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, sub, legend, children }) {
  return (
    <div className="chart-card">
      {(title || sub) && (
        <div className="chart-head">
          <h3>{title}</h3>
          {sub && <span className="ch-sub">{sub}</span>}
        </div>
      )}
      {children}
      {legend && <Legend items={legend} />}
    </div>
  );
}

/* play / pause / scrub bar for time-based sims */
function PlayBar({ playing, onToggle, step, total, onSeek, onReset, labelFmt = (s) => `${s} / ${total}`, speed, onSpeed }) {
  return (
    <div className="playbar">
      <button className="pbtn primary" onClick={onToggle} title={playing ? "Pausar" : "Reproducir"}>
        {playing
          ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2.5" y="2" width="3.2" height="10" rx="1" fill="currentColor" /><rect x="8.3" y="2" width="3.2" height="10" rx="1" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor" /></svg>}
      </button>
      <button className="pbtn" onClick={onReset} title="Reiniciar">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1 1 1.6 3.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M3 5v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <input className="ptrack" type="range" min={0} max={total} step={1} value={step} onChange={(e) => onSeek(parseInt(e.target.value))} />
      <span className="plabel">{labelFmt(step)}</span>
      {onSpeed && (
        <div className="segmented" style={{ width: 120, flexShrink: 0 }}>
          {[1, 2, 4].map(s => <button key={s} className={speed === s ? "on" : ""} onClick={() => onSpeed(s)}>{s}×</button>)}
        </div>
      )}
    </div>
  );
}

/* hook: animation clock that advances `step` 0..total while playing */
function usePlayback(total, { fps = 6, loop = true } = {}) {
  const [step, setStep] = useState(total);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const raf = useRef(0); const acc = useRef(0); const last = useRef(0);
  useEffect(() => { if (step > total) setStep(total); }, [total]);
  useEffect(() => {
    if (!playing) return;
    const tick = (t) => {
      if (!last.current) last.current = t;
      acc.current += (t - last.current); last.current = t;
      const interval = 1000 / (fps * speed);
      if (acc.current >= interval) {
        acc.current = 0;
        setStep(s => {
          if (s >= total) { if (loop) return 0; setPlaying(false); return total; }
          return s + 1;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); last.current = 0; };
  }, [playing, total, speed, fps, loop]);
  const toggle = () => { if (step >= total) setStep(0); setPlaying(p => !p); };
  const reset = () => { setPlaying(false); setStep(total); };
  return { step, setStep, playing, toggle, reset, speed, setSpeed };
}

/* Formula helpers (editorial math via HTML) */
function Frac({ num, den }) {
  return <span className="frac"><span>{num}</span><span>{den}</span></span>;
}
function Sqrt({ children }) {
  return <span><span className="radic">√</span><span className="sqrt">{children}</span></span>;
}
function Formula({ children, where }) {
  return (
    <div className="formula">
      <div className="fmain fx">{children}</div>
      {where && <div className="fwhere">{where}</div>}
    </div>
  );
}

/* prose building blocks */
function ParamList({ items }) {
  return (
    <div className="paramlist">
      {items.map((it, i) => (
        <div className="row" key={i}>
          <div className="pterm"><span className="psym">{it.sym}</span><span className="pname">{it.name}</span></div>
          <div className="pdesc">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
function Callout({ tag, blue, children }) {
  return <div className={"callout" + (blue ? " blue" : "")}>{tag && <span className="ctag">{tag}</span>}{children}</div>;
}
function Case({ n, title, children }) {
  return <div className="case"><div className="cnum">{n}</div><div><h4>{title}</h4><p>{children}</p></div></div>;
}

Object.assign(window, {
  Slider, Segmented, SwitchRow, Field, Panel, KPI, ChartCard, PlayBar, usePlayback,
  Frac, Sqrt, Formula, ParamList, Callout, Case
});
