import React, { useState, useMemo } from 'react';
import { bullwhip } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import SwitchRow from '../components/SwitchRow';
import Panel from '../components/Panel';
import KPI from '../components/KPI';
import ChartCard from '../components/ChartCard';
import PlayBar from '../components/PlayBar';
import Callout from '../components/Callout';
import Chart from '../components/charts/Chart';
import ParamList from '../components/ParamList';
import Formula, { Frac, Sqrt } from '../components/Formula';
import Case from '../components/Case';
import usePlayback from '../components/usePlayback';

const STAGE_COLORS = ['var(--c-teal)', 'var(--c-blue)', 'var(--c-violet)', 'var(--c-coral)'];

export default function SimBullwhip({ tab }) {
  const [demandStep, setStep] = useState(20);
  const [leadTime, setLT] = useState(2);
  const [alpha, setAlpha] = useState(0.3);
  const [safety, setSafety] = useState(1);
  const [shareInfo, setShare] = useState(false);
  const [noise, setNoise] = useState(6);
  const weeks = 40;

  const m = useMemo(() => bullwhip({ weeks, demandStep, leadTime, alpha, safety, shareInfo, noise }), [demandStep, leadTime, alpha, safety, shareInfo, noise]);
  const pb = usePlayback(weeks - 1, { fps: 9 });
  const upto = (arr) => arr.filter(([w]) => w <= pb.step);

  if (tab === 'sim') {
    const series = [{ type: 'line', data: upto(m.series.customer), color: 'var(--ink)', width: 2.6, name: 'Demanda cliente' }];
    m.series.stages.forEach((s, i) => series.push({ type: 'line', data: upto(s), color: STAGE_COLORS[i], width: 1.8, opacity: 0.92, name: m.stages[i] }));
    const ampBars = m.amplification.map((v, i) => [i, v]);
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Cambio de demanda" value={demandStep} min={0} max={50} step={5} onChange={setStep} unit=" u" hint="Salto en la demanda del cliente en la semana 6." />
            <Slider label="Tiempo de entrega (L)" value={leadTime} min={1} max={6} step={1} onChange={setLT} unit=" sem" hint="Más lead time amplifica más el látigo." />
            <Slider label="Suavizado del pronóstico (α)" value={alpha} min={0.1} max={0.9} step={0.05} onChange={setAlpha} fmt={v => v.toFixed(2)} hint="α alto = reacciona rápido y exagera; α bajo = más estable." />
            <Slider label="Factor de seguridad" value={safety} min={0} max={3} step={0.25} onChange={setSafety} fmt={v => v.toFixed(2)} hint="Cuánto colchón añade cada eslabón." />
            <Slider label="Ruido de demanda" value={noise} min={0} max={20} step={2} onChange={setNoise} />
            <div className="divider" />
            <SwitchRow label="Compartir información de demanda" checked={shareInfo} onChange={setShare} />
            <div className="hint" style={{ marginTop: -6 }}>Si todos ven la demanda real del cliente, el látigo casi desaparece.</div>
          </Panel>
          <div>
            <div className="kpis">
              {m.stages.map((s, i) => (
                <KPI key={i} label={s} value={m.amplification[i].toFixed(2) + '×'} color={STAGE_COLORS[i]} sub="amplificación" />
              ))}
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={weeks - 1} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed} labelFmt={(s) => `Semana ${s}`} />
            <ChartCard title="Pedidos a lo largo de la cadena" sub="Una pequeña ola del cliente se vuelve un tsunami aguas arriba"
              legend={[{ name: 'Demanda cliente', color: 'var(--ink)' }, ...m.stages.map((s, i) => ({ name: s, color: STAGE_COLORS[i] }))]}>
              <Chart height={300} series={series} xDomain={[0, weeks - 1]} xLabel="Semanas" yLabel="Pedidos (u)" formatX={v => 's' + v} />
            </ChartCard>
            <div style={{ height: 14 }} />
            <ChartCard title="Amplificación de la variabilidad" sub="Varianza de pedidos de cada eslabón ÷ la del cliente">
              <Chart height={170}
                series={[{ type: 'bar', data: ampBars, color: 'var(--c-blue)', name: 'Amplificación' }]}
                xDomain={[-0.6, 3.6]} yDomain={[0, Math.max(...m.amplification, 2) * 1.15]}
                gridX={false}
                refLines={[{ y: 1, color: 'var(--ink-mute)', dash: '4 3', label: '1×' }]}
                formatX={v => { const stage = m.stages[Math.round(v)]; return stage ? stage.slice(0, 4) : ''; }}
                xTicks={4} yTicks={4}
                formatY={v => v.toFixed(1) + '×'} />
            </ChartCard>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">El efecto látigo es la tendencia de la variabilidad de los pedidos a <strong>amplificarse</strong> a medida que se asciende por la cadena de suministro, desde el cliente hasta la fábrica.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Modela una cadena de cuatro eslabones (minorista → mayorista → distribuidor → fábrica). Cada uno solo ve los pedidos de su cliente inmediato, pronostica la demanda y pide con un colchón. Una variación pequeña en la demanda del cliente final se va <strong>exagerando</strong> en cada eslabón, hasta que la fábrica ve oscilaciones enormes.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'Δd', name: 'Cambio de demanda', desc: 'El "chasquido" inicial: un salto en lo que pide el cliente.' },
        { sym: 'L', name: 'Lead time', desc: 'Retraso de reabasto. Más largo amplifica más el efecto.' },
        { sym: 'α', name: 'Suavizado', desc: 'Reactividad del pronóstico. Reaccionar de más alimenta el látigo.' },
        { sym: 'k', name: 'Factor de seguridad', desc: 'Colchón que cada eslabón añade "por si acaso".' },
        { sym: '⇄', name: 'Compartir info', desc: 'Si todos ven la demanda real del cliente final, el efecto colapsa.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Amplificación creciente:</strong> cada eslabón oscila más que el anterior (barras &gt; 1×).</li>
        <li><strong>Información lo cura:</strong> activa "compartir información" y las curvas se aplanan.</li>
        <li><strong>Sobre-reacción:</strong> α alto y mucho colchón empeoran las oscilaciones.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Diseño de cadenas de suministro">Justifica inversiones en visibilidad de datos (POS compartido, VMI, CPFR).</Case>
      <Case n="2" title="Reducción de inventarios">Menos látigo = menos inventario de seguridad acumulado en toda la cadena.</Case>
      <Case n="3" title="Planeación de capacidad">Evita construir capacidad fabril para picos que en realidad son artefactos del propio sistema.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Origen y medida del efecto</h2>
      <p>Cada eslabón usa una política <em>order-up-to</em>: pide para llevar su posición de inventario hasta un nivel meta basado en el pronóstico:</p>
      <Formula where={<>S: nivel meta · L: lead time · σ: variabilidad observada</>}>
        S = D̂·(L + 1) + k·σ·<Sqrt>L + 1</Sqrt>
      </Formula>
      <p>El pronóstico se actualiza con suavizado exponencial (EWMA):</p>
      <Formula where={<>D̂: pronóstico · D: demanda observada · α: factor de suavizado</>}>
        D̂<sub>t</sub> = α·D<sub>t</sub> + (1 − α)·D̂<sub>t−1</sub>
      </Formula>
      <h3>Razón de amplificación</h3>
      <p>Se mide con el cociente de varianzas entre los pedidos de cada eslabón y la demanda del cliente:</p>
      <Formula where={<>Var: varianza · valor &gt; 1 indica amplificación del látigo</>}>
        Amplificación = <Frac num="Var(pedidos del eslabón)" den="Var(demanda del cliente)" />
      </Formula>
      <p>Con pronóstico exponencial, cada eslabón amplifica el cambio de demanda en un factor aproximado de <span className="fx">1 + (L+1)·α</span> — por eso crece eslabón a eslabón.</p>
      <Callout blue tag="Causas clásicas (Lee et al.)">Actualización de pronósticos, pedidos por lotes, fluctuaciones de precio y racionamiento ante escasez. Las cuatro se atacan con <b>información compartida</b> y <b>lead times cortos</b>.</Callout>
    </div>
  );
}
