import React, { useState, useMemo } from 'react';
import { beerGame } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import Segmented from '../components/Segmented';
import Field from '../components/Field';
import Panel from '../components/Panel';
import KPI from '../components/KPI';
import ChartCard from '../components/ChartCard';
import PlayBar from '../components/PlayBar';
import Callout from '../components/Callout';
import Chart from '../components/charts/Chart';
import ParamList from '../components/ParamList';
import Formula, { Frac } from '../components/Formula';
import Case from '../components/Case';
import usePlayback from '../components/usePlayback';

const STAGE_COLORS = ['var(--c-teal)', 'var(--c-blue)', 'var(--c-violet)', 'var(--c-coral)'];

export default function SimBeer({ tab }) {
  const [stepDemand, setStepD] = useState(8);
  const [policy, setPolicy] = useState('basestock');
  const [baseStock, setBase] = useState(16);
  const [holdCost, setHold] = useState(0.5);
  const [backCost, setBack] = useState(1);
  const [view, setView] = useState('inv');
  const weeks = 36;

  const m = useMemo(() => beerGame({ weeks, stepDemand, policy, baseStock, holdCost, backCost }), [stepDemand, policy, baseStock, holdCost, backCost]);
  const pb = usePlayback(weeks - 1, { fps: 8 });
  const upto = (arr) => arr.filter(([w]) => w <= pb.step);

  if (tab === 'sim') {
    const key = view === 'inv' ? 'inv' : view === 'order' ? 'order' : 'cost';
    const series = m.hist[key].map((s, i) => ({ type: 'line', data: upto(s), color: STAGE_COLORS[i], width: 2, name: m.names[i] }));
    if (view === 'order') series.unshift({ type: 'line', data: upto(m.customerSeries), color: 'var(--ink)', width: 2.4, dash: '4 3', name: 'Cliente' });
    const titles = { inv: 'Inventario neto por etapa', order: 'Pedidos colocados por etapa', cost: 'Costo acumulado semanal por etapa' };
    const subs = { inv: 'Positivo = stock · Negativo = pedidos pendientes (backlog)', order: 'Línea negra = demanda real del cliente', cost: 'Mantener + penalización por faltante' };
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Field label="Política de pedido">
              <Segmented value={policy} onChange={setPolicy} options={[{ value: 'basestock', label: 'Base-stock' }, { value: 'naive', label: 'Ingenua' }]} />
              <div className="hint" style={{ marginTop: 7 }}>{policy === 'basestock' ? 'Pide considerando inventario en tránsito: estabiliza.' : 'Pide lo que te piden: provoca oscilaciones.'}</div>
            </Field>
            <Slider label="Demanda tras el salto" value={stepDemand} min={4} max={20} step={1} onChange={setStepD} unit=" u" hint="El cliente sube su pedido en la semana 5." />
            <Slider label="Nivel base-stock" value={baseStock} min={8} max={40} step={2} onChange={setBase} unit=" u" />
            <div className="divider" />
            <Slider label="Costo de mantener" value={holdCost} min={0.25} max={2} step={0.25} onChange={setHold} fmt={v => fmt.money(v, 2)} unit="/u" />
            <Slider label="Costo de faltante" value={backCost} min={0.5} max={4} step={0.5} onChange={setBack} fmt={v => fmt.money(v, 2)} unit="/u" hint="Suele penalizarse más que mantener." />
            <Field label="Vista del gráfico">
              <Segmented value={view} onChange={setView} options={[{ value: 'inv', label: 'Inventario' }, { value: 'order', label: 'Pedidos' }, { value: 'cost', label: 'Costo' }]} />
            </Field>
          </Panel>
          <div>
            <div className="kpis">
              {m.names.map((s, i) => (
                <KPI key={i} label={s} value={fmt.money(m.totalCost[i], 0)} color={STAGE_COLORS[i]} sub="costo total" />
              ))}
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={weeks - 1} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed} labelFmt={(s) => `Semana ${s}`} />
            <ChartCard title={titles[view]} sub={subs[view]}
              legend={[...(view === 'order' ? [{ name: 'Cliente', color: 'var(--ink)', dash: true }] : []), ...m.names.map((s, i) => ({ name: s, color: STAGE_COLORS[i] }))]}>
              <Chart height={320} series={series} xDomain={[0, weeks - 1]} xLabel="Semanas"
                yLabel={view === 'cost' ? 'Costo ($)' : 'Unidades'}
                formatX={v => 's' + v}
                formatY={v => view === 'cost' ? '$' + fmt.compact(v) : fmt.compact(v)} />
            </ChartCard>
            <Callout tag="Costo total de la cadena">Con esta configuración, la cadena completa acumula <b>{fmt.money(m.grandTotal, 0)}</b>. Cambia a política <b>ingenua</b> y observa cómo las oscilaciones —y el costo— se disparan: ese es el corazón del Beer Game.</Callout>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">El Beer Game es el ejercicio de simulación más famoso de la gestión de operaciones: una cadena de cuatro eslabones donde cada jugador, decidiendo localmente, genera caos global.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Recrea una cadena de distribución de cerveza: <strong>minorista, mayorista, distribuidor y fábrica</strong>. Hay <strong>retrasos</strong> tanto al pedir hacia arriba como al recibir envíos. Cada etapa decide cuánto pedir con información limitada. Verás cómo emergen el efecto látigo, los faltantes y los excesos de inventario incluso con una demanda casi estable.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'Política', name: 'Regla de pedido', desc: 'Base-stock tiene en cuenta el inventario en tránsito; la ingenua solo repite el pedido recibido.' },
        { sym: 'S', name: 'Nivel base-stock', desc: 'Inventario objetivo que cada etapa intenta mantener.' },
        { sym: 'h', name: 'Costo de mantener', desc: 'Penalización por unidad en stock cada semana.' },
        { sym: 'b', name: 'Costo de faltante', desc: 'Penalización por unidad pendiente de entregar (backlog).' },
        { sym: 'Δd', name: 'Salto de demanda', desc: 'El cambio único en la demanda que desata toda la dinámica.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Oscilaciones crecientes:</strong> inventarios que pasan de faltante a exceso una y otra vez.</li>
        <li><strong>Desfase temporal:</strong> los picos de la fábrica llegan semanas después del cambio del cliente.</li>
        <li><strong>La política importa:</strong> base-stock amortigua; la ingenua amplifica.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Formación de equipos">Es la herramienta didáctica estándar para enseñar pensamiento sistémico en supply chain.</Case>
      <Case n="2" title="Justificar visibilidad de datos">Demuestra de forma visceral el valor de compartir información de demanda en tiempo real.</Case>
      <Case n="3" title="Diseño de políticas de reposición">Probar reglas de pedido antes de implementarlas en sistemas ERP reales.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Dinámica del juego</h2>
      <p>En cada periodo, cada etapa actualiza su inventario neto: recibe envíos, satisface la demanda entrante (más cualquier backlog) y envía aguas abajo.</p>
      <Formula where={<>I: inventario · B: backlog · w: semana</>}>
        I<sub>w</sub> = I<sub>w−1</sub> + Recibido − (Demanda + B<sub>w−1</sub>)
      </Formula>
      <h3>Posición de inventario</h3>
      <p>La decisión de pedido se basa en la <strong>posición de inventario</strong>, no solo en lo que hay en almacén:</p>
      <Formula>IP = Inventario − Backlog + Pedidos en tránsito</Formula>
      <h3>Política base-stock</h3>
      <Formula where={<>S: nivel objetivo · pedido nunca negativo</>}>
        Pedido<sub>w</sub> = max(0, S − IP)
      </Formula>
      <h3>Costo por etapa</h3>
      <Formula where={<>h: costo de mantener · b: costo de faltante</>}>
        Costo<sub>w</sub> = h·I<sub>w</sub><sup>+</sup> + b·B<sub>w</sub>
      </Formula>
      <Callout blue tag="La lección de Forrester">Las oscilaciones no surgen de jugadores irracionales, sino de la <b>estructura</b> del sistema: retrasos de información y de material. Cambiar la estructura (no culpar a las personas) es lo que estabiliza la cadena.</Callout>
    </div>
  );
}
