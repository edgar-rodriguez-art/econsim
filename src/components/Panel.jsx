export default function Panel({ title, action, children }) {
  return (
    <div className="panel">
      {title && <div className="panel-title">{title}{action}</div>}
      <div className="controls">{children}</div>
    </div>
  );
}
