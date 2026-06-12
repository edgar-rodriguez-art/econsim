import { useState, useEffect, useRef } from 'react';

export default function usePlayback(total, { fps = 6, loop = true } = {}) {
  const [step, setStep] = useState(total);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const raf = useRef(0);
  const acc = useRef(0);
  const last = useRef(0);

  useEffect(() => { if (step > total) setStep(total); }, [total]);

  useEffect(() => {
    if (!playing) return;
    const tick = (t) => {
      if (!last.current) last.current = t;
      acc.current += (t - last.current);
      last.current = t;
      const interval = 1000 / (fps * speed);
      if (acc.current >= interval) {
        acc.current = 0;
        setStep(s => {
          if (s >= total) {
            if (loop) return 0;
            setPlaying(false);
            return total;
          }
          return s + 1;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); last.current = 0; };
  }, [playing, total, speed, fps, loop]);

  const toggle = () => { if (step >= total) setStep(0); setPlaying(p => !p); };
  const reset = () => { setPlaying(false); setStep(total); };

  return { step, setStep, playing, toggle, reset, speed, setSpeed };
}
