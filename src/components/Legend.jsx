export default function Legend({ items }) {
  return (
    <div className="chart-legend">
      {items.map((it, i) => (
        <span className="lg-item" key={i}>
          <span
            className={'lg-swatch' + (it.dot ? ' dot' : '') + (it.dash ? ' dash' : '')}
            style={it.dash ? { borderColor: it.color, color: it.color } : { background: it.color }}
          />
          {it.name}
        </span>
      ))}
    </div>
  );
}
