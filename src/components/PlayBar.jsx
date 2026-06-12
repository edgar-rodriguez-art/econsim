const PlayIcon = () => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5z" fill="currentColor" /></svg>;
const PauseIcon = () => <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2.5" y="2" width="3.2" height="10" rx="1" fill="currentColor" /><rect x="8.3" y="2" width="3.2" height="10" rx="1" fill="currentColor" /></svg>;
const ResetIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1 1 1.6 3.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M3 5v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function PlayBar({ playing, onToggle, step, total, onSeek, onReset, labelFmt = (s) => `${s} / ${total}`, speed, onSpeed }) {
  return (
    <div className="playbar">
      <button className="pbtn primary" onClick={onToggle} title={playing ? 'Pausar' : 'Reproducir'}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button className="pbtn" onClick={onReset} title="Reiniciar">
        <ResetIcon />
      </button>
      <input className="ptrack" type="range" min={0} max={total} step={1} value={step}
        onChange={(e) => onSeek(parseInt(e.target.value))} />
      <span className="plabel">{labelFmt(step)}</span>
      {onSpeed && (
        <div className="segmented" style={{ width: 120, flexShrink: 0 }}>
          {[1, 2, 4].map(s => (
            <button key={s} className={speed === s ? 'on' : ''} onClick={() => onSpeed(s)}>{s}×</button>
          ))}
        </div>
      )}
    </div>
  );
}
