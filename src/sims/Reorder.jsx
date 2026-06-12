import React, { useState, useMemo } from 'react';
import { reorderPoint } from '../lib/models';
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
import Formula, { Sqrt } from '../components/Formula';
import Case from '../components/Case';
import usePlayback from '../components/usePlayback';

export default function SimReorder({ tab }) {
  const [dailyMean, setDM] = useState(40);
  const [dailySd, setSD] = useState(12);
  const [leadDays, setLD] = useState(6);
  const [service, setSvc] = useState(95);
  const [orderQty, setQ] = useState(300);
  const [seed, setSeed] = useState(7);
  const horizon = 120;

  const m = useMemo(() => reorderPoint({ dailyMean, dailySd, leadDays, service, orderQty, seed, horizon }), [dailyMean, dailySd, leadDays, service, orderQty, seed]);
  const pb = usePlayback(horizon, { fps: 12 });
  const upto = (arr) => arr.filter(([x]) => x <= pb.step);

  if (tab === 'sim') {
    const invUpto = upto(m.inv);
    const series = [{ type: 'area', data: invUpto, color: 'var(--c-blue)', opacity: 0.12, width: 2, name: 'Stock' }];
    const ordersUpto = m.ordersAt.filter(([x]) => x <= pb.step);
    const markers = ordersUpto.map(([x, y]) => ({ x, y, color: 'var(--c-amber)', r: 3 }));
    const curStock = (invUpto[invUpto.length - 1] || [0, 0])[1];
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Demanda media diaria (d̄)" value={dailyMean} min={5} max={120} step={5} onChange={setDM} unit=" u" />
            <Slider label="Desv. estándar diaria (σ)" value={dailySd} min={0} max={50} step={2} onChange={setSD} unit=" u" hint="Variabilidad de la demanda. A mayor σ, más stock de seguridad." />
            <Slider label="Tiempo de entrega (L)" value={leadDays} min={1} max={20} step={1} onChange={setLD} unit=" días" hint="Más largo = más incertidumbre acumulada." />
            <Slider label="Nivel de servicio" value={service} min={80} max={99.5} step={0.5} onChange={setSvc} fmt={v => v.toFixed(1)} unit=" %" hint="Probabilidad de no quedarte sin stock durante el lead time." />
            <Slider label="Cantidad por pedido (Q)" value={orderQty} min={100} max={600} step={20} onChange={setQ} unit=" u" />
            <div className="divider" />
            <Field label="Escenario de demanda (semilla)">
              <Segmented value={seed} onChange={setSeed} options={[{ value: 7, label: 'A' }, { value: 23, label: 'B' }, { value: 99, label: 'C' }]} />
            </Field>
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="Punto de reorden" value={fmt.n(m.rop, 0)} unit="u" color="var(--c-coral)" sub={`z = ${m.z.toFixed(2)}`} />
              <KPI label="Stock de seguridad" value={fmt.n(m.ss, 0)} unit="u" color="var(--c-amber)" />
              <KPI label="Días con faltante" value={m.stockoutDays} unit={`/ ${horizon}`} color="var(--c-blue)" />
              <KPI label="Tasa de cumplimiento" value={fmt.pct(m.fillRate, 1)} color="var(--accent)" />
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={horizon} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed}
              labelFmt={(s) => `Día ${s} · ${fmt.n(curStock, 0)} u`} />
            <ChartCard title="Inventario simulado con demanda aleatoria" sub="Cada punto ámbar = pedido colocado"
              legend={[{ name: 'Nivel de inventario', color: 'var(--c-blue)' }, { name: 'Punto de reorden', color: 'var(--c-coral)', dash: true }, { name: 'Pedidos', color: 'var(--c-amber)', dot: true }]}>
              <Chart height={330} series={series} markers={markers} xDomain={[0, horizon]} yDomain={[0, (m.rop + orderQty) * 1.15]}
                refLines={[{ y: m.rop, color: 'var(--c-coral)', label: 'ROP' }, { y: m.ss, color: 'var(--c-amber)', dash: '2 3', label: 'SS' }]}
                xLabel="Días" yLabel="Unidades en stock"
                formatX={v => v + 'd'} />
            </ChartCard>
            <Callout tag="Lectura">El stock de seguridad de <b>{fmt.n(m.ss, 0)} u</b> es el colchón contra la variabilidad. Sube el nivel de servicio o σ y verás cómo crece — la protección extra cuesta cada vez más por cada punto porcentual ganado.</Callout>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">El punto de reorden responde <strong>cuándo</strong> volver a pedir cuando la demanda no es perfectamente predecible — el complemento natural del EOQ, que dice <strong>cuánto</strong>.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Simula el inventario día a día con una demanda <strong>aleatoria</strong>. Cuando el stock baja del punto de reorden (ROP) se coloca un pedido que tarda el <em>lead time</em> en llegar. Como la demanda durante esa espera es incierta, se añade un <strong>stock de seguridad</strong> calibrado por el nivel de servicio deseado.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'd̄', name: 'Demanda media', desc: 'Promedio de unidades consumidas por día.' },
        { sym: 'σ', name: 'Desviación estándar', desc: 'Qué tan errática es la demanda diaria. El verdadero motor del stock de seguridad.' },
        { sym: 'L', name: 'Lead time', desc: 'Días desde que pides hasta que recibes. Amplifica la incertidumbre.' },
        { sym: 'NS', name: 'Nivel de servicio', desc: 'Probabilidad objetivo de no agotarse durante el lead time. Fija el factor z.' },
        { sym: 'Q', name: 'Cantidad de pedido', desc: 'Cuánto pides cada vez (suele venir del EOQ).' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Costo del servicio:</strong> pasar de 95% a 99% de servicio dispara el stock de seguridad de forma no lineal.</li>
        <li><strong>Variabilidad manda:</strong> con σ = 0 el ROP es simplemente d̄·L; cada unidad de σ añade colchón.</li>
        <li><strong>Lead time bajo raíz:</strong> reducir el lead time a la mitad no reduce el riesgo a la mitad, sino por √.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Política de reabasto en retail">Evitar quiebres de stock en góndola sin sobre-inventariar productos perecederos.</Case>
      <Case n="2" title="Repuestos críticos">Calibrar cuánto colchón mantener de piezas cuya falta detiene una línea de producción.</Case>
      <Case n="3" title="Acuerdos de nivel de servicio (SLA)">Traducir una promesa de disponibilidad del 98% en una cifra concreta de inventario.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Punto de reorden con incertidumbre</h2>
      <p>El ROP cubre la demanda esperada durante el lead time más un colchón para la variabilidad:</p>
      <Formula where={<>d̄: demanda media diaria · L: lead time · SS: stock de seguridad</>}>
        ROP = d̄·L + SS
      </Formula>
      <h3>Stock de seguridad</h3>
      <p>Suponiendo demanda diaria independiente, la desviación durante el lead time escala con √L:</p>
      <Formula where={<>z: factor del nivel de servicio · σ<sub>d</sub>: desv. estándar diaria</>}>
        SS = z · σ<sub>d</sub> · <Sqrt>L</Sqrt>
      </Formula>
      <h3>Factor de servicio (z)</h3>
      <p>El factor z proviene de la distribución normal estándar. Valores típicos:</p>
      <div className="paramlist">
        <div className="row"><div className="pterm"><span className="psym">90%</span></div><div className="pdesc">z = 1.28</div></div>
        <div className="row"><div className="pterm"><span className="psym">95%</span></div><div className="pdesc">z = 1.65</div></div>
        <div className="row"><div className="pterm"><span className="psym">98%</span></div><div className="pdesc">z = 2.05</div></div>
        <div className="row"><div className="pterm"><span className="psym">99%</span></div><div className="pdesc">z = 2.33</div></div>
      </div>
      <Callout blue tag="Intuición clave">El colchón no crece con el nivel de servicio de forma lineal: las últimas fracciones de un porcentaje (de 99% a 99.9%) son las más caras, porque cubrir eventos cada vez más raros exige cada vez más inventario.</Callout>
    </div>
  );
}
