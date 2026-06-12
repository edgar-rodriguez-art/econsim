export default function SwitchRow({ label, checked, onChange }) {
  return (
    <div className="switch-row">
      <span className="name">{label}</span>
      <button className={'switch' + (checked ? ' on' : '')} onClick={() => onChange(!checked)} aria-pressed={checked} />
    </div>
  );
}
