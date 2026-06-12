import React, { useState, useMemo } from 'react';
import { eoq } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import Panel from '../components/Panel';
import KPI from '../components/KPI';
import ChartCard from '../components/ChartCard';
import Callout from '../components/Callout';
import Chart from '../components/charts/Chart';
import ParamList from '../components/ParamList';
import Formula, { Frac, Sqrt } from '../components/Formula';
import Case from '../components/Case';

export default function SimEOQ({ tab }) {
  const [demand, setD] = useState(12000);
  const [orderCost, setOC] = useState(400);
  const [holdCost, setHC] = useState(8);
  const [unitCost, setUC] = useState(25);
  const [leadDays, setLD] = useState(7);

  const m = useMemo(() => eoq({ demand, orderCost, holdCost, unitCost, leadDays }), [demand, orderCost, holdCost, unitCost, leadDays]);

  if (tab === 'sim') {
    const series = [
      { type: 'line', data: m.curve.order, color: 'var(--c-amber)', width: 2, name: 'Costo de pedir' },
      { type: 'line', data: m.curve.hold, color: 'var(--c-teal)', width: 2, name: 'Costo de mantener' },
      { type: 'line', data: m.curve.total, color: 'var(--c-blue)', width: 2.6, name: 'Costo total' },
    ];
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Demanda anual (D)" value={demand} min={1000} max={50000} step={500} onChange={setD} fmt={v => fmt.compact(v)} unit=" u" hint="Unidades que vendes al año." />
            <Slider label="Costo de pedir (S)" value={orderCost} min={50} max={1500} step={25} onChange={setOC} fmt={v => fmt.money(v)} hint="Costo fijo de colocar una orden (envío, gestión)." />
            <Slider label="Costo de mantener (H)" value={holdCost} min={1} max={40} step={1} onChange={setHC} fmt={v => fmt.money(v)} unit="/u·año" hint="Costo de tener una unidad en almacén un año." />
            <Slider label="Costo unitario (C)" value={unitCost} min={1} max={120} step={1} onChange={setUC} fmt={v => fmt.money(v)} />
            <Slider label="Tiempo de entrega (L)" value={leadDays} min={1} max={30} step={1} onChange={setLD} unit=" días" />
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="EOQ (lote óptimo)" value={fmt.n(m.Q, 0)} unit="u" color="var(--c-blue)" />
              <KPI label="Pedidos por año" value={fmt.n(m.ordersPerYear, 1)} color="var(--c-amber)" sub={`cada ${fmt.n(m.cycleDays, 0)} días`} />
              <KPI label="Costo anual de inventario" value={fmt.money(m.totalInv)} color="var(--accent)" sub="pedir + mantener" />
              <KPI label="Punto de reorden" value={fmt.n(m.rop, 0)} unit="u" color="var(--c-teal)" />
            </div>
            <ChartCard title="Costos vs tamaño de lote" sub="El EOQ minimiza el costo total"
              legend={[{ name: 'Costo de pedir', color: 'var(--c-amber)' }, { name: 'Costo de mantener', color: 'var(--c-teal)' }, { name: 'Costo total', color: 'var(--c-blue)' }]}>
              <Chart height={300} series={series} xDomain={[0, m.qMax]} yDomain={[0, m.curve.total[2][1]]}
                refLines={[{ x: m.Q, color: 'var(--c-blue)', label: 'EOQ' }]}
                markers={[{ x: m.Q, y: m.totalInv, color: 'var(--c-blue)', r: 5, ring: true }]}
                xLabel="Tamaño del lote Q (unidades)" yLabel="Costo anual ($)"
                formatY={v => '$' + fmt.compact(v)} formatX={v => fmt.compact(v)} />
            </ChartCard>
            <div style={{ height: 14 }} />
            <ChartCard title="Nivel de inventario en el tiempo" sub="Patrón de diente de sierra">
              <Chart height={170}
                series={[{ type: 'area', data: m.saw, color: 'var(--c-teal)', opacity: 0.16, width: 2, name: 'Stock' }]}
                xDomain={[0, m.cycleDays * 3]} yDomain={[0, m.Q * 1.1]}
                refLines={[{ y: m.rop, color: 'var(--c-coral)', label: 'Reorden' }, { y: m.Q / 2, color: 'var(--ink-mute)', dash: '2 3', label: 'Inv. medio' }]}
                xLabel="Días" yLabel="Unidades"
                formatX={v => fmt.compact(v) + 'd'} yTicks={4} />
            </ChartCard>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">El EOQ responde a una pregunta de oro en logística: <strong>¿cuántas unidades pedir cada vez</strong> para gastar lo mínimo posible en inventario?</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Equilibra dos costos que tiran en direcciones opuestas. Pedir <strong>lotes grandes</strong> reduce el número de órdenes (menos costo de pedir) pero llena el almacén (más costo de mantener). Pedir <strong>lotes pequeños</strong> hace lo contrario. El EOQ es el punto exacto donde ambos se igualan y el costo total toca su mínimo.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'D', name: 'Demanda anual', desc: 'Unidades vendidas al año. Define el ritmo de consumo.' },
        { sym: 'S', name: 'Costo de ordenar', desc: 'Costo fijo por cada pedido: papeleo, transporte, recepción.' },
        { sym: 'H', name: 'Costo de mantener', desc: 'Costo anual de tener una unidad: capital inmovilizado, espacio, seguro, merma.' },
        { sym: 'C', name: 'Costo unitario', desc: 'Precio de compra. No afecta el EOQ, pero sí el costo total.' },
        { sym: 'L', name: 'Tiempo de entrega', desc: 'Días entre pedir y recibir. Determina el punto de reorden.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Curva en U:</strong> el costo total tiene un mínimo claro; alejarse del EOQ encarece poco al inicio y mucho después.</li>
        <li><strong>Raíz cuadrada:</strong> duplicar la demanda no duplica el lote — solo lo multiplica por ~1.41.</li>
        <li><strong>Robustez:</strong> el costo es bastante plano cerca del óptimo, así que pequeñas desviaciones cuestan poco.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Compras y reabastecimiento">Define la política de pedido para cada SKU en retail, manufactura y farmacias.</Case>
      <Case n="2" title="Negociación de descuentos por volumen">Compara el ahorro de comprar más barato contra el costo extra de almacenar.</Case>
      <Case n="3" title="Gestión de capital de trabajo">Menos inventario inmovilizado libera efectivo para el resto del negocio.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Derivación del EOQ</h2>
      <p>El costo anual relevante suma el costo de pedir y el de mantener:</p>
      <Formula where={<>Q: tamaño del lote · D/Q: número de pedidos · Q/2: inventario promedio</>}>
        CT(Q) = <Frac num="D" den="Q" />·S + <Frac num="Q" den="2" />·H
      </Formula>
      <p>Derivando respecto a Q e igualando a cero se obtiene el lote óptimo:</p>
      <Formula>
        EOQ = <Sqrt><Frac num="2·D·S" den="H" /></Sqrt>
      </Formula>
      <h3>Métricas derivadas</h3>
      <Formula where={<>N: pedidos por año · T: tiempo de ciclo · d: demanda diaria</>}>
        N = <Frac num="D" den="EOQ" /> &nbsp;&nbsp; T = <Frac num="365" den="N" /> &nbsp;&nbsp; ROP = d·L
      </Formula>
      <h3>Costo total mínimo</h3>
      <Formula>CT* = <Sqrt>2·D·S·H</Sqrt></Formula>
      <Callout blue tag="Supuestos del modelo">Demanda constante y conocida, sin faltantes, reposición instantánea del lote completo y costos estables. Cuando la demanda es variable, se complementa con stock de seguridad (ver Punto de reorden).</Callout>
    </div>
  );
}
