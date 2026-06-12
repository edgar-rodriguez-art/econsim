import React, { useState, useMemo } from 'react';
import { supplyDemand } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import Panel from '../components/Panel';
import KPI from '../components/KPI';
import ChartCard from '../components/ChartCard';
import Callout from '../components/Callout';
import Chart from '../components/charts/Chart';
import ParamList from '../components/ParamList';
import Formula, { Frac } from '../components/Formula';
import Case from '../components/Case';

export default function SimSupplyDemand({ tab }) {
  const [a, setA] = useState(220), [b, setB] = useState(2.2);
  const [c, setC] = useState(20), [d, setD] = useState(2.8);
  const [demandShift, setDS] = useState(0), [supplyShift, setSS] = useState(0);
  const [tax, setTax] = useState(0);

  const m = useMemo(() => supplyDemand({ a, b, c, d, demandShift, supplyShift, tax }), [a, b, c, d, demandShift, supplyShift, tax]);

  if (tab === 'sim') {
    const series = [
      { type: 'line', data: m.demandCurve, color: 'var(--c-coral)', width: 2.4, name: 'Demanda' },
      { type: 'line', data: m.supplyCurve, color: 'var(--c-blue)', width: 2.4, name: 'Oferta' },
    ];
    const markers = [{ x: m.Qe, y: m.Pe, color: 'var(--accent)', r: 5.5, ring: true, label: 'E' }];
    const refLines = [];
    if (m.hasTax) {
      markers.push({ x: m.Qt, y: m.Pc, color: 'var(--c-blue)', r: 4 });
      markers.push({ x: m.Qt, y: m.Pp, color: 'var(--c-coral)', r: 4 });
      refLines.push({ y: m.Pc, color: 'var(--c-blue)', label: 'Pc' }, { y: m.Pp, color: 'var(--c-coral)', label: 'Pp' });
    }
    return (
      <div className="sim-grid fade-in">
        <Panel title="Parámetros">
          <Slider label="Demanda · intercepto (a)" value={a} min={120} max={320} step={5} onChange={setA} hint="Tamaño del mercado: cuánto se compraría a precio cero." />
          <Slider label="Demanda · sensibilidad (b)" value={b} min={0.6} max={4} step={0.1} onChange={setB} fmt={v => v.toFixed(1)} hint="Pendiente: cuánto cae la cantidad si sube el precio." />
          <Slider label="Oferta · intercepto (c)" value={c} min={-40} max={80} step={5} onChange={setC} hint="Posición de la curva de oferta (costos base)." />
          <Slider label="Oferta · sensibilidad (d)" value={d} min={0.6} max={4} step={0.1} onChange={setD} fmt={v => v.toFixed(1)} />
          <div className="divider" />
          <Slider label="Desplaza demanda" value={demandShift} min={-60} max={60} step={5} onChange={setDS} hint="↑ ingreso, moda, sustitutos → mueve toda la curva." />
          <Slider label="Desplaza oferta" value={supplyShift} min={-60} max={60} step={5} onChange={setSS} hint="↑ = más oferta (mejor tecnología, menores costos)." />
          <Slider label="Impuesto por unidad" value={tax} min={0} max={40} step={2} onChange={setTax} unit=" $" hint="Crea una cuña entre precio del consumidor y del productor." />
        </Panel>
        <div>
          <div className="kpis">
            <KPI label="Precio de equilibrio" value={fmt.money(m.Pe, 1)} color="var(--accent)" />
            <KPI label="Cantidad de equilibrio" value={fmt.n(m.Qe, 0)} unit="u" color="var(--accent)" />
            <KPI label="Excedente consumidor" value={fmt.money(m.hasTax ? m.csT : m.cs, 0)} color="var(--c-coral)" />
            <KPI label={m.hasTax ? 'Recaudación fiscal' : 'Excedente productor'} value={fmt.money(m.hasTax ? m.govRev : m.ps, 0)} color="var(--c-blue)" />
          </div>
          <ChartCard title="Mercado: oferta y demanda" sub="Precio (Y) vs cantidad (X)"
            legend={[{ name: 'Demanda', color: 'var(--c-coral)' }, { name: 'Oferta', color: 'var(--c-blue)' }, { name: 'Equilibrio', color: 'var(--accent)', dot: true }]}>
            <Chart height={400} series={series} markers={markers} refLines={refLines}
              xDomain={[0, m.qAxisMax]} yDomain={[0, m.pAxisMax]}
              xLabel="Cantidad (unidades)" yLabel="Precio ($)"
              formatX={v => fmt.compact(v)} formatY={v => '$' + fmt.compact(v)} />
          </ChartCard>
          {m.hasTax && (
            <Callout tag="Efecto del impuesto">Con un impuesto de <b>${tax}/u</b>, la cantidad cae a <b>{fmt.n(m.Qt, 0)}</b> unidades y se genera una <b>pérdida irrecuperable de {fmt.money(m.dwl, 0)}</b> — bienestar que desaparece porque hay transacciones beneficiosas que ya no ocurren.</Callout>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">La oferta y la demanda describen cómo se forma el <strong>precio</strong> y la <strong>cantidad</strong> de un bien cuando compradores y vendedores interactúan en un mercado.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Dibuja la <strong>curva de demanda</strong> (cuánto quieren comprar los consumidores a cada precio — baja) y la <strong>curva de oferta</strong> (cuánto quieren vender los productores — sube). El punto donde se cruzan es el <strong>equilibrio</strong>: el único precio donde la cantidad ofrecida iguala a la demandada. Puedes desplazar cada curva y aplicar un impuesto para ver cómo se mueve ese punto.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'a', name: 'Intercepto demanda', desc: 'Tamaño potencial del mercado. Sube si crece el ingreso o la población.' },
        { sym: 'b', name: 'Sensibilidad demanda', desc: 'Qué tan elástica es: cuánto reaccionan los compradores ante el precio.' },
        { sym: 'c', name: 'Intercepto oferta', desc: 'Costos base de producción. Más alto = se necesita mejor precio para vender.' },
        { sym: 'd', name: 'Sensibilidad oferta', desc: 'Qué tan rápido aumentan los productores la cantidad cuando sube el precio.' },
        { sym: 'Δ', name: 'Desplazamientos', desc: 'Factores externos (moda, tecnología, clima) que mueven toda la curva.' },
        { sym: 't', name: 'Impuesto unitario', desc: 'Carga fiscal por unidad. Abre una brecha entre el precio que paga el consumidor y el que recibe el productor.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Escasez y excedente:</strong> si el precio está por debajo del equilibrio falta producto; por encima, sobra.</li>
        <li><strong>Desplazamientos:</strong> un aumento de demanda sube precio y cantidad; un aumento de oferta baja el precio y sube la cantidad.</li>
        <li><strong>Impuestos:</strong> reducen la cantidad transada y generan <strong>pérdida irrecuperable</strong> de bienestar.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Pricing y lanzamientos">Estimar la curva de demanda permite fijar el precio que maximiza ingreso sin dejar producto sin vender ni perder ventas por caro.</Case>
      <Case n="2" title="Análisis de impacto regulatorio">Antes de un impuesto, subsidio o tope de precio, anticipar cuánto caerá el volumen y quién absorbe la carga.</Case>
      <Case n="3" title="Sensibilidad de mercado">Saber si tu producto es elástico (sensible al precio) define si conviene competir por precio o por diferenciación.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Modelo lineal del mercado</h2>
      <p>Usamos curvas lineales, la aproximación estándar en microeconomía introductoria:</p>
      <Formula where={<>Q<sub>d</sub>: cantidad demandada · Q<sub>s</sub>: cantidad ofrecida · P: precio</>}>
        Q<sub>d</sub> = a − b·P &nbsp;&nbsp;&nbsp; Q<sub>s</sub> = c + d·P
      </Formula>
      <h3>Equilibrio</h3>
      <p>Se iguala oferta y demanda (Q<sub>d</sub> = Q<sub>s</sub>) y se despeja el precio:</p>
      <Formula>
        P* = <Frac num="a − c" den="b + d" /> &nbsp;&nbsp; Q* = a − b·P*
      </Formula>
      <h3>Impuesto por unidad</h3>
      <p>Un impuesto <span className="fx">t</span> que paga el productor desplaza la oferta. El precio que paga el consumidor (P<sub>c</sub>) y el que recibe el productor (P<sub>p</sub>) difieren en exactamente <span className="fx">t</span>:</p>
      <Formula>
        P<sub>c</sub> = <Frac num="a − c + d·t" den="b + d" /> &nbsp;&nbsp; P<sub>p</sub> = P<sub>c</sub> − t
      </Formula>
      <h3>Excedentes y bienestar</h3>
      <Formula where={<>EC: excedente del consumidor · EP: excedente del productor · PDM: pérdida irrecuperable</>}>
        EC = ½·Q*·(P<sub>max</sub> − P*) &nbsp;&nbsp; PDM = ½·t·(Q* − Q<sub>t</sub>)
      </Formula>
      <Callout blue tag="Nota didáctica">El modelo lineal es una simplificación: en la realidad las curvas pueden ser no lineales y desplazarse de forma simultánea. Aun así captura la intuición esencial que guía decisiones de precio y política.</Callout>
    </div>
  );
}
