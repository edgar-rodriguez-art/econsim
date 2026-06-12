/* ============================================================
   EconSim — Simulaciones 4–5
   4. Punto de reorden (demanda variable)   5. Revisión continua vs periódica
   ============================================================ */
const { useState, useMemo } = React;
window.SIMS = window.SIMS || {};

/* ----------------------------------------------------------------
   4) PUNTO DE REORDEN con demanda variable
---------------------------------------------------------------- */
function SimReorder({ tab }) {
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
    const series = [{ type: 'area', data: invUpto, color: 'var(--c-blue)', opacity: 0.12, width: 2 }];
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
            <Field label="Escenario de demanda (semilla)"><Segmented value={seed} onChange={setSeed} options={[{ value: 7, label: 'A' }, { value: 23, label: 'B' }, { value: 99, label: 'C' }]} /></Field>
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="Punto de reorden" value={fmt.n(m.rop, 0)} unit="u" color="var(--c-coral)" sub={`z = ${m.z.toFixed(2)}`} />
              <KPI label="Stock de seguridad" value={fmt.n(m.ss, 0)} unit="u" color="var(--c-amber)" />
              <KPI label="Días con faltante" value={m.stockoutDays} unit={`/ ${horizon}`} color="var(--c-blue)" />
              <KPI label="Tasa de cumplimiento" value={fmt.pct(m.fillRate, 1)} color="var(--accent)" />
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={horizon} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed} labelFmt={(s) => `Día ${s} · ${fmt.n(curStock, 0)} u`} />
            <ChartCard title="Inventario simulado con demanda aleatoria" sub="Cada punto ámbar = pedido colocado"
              legend={[{ name: 'Nivel de inventario', color: 'var(--c-blue)' }, { name: 'Punto de reorden', color: 'var(--c-coral)', dash: true }, { name: 'Pedidos', color: 'var(--c-amber)', dot: true }]}>
              <Chart height={330} series={series} markers={markers} xDomain={[0, horizon]} yDomain={[0, (m.rop + orderQty) * 1.15]}
                refLines={[{ y: m.rop, color: 'var(--c-coral)', label: 'ROP' }, { y: m.ss, color: 'var(--c-amber)', dash: '2 3', label: 'SS' }]}
                xLabel="Días" yLabel="Unidades en stock" formatX={v => v + 'd'} />
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
SIMS['reorder'] = { title: 'Punto de reorden con demanda variable', kicker: 'Inventarios', lede: 'Cuándo volver a pedir cuando la demanda es incierta: el stock de seguridad como precio de un nivel de servicio prometido.', Component: SimReorder };

/* ----------------------------------------------------------------
   5) REVISIÓN CONTINUA vs PERIÓDICA
---------------------------------------------------------------- */
function SimReview({ tab }) {
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
      { type: 'line', data: upto(m.cont.inv), color: 'var(--c-blue)', width: 2 },
      { type: 'line', data: upto(m.per.inv), color: 'var(--c-violet)', width: 2 },
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
                xLabel="Días" yLabel="Unidades en stock" formatX={v => v + 'd'} />
            </ChartCard>
            <Callout tag="Comparación">La <b>periódica</b> debe cubrir incertidumbre durante <b>T + L</b> días (más colchón, más inventario medio) a cambio de revisar en fechas fijas y consolidar pedidos. La <b>continua</b> solo cubre <b>L</b> días pero exige monitoreo permanente del stock.</Callout>
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
      <Formula>
        Q<sub>t</sub> = S − (inventario actual + pedidos en tránsito)
      </Formula>
      <Callout blue tag="Regla práctica">Mismo nivel de servicio → la periódica casi siempre mantiene <b>más</b> inventario de seguridad (cubre T+L &gt; L). Se elige cuando el ahorro administrativo de revisar en bloque supera ese inventario extra.</Callout>
    </div>
  );
}
SIMS['review'] = { title: 'Revisión continua vs periódica', kicker: 'Inventarios', lede: 'Vigilar el stock en todo momento o revisarlo en fechas fijas: dos políticas sobre la misma demanda, con distinto colchón y carga administrativa.', Component: SimReview };
