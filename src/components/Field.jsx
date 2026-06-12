export default function Field({ label, hint, children }) {
  return (
    <div className="ctrl">
      <label style={{ marginBottom: hint ? 6 : 8 }}>
        <span className="name">{label}</span>
      </label>
      {children}
      {hint && <div className="hint" style={{ marginTop: 7 }}>{hint}</div>}
    </div>
  );
}
