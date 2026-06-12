import Legend from './Legend';

export default function ChartCard({ title, sub, legend, children }) {
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
