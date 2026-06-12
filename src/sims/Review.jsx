import React, { useState, useMemo } from 'react';
import { reviewSystems } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import Panel from '../components/Panel';
import KPI from '../components/KPI';
import ChartCard from '../components/ChartCard';
import PlayBar from '../components/PlayBar';
import Callout from '../components/Callout';
import Chart from '../components/charts/Chart';
import ParamList from '../components/ParamList';
import Formula, { Sqrt } from '../components/Formula';
import Case from '../components/Case';
import usePlayback from '../components/usePlayback';

export default function SimReview({ tab }) {
  const [dailyMean, setDM] = useState(40);
  const [dailySd, setSD] = useState(12);
  const [leadDays, setLD] = useState(5);
  const [service, setSvc] = useState(95);
  const [reviewT, setT] = useState(14);
  const [orderQty, setQ] = useState(280);
  const horizon = 140;

  const m = useMemo(() => reviewSystems({ dailyMean, dailySd, leadDays, service, reviewT, orderQty, horizon }), [dailyMean, dailySd, leadDays, service, reviewT, orderQty]);
  const pb = usePlayback(horizon, { fps: 14 });
  const upto = (arr) => arr.filter(([x]) => x <= pb.step);

  if (tab === 'sim') {
    const series = [
      { type: 'line', data: upto(m.cont.inv), color: 'var(--c-blue)', width: 2, name: 'Revisión continua (s,Q)' },
      { type: 'line', data: upto(m.per.inv), color: 'var(--c-violet)', width: 2, name: 'Revisión periódica (R,S)' },
    ];
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Demanda media diaria" value={dailyMean} min={5} max={120} step={5} onChange={setDM} unit=" u" />
            <Slider label="Desv. estándar diaria" value={dailySd} min={0} max={50} step={2} onChange={setSD} unit=" u" />
            <Slider label="Tiempo de entrega (L)" value={leadDays} min={1} max={15} step={1} onChange={setLD} unit=" días" />
            <Slider label="Nivel de servicio" value={service} min={80} max={99.5} step={0.5} onChange={setSvc} fmt={v => v.toFixed(1)} unit=" %" />
            <div className="divider" />
            <Slider label="Periodo de revisión (T)" value={reviewT} min={3} max={30} step={1} onChange={setT} unit=" días" hint="Solo afecta al sistema periódico: cada cuánto se revisa." />
            <Slider label="Lote fijo Q (continua)" value={orderQty} min={100} max={500} step={20} onChange={setQ} unit=" u" hint="Solo afecta al sistema continuo." />
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="ROP · continua" value={fmt.n(m.ropCont, 0)} unit="u" color="var(--c-blue)" sub={`SS ${fmt.n(m.ssCont, 0)} u`} />
              <KPI label="Nivel meta S · periódica" value={fmt.n(m.targetS, 0)} unit="u" color="var(--c-violet)" sub={`SS ${fmt.n(m.ssPer, 0)} u`} />
              <KPI label="Inv. medio · cont / per" value={`${fmt.n(m.cont.avgInv, 0)} / ${fmt.n(m.per.avgInv, 0)}`} color="var(--accent)" />
              <KPI label="Pedidos · cont / per" value={`${m.cont.orders} / ${m.per.orders}`} color="var(--c-amber)" />
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={horizon} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed} labelFmt={(s) => `Día ${s}`} />
            <ChartCard title="Dos políticas, misma demanda" sub="Continua reacciona al instante; periódica revisa en bloques"
              legend={[{ name: 'Revisión continua (s,Q)', color: 'var(--c-blue)' }, { name: 'Revisión periódica (R,S)', color: 'var(--c-violet)' }]}>
              <Chart height={330} series={series} xDomain={[0, horizon]} yDomain={[0, Math.max(m.targetS, m.ropCont + orderQty) * 1.1]}
                xLabel="Días" yLabel="Unidades en stock"
                formatX={v => v + 'd'} />
            </ChartCard>
            <Callout tag="Comparación">La <b>periódica</b> debe cubrir incertidumbre durante <b>T + L</b> días (más colchón, más inventario medio) a cambio de revisar en fechas fijas. La <b>continua</b> solo cubre <b>L</b> días pero exige monitoreo permanente del stock.</Callout>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">Hay dos formas de gobernar un inventario: vigilarlo <strong>en todo momento</strong> o revisarlo <strong>en fechas fijas</strong>. Cada una tiene un costo y una conveniencia distintos.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Corre las dos políticas <strong>sobre la misma demanda aleatoria</strong> para compararlas de forma justa. La <strong>revisión continua (s, Q)</strong> dispara un pedido fijo apenas el stock cruza el ROP. La <strong>revisión periódica (R, S)</strong> espera al día de revisión y entonces pide lo necesario para llegar a un nivel meta S.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 's, Q', name: 'Política continua', desc: 'Punto de reorden s y lote fijo Q. Reacciona al instante.' },
        { sym: 'R, S', name: 'Política periódica', desc: 'Intervalo de revisión R y nivel meta S al que se "rellena".' },
        { sym: 'T', name: 'Periodo de revisión', desc: 'Cada cuánto se mira el inventario en la política periódica.' },
        { sym: 'L', name: 'Lead time', desc: 'Tiempo de entrega, común a ambas.' },
        { sym: 'NS', name: 'Nivel de servicio', desc: 'Define el stock de seguridad de cada política.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Más colchón en periódica:</strong> protege durante T+L, no solo L, así que mantiene más inventario medio.</li>
        <li><strong>Menos pedidos en periódica:</strong> consolida órdenes en fechas fijas, útil para coordinar con proveedores.</li>
        <li><strong>Continua más ágil:</strong> reacciona a picos de demanda al instante, pero exige sistemas de conteo perpetuo.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Diseño del sistema de inventario">Elegir entre código de barras / RFID en tiempo real (continua) o conteos programados (periódica).</Case>
      <Case n="2" title="Coordinación con proveedores">La periódica permite agrupar pedidos de muchos SKU en una sola orden semanal.</Case>
      <Case n="3" title="Artículos clase A vs C">Vigilar de forma continua los pocos artículos caros y de forma periódica los muchos baratos (análisis ABC).</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Las dos políticas</h2>
      <h3>Revisión continua (s, Q)</h3>
      <p>Se monitorea el inventario de forma permanente. Al llegar al punto de reorden <span className="fx">s</span> se pide siempre la misma cantidad <span className="fx">Q</span>. Solo hay que cubrir la incertidumbre del lead time:</p>
      <Formula where={<>s: punto de reorden · L: lead time</>}>
        s = d̄·L + z·σ<sub>d</sub>·<Sqrt>L</Sqrt>
      </Formula>
      <h3>Revisión periódica (R, S)</h3>
      <p>Cada <span className="fx">T</span> días se revisa y se pide hasta el nivel meta <span className="fx">S</span>. Como entre revisiones no se mira el stock, hay que protegerse durante <strong>T + L</strong>:</p>
      <Formula where={<>S: nivel meta · T: periodo de revisión</>}>
        S = d̄·(T + L) + z·σ<sub>d</sub>·<Sqrt>T + L</Sqrt>
      </Formula>
      <h3>Pedido en cada revisión</h3>
      <Formula>Q<sub>t</sub> = S − (inventario actual + pedidos en tránsito)</Formula>
      <Callout blue tag="Regla práctica">Mismo nivel de servicio → la periódica casi siempre mantiene <b>más</b> inventario de seguridad (cubre T+L &gt; L). Se elige cuando el ahorro administrativo de revisar en bloque supera ese inventario extra.</Callout>
    </div>
  );
}
