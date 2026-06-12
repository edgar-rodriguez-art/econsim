export default function Callout({ tag, blue, children }) {
  return (
    <div className={'callout' + (blue ? ' blue' : '')}>
      {tag && <span className="ctag">{tag}</span>}
      {children}
    </div>
  );
}
