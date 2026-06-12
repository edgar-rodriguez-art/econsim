export default function ParamList({ items }) {
  return (
    <div className="paramlist">
      {items.map((it, i) => (
        <div className="row" key={i}>
          <div className="pterm">
            <span className="psym">{it.sym}</span>
            <span className="pname">{it.name}</span>
          </div>
          <div className="pdesc">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
