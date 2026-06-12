export default function KPI({ label, value, unit, sub, color }) {
  return (
    <div className="kpi" style={{ '--accent-line': color || 'var(--primary)' }}>
      <div className="k-label">{label}</div>
      <div className="k-val">{value}{unit && <small> {unit}</small>}</div>
      {sub && <div className="k-sub">{sub}</div>}
    </div>
  );
}
