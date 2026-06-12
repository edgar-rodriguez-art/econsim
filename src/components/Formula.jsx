export function Frac({ num, den }) {
  return <span className="frac"><span>{num}</span><span>{den}</span></span>;
}

export function Sqrt({ children }) {
  return <span><span className="radic">√</span><span className="sqrt">{children}</span></span>;
}

export default function Formula({ children, where }) {
  return (
    <div className="formula">
      <div className="fmain fx">{children}</div>
      {where && <div className="fwhere">{where}</div>}
    </div>
  );
}
