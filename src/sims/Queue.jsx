import React, { useState, useMemo } from 'react';
import { queue } from '../lib/models';
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

export default function SimQueue({ tab }) {
  const [lambda, setLambda] = useState(8);
  const [mu, setMu] = useState(10);
  const [servers, setServers] = useState(1);

  const m = useMemo(() => queue({ lambda, mu, servers }), [lambda, mu, servers]);

  if (tab === 'sim') {
    const wqCurve = m.curve.Wq.filter(([, y]) => y < 999);
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Tasa de llegadas (λ)" value={lambda} min={1} max={20} step={0.5} onChange={setLambda} fmt={v => v.toFixed(1)} unit="/h" hint="Clientes que llegan por hora." />
            <Slider label="Tasa de servicio (μ)" value={mu} min={2} max={22} step={0.5} onChange={setMu} fmt={v => v.toFixed(1)} unit="/h" hint="Clientes que atiende UN servidor por hora." />
            <Slider label="Número de servidores (c)" value={servers} min={1} max={6} step={1} onChange={setServers} hint="Cajas, ventanillas o máquinas en paralelo." />
            <div className="divider" />
            <div className="note">
              <span className="tag" style={{ background: m.stable ? 'var(--accent-wk)' : '#fde8e6', color: m.stable ? 'var(--accent)' : 'var(--c-coral)' }}>
                {m.stable ? 'Sistema estable' : 'Sistema saturado'}
              </span>
            </div>
            {!m.stable && <div className="hint" style={{ color: 'var(--c-coral)' }}>La utilización ≥ 100%: la cola crece sin límite. Añade servidores o acelera el servicio.</div>}
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="Utilización (ρ)" value={fmt.pct(m.rho * 100, 1)} color={m.rho > 0.85 ? 'var(--c-coral)' : 'var(--accent)'} />
              <KPI label="En el sistema (L)" value={m.stable ? fmt.n(m.L, 2) : '∞'} color="var(--c-blue)" sub="clientes" />
              <KPI label="Espera en cola (Wq)" value={m.stable ? fmt.n(m.Wq * 60, 1) : '∞'} unit="min" color="var(--c-amber)" />
              <KPI label="Prob. de esperar" value={fmt.pct(m.Pwait * 100, 0)} color="var(--c-violet)" />
            </div>
            <ChartCard title="El cuello de botella: espera vs utilización" sub="La espera explota de forma no lineal al acercarse al 100%"
              legend={[{ name: 'Espera en cola (Wq)', color: 'var(--c-amber)' }, { name: 'Operación actual', color: 'var(--c-coral)', dot: true }]}>
              <Chart height={300}
                series={[{ type: 'area', data: wqCurve.map(([x, y]) => [x, y * 60]), color: 'var(--c-amber)', opacity: 0.14, width: 2.4, name: 'Wq (min)' }]}
                xDomain={[0, 1]}
                yDomain={[0, Math.min(60, m.stable ? Math.max(m.Wq * 60 * 1.4, 10) : 60)]}
                markers={m.stable ? [{ x: m.rho, y: Math.min(m.Wq * 60, 59), color: 'var(--c-coral)', r: 5, ring: true }] : []}
                refLines={[{ x: 0.85, color: 'var(--ink-mute)', dash: '4 3', label: 'zona crítica' }]}
                xLabel="Utilización ρ" yLabel="Espera (min)"
                formatX={v => fmt.pct(v * 100, 0)} />
            </ChartCard>
            <div style={{ height: 14 }} />
            <ChartCard title="Composición del sistema" sub="Cuántos clientes esperando vs siendo atendidos">
              <Chart height={150}
                series={[{ type: 'bar', data: [[0, m.stable ? m.Lq : 20], [1, m.stable ? (m.L - m.Lq) : m.c]], color: 'var(--c-blue)', name: 'Clientes' }]}
                xDomain={[-0.6, 1.6]} yDomain={[0, Math.max(m.stable ? m.L : 20, 1) * 1.2]}
                gridX={false}
                formatX={v => { if (Math.abs(v) < 0.3) return 'En cola'; if (Math.abs(v - 1) < 0.3) return 'En servicio'; return ''; }}
                xTicks={2} yTicks={3} />
            </ChartCard>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">La teoría de colas estudia las líneas de espera: cuánta gente se acumula, cuánto esperan y por qué un sistema "casi lleno" colapsa tan rápido.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Modela un sistema donde <strong>clientes llegan</strong> a una tasa λ y <strong>servidores los atienden</strong> a una tasa μ. Calcula cuánta gente hay en promedio, cuánto esperan y qué tan ocupados están los servidores. La gráfica revela el fenómeno central: cerca del 100% de utilización, la espera se dispara hacia el infinito — el <strong>cuello de botella</strong>.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'λ', name: 'Tasa de llegadas', desc: 'Clientes que llegan por unidad de tiempo (lambda).' },
        { sym: 'μ', name: 'Tasa de servicio', desc: 'Clientes que un servidor puede atender por unidad de tiempo (mu).' },
        { sym: 'c', name: 'Servidores', desc: 'Cajas, ventanillas o estaciones trabajando en paralelo.' },
        { sym: 'ρ', name: 'Utilización', desc: 'ρ = λ/(c·μ). Fracción del tiempo que los servidores están ocupados.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>No linealidad brutal:</strong> pasar de 80% a 95% de utilización multiplica la espera, no la suma.</li>
        <li><strong>Poder del paralelo:</strong> dos servidores a μ rinden mucho mejor que uno al doble de velocidad.</li>
        <li><strong>Variabilidad cuesta:</strong> la espera existe aunque ρ &lt; 1, por la aleatoriedad de llegadas.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Dimensionar personal">Cuántas cajas, agentes de call center o ventanillas abrir para cumplir un tiempo de espera objetivo.</Case>
      <Case n="2" title="Diseño de procesos y cuellos de botella">Identificar la estación que limita el throughput de una línea de producción o un hospital.</Case>
      <Case n="3" title="Acuerdos de servicio">Garantizar que el 90% de las llamadas se atienda en menos de 30 segundos.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Modelo M/M/1</h2>
      <p>Llegadas de Poisson, servicio exponencial, un servidor. La utilización debe ser menor a 1 para que el sistema sea estable:</p>
      <Formula where={<>ρ: utilización · λ: llegadas · μ: servicio</>}>
        ρ = <Frac num="λ" den="μ" /> &nbsp;(estable si ρ &lt; 1)
      </Formula>
      <p>Las métricas de Little para un servidor:</p>
      <Formula where={<>L: clientes en sistema · Lq: en cola · W: tiempo en sistema · Wq: espera</>}>
        L = <Frac num="ρ" den="1 − ρ" /> &nbsp;&nbsp; W<sub>q</sub> = <Frac num="λ" den="μ(μ − λ)" />
      </Formula>
      <h3>Ley de Little</h3>
      <p>Un resultado universal que conecta inventario, tasa y tiempo en cualquier sistema en estado estable:</p>
      <Formula where={<>Válida para colas, inventarios y procesos por igual</>}>L = λ · W</Formula>
      <h3>Modelo M/M/c (varios servidores)</h3>
      <p>Con <span className="fx">c</span> servidores, la probabilidad de esperar la da la <strong>fórmula de Erlang C</strong>, y de ahí:</p>
      <Formula where={<>P<sub>w</sub>: prob. de esperar (Erlang C) · r = λ/μ</>}>
        L<sub>q</sub> = P<sub>w</sub>·<Frac num="ρ" den="1 − ρ" /> &nbsp;&nbsp; ρ = <Frac num="λ" den="c·μ" />
      </Formula>
      <Callout blue tag="La intuición del cuello de botella">Como <span className="fx">1/(1−ρ)</span> aparece en las fórmulas, cuando ρ → 1 las esperas tienden a infinito. Por eso los sistemas reales se diseñan para operar al 70–85%, no al 100%: el último tramo de capacidad es desproporcionadamente caro en tiempo de espera.</Callout>
    </div>
  );
}
