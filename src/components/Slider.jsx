export default function Slider({ label, value, min, max, step = 1, onChange, fmt: f = (v) => v, hint, unit = '' }) {
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
