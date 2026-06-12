/* ============================================================
   EconSim — Simulaciones 6–8
   6. Efecto látigo   7. Beer Game   8. Teoría de colas
   ============================================================ */
const { useState, useMemo } = React;
window.SIMS = window.SIMS || {};
const STAGE_COLORS = ['var(--c-teal)', 'var(--c-blue)', 'var(--c-violet)', 'var(--c-coral)'];

/* ----------------------------------------------------------------
   6) EFECTO LÁTIGO (bullwhip)
---------------------------------------------------------------- */
function SimBullwhip({ tab }) {
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
    const series = [{ type: 'line', data: upto(m.series.customer), color: 'var(--ink)', width: 2.6 }];
    m.series.stages.forEach((s, i) => series.push({ type: 'line', data: upto(s), color: STAGE_COLORS[i], width: 1.8, opacity: 0.92 }));
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
              <Chart height={170} series={[{ type: 'bar', data: ampBars, color: 'var(--c-blue)' }]}
                xDomain={[-0.6, 3.6]} yDomain={[0, Math.max(...m.amplification, 2) * 1.15]} gridX={false}
                refLines={[{ y: 1, color: 'var(--ink-mute)', dash: '4 3', label: '1× (sin látigo)' }]}
                formatX={v => m.stages[v] ? m.stages[v].slice(0, 4) : ''} xTicks={4} yTicks={4} formatY={v => v.toFixed(1) + '×'} />
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
SIMS['bullwhip'] = { title: 'Efecto látigo (bullwhip)', kicker: 'Cadena de suministro', lede: 'Cómo una pequeña variación de demanda del cliente se amplifica eslabón por eslabón hasta sacudir a la fábrica — y cómo la información lo apaga.', Component: SimBullwhip };

/* ----------------------------------------------------------------
   7) BEER GAME simplificado
---------------------------------------------------------------- */
function SimBeer({ tab }) {
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
    const series = m.hist[key].map((s, i) => ({ type: 'line', data: upto(s), color: STAGE_COLORS[i], width: 2 }));
    if (view === 'order') series.unshift({ type: 'line', data: upto(m.customerSeries), color: 'var(--ink)', width: 2.4, dash: '4 3' });
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
              <Chart height={320} series={series} xDomain={[0, weeks - 1]} xLabel="Semanas" yLabel={view === 'cost' ? 'Costo ($)' : 'Unidades'} formatX={v => 's' + v} formatY={v => view === 'cost' ? '$' + fmt.compact(v) : fmt.compact(v)} />
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
      <Formula>
        IP = Inventario − Backlog + Pedidos en tránsito
      </Formula>
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
SIMS['beer'] = { title: 'Beer Game (simplificado)', kicker: 'Cadena de suministro', lede: 'La simulación clásica de operaciones: cuatro eslabones, decisiones locales y retrasos que producen oscilaciones globales de inventario y costo.', Component: SimBeer };

/* ----------------------------------------------------------------
   8) TEORÍA DE COLAS
---------------------------------------------------------------- */
function SimQueue({ tab }) {
  const [lambda, setLambda] = useState(8);
  const [mu, setMu] = useState(10);
  const [servers, setServers] = useState(1);

  const m = useMemo(() => queue({ lambda, mu, servers }), [lambda, mu, servers]);

  if (tab === 'sim') {
    const wqCurve = m.curve.Wq.filter(([, y]) => y < 999);
    const lCurve = m.curve.L;
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Tasa de llegadas (λ)" value={lambda} min={1} max={20} step={0.5} onChange={setLambda} fmt={v => v.toFixed(1)} unit="/h" hint="Clientes que llegan por hora." />
            <Slider label="Tasa de servicio (μ)" value={mu} min={2} max={22} step={0.5} onChange={setMu} fmt={v => v.toFixed(1)} unit="/h" hint="Clientes que atiende UN servidor por hora." />
            <Slider label="Número de servidores (c)" value={servers} min={1} max={6} step={1} onChange={setServers} hint="Cajas, ventanillas o máquinas en paralelo." />
            <div className="divider" />
            <div className="note">
              <span className="tag" style={{ background: m.stable ? 'var(--accent-wk)' : '#fde8e6', color: m.stable ? 'var(--accent)' : 'var(--c-coral)' }}>{m.stable ? 'Sistema estable' : 'Sistema saturado'}</span>
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
              <Chart height={300} series={[{ type: 'area', data: wqCurve.map(([x, y]) => [x, y * 60]), color: 'var(--c-amber)', opacity: 0.14, width: 2.4 }]}
                xDomain={[0, 1]} yDomain={[0, Math.min(60, (m.stable ? Math.max(m.Wq * 60 * 1.4, 10) : 60))]}
                markers={m.stable ? [{ x: m.rho, y: Math.min(m.Wq * 60, 59), color: 'var(--c-coral)', r: 5, ring: true }] : []}
                refLines={[{ x: 0.85, color: 'var(--ink-mute)', dash: '4 3', label: 'zona crítica' }]}
                xLabel="Utilización ρ" yLabel="Espera (min)" formatX={v => fmt.pct(v * 100, 0)} />
            </ChartCard>
            <div style={{ height: 14 }} />
            <ChartCard title="Composición del sistema" sub="Cuántos clientes esperando vs siendo atendidos">
              <Chart height={150} series={[{ type: 'bar', data: [[0, m.stable ? m.Lq : 20], [1, m.stable ? (m.L - m.Lq) : m.c]], color: 'var(--c-blue)' }]}
                xDomain={[-0.6, 1.6]} yDomain={[0, Math.max(m.stable ? m.L : 20, 1) * 1.2]} gridX={false}
                formatX={v => v === 0 ? 'En cola (Lq)' : 'En servicio'} xTicks={2} yTicks={3} />
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
      <Formula where={<>Válida para colas, inventarios y procesos por igual</>}>
        L = λ · W
      </Formula>
      <h3>Modelo M/M/c (varios servidores)</h3>
      <p>Con <span className="fx">c</span> servidores, la probabilidad de esperar la da la <strong>fórmula de Erlang C</strong>, y de ahí:</p>
      <Formula where={<>P<sub>w</sub>: prob. de esperar (Erlang C) · r = λ/μ</>}>
        L<sub>q</sub> = P<sub>w</sub>·<Frac num="ρ" den="1 − ρ" /> &nbsp;&nbsp; ρ = <Frac num="λ" den="c·μ" />
      </Formula>
      <Callout blue tag="La intuición del cuello de botella">Como <span className="fx">1/(1−ρ)</span> aparece en las fórmulas, cuando ρ → 1 las esperas tienden a infinito. Por eso los sistemas reales se diseñan para operar al 70–85%, no al 100%: el último tramo de capacidad es desproporcionadamente caro en tiempo de espera.</Callout>
    </div>
  );
}
SIMS['queue'] = { title: 'Teoría de colas y cuellos de botella', kicker: 'Procesos y servicio', lede: 'Líneas de espera explicadas: por qué un sistema al 95% de uso colapsa, y cuántos servidores se necesitan para cumplir un objetivo de espera.', Component: SimQueue };
