export default function Case({ n, title, children }) {
  return (
    <div className="case">
      <div className="cnum">{n}</div>
      <div><h4>{title}</h4><p>{children}</p></div>
    </div>
  );
}
