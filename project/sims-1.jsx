/* ============================================================
   EconSim — Simulaciones 1–3
   1. Oferta y demanda   2. Interés compuesto   3. EOQ
   ============================================================ */
const { useState, useMemo } = React;
window.SIMS = window.SIMS || {};

/* ----------------------------------------------------------------
   1) OFERTA Y DEMANDA
---------------------------------------------------------------- */
function SimSupplyDemand({ tab }) {
  const [a, setA] = useState(220), [b, setB] = useState(2.2);
  const [c, setC] = useState(20), [d, setD] = useState(2.8);
  const [demandShift, setDS] = useState(0), [supplyShift, setSS] = useState(0);
  const [tax, setTax] = useState(0);

  const m = useMemo(() => supplyDemand({ a, b, c, d, demandShift, supplyShift, tax }), [a, b, c, d, demandShift, supplyShift, tax]);

  if (tab === 'sim') {
    const series = [
      { type: 'line', data: m.demandCurve, color: 'var(--c-coral)', width: 2.4 },
      { type: 'line', data: m.supplyCurve, color: 'var(--c-blue)', width: 2.4 },
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
          <Slider label="Demanda · sensibilidad (b)" value={b} min={0.6} max={4} step={0.1} onChange={setB} fmt={v => v.toFixed(1)} hint="Pendiente: cuánto cae la cantidad si sube el precio (elasticidad)." />
          <Slider label="Oferta · intercepto (c)" value={c} min={-40} max={80} step={5} onChange={setC} hint="Posición de la curva de oferta (costos base)." />
          <Slider label="Oferta · sensibilidad (d)" value={d} min={0.6} max={4} step={0.1} onChange={setD} fmt={v => v.toFixed(1)} />
          <div className="divider" />
          <Slider label="Desplaza demanda" value={demandShift} min={-60} max={60} step={5} onChange={setDS} hint="↑ ingreso, moda, sustitutos → mueve toda la curva." />
          <Slider label="Desplaza oferta" value={supplyShift} min={-60} max={60} step={5} onChange={setSS} hint="↑ = más oferta (mejor tecnología, menores costos)." />
          <Slider label="Impuesto por unidad" value={tax} min={0} max={40} step={2} onChange={setTax} unit=" $" hint="Crea una cuña entre lo que paga el consumidor y recibe el productor." />
        </Panel>
        <div>
          <div className="kpis">
            <KPI label="Precio de equilibrio" value={fmt.money(m.Pe, 1)} color="var(--accent)" />
            <KPI label="Cantidad de equilibrio" value={fmt.n(m.Qe, 0)} unit="u" color="var(--accent)" />
            <KPI label="Excedente consumidor" value={fmt.money(m.hasTax ? m.csT : m.cs, 0)} color="var(--c-coral)" />
            <KPI label={m.hasTax ? "Recaudación fiscal" : "Excedente productor"} value={fmt.money(m.hasTax ? m.govRev : m.ps, 0)} color="var(--c-blue)" />
          </div>
          <ChartCard title="Mercado: oferta y demanda" sub="Precio (Y) vs cantidad (X)"
            legend={[{ name: 'Demanda', color: 'var(--c-coral)' }, { name: 'Oferta', color: 'var(--c-blue)' }, { name: 'Equilibrio', color: 'var(--accent)', dot: true }]}>
            <Chart height={400} series={series} markers={markers} refLines={refLines}
              xDomain={[0, m.qAxisMax]} yDomain={[0, m.pAxisMax]}
              xLabel="Cantidad (unidades)" yLabel="Precio ($)"
              formatX={v => fmt.compact(v)} formatY={v => '$' + fmt.compact(v)} />
          </ChartCard>
          {m.hasTax && <Callout tag="Efecto del impuesto" >Con un impuesto de <b>${tax}/u</b>, la cantidad cae a <b>{fmt.n(m.Qt, 0)}</b> unidades y se genera una <b>pérdida irrecuperable de {fmt.money(m.dwl, 0)}</b> — bienestar que desaparece porque hay transacciones beneficiosas que ya no ocurren.</Callout>}
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">La oferta y la demanda describen cómo se forma el <strong>precio</strong> y la <strong>cantidad</strong> de un bien cuando compradores y vendedores interactúan en un mercado.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Dibuja la <strong>curva de demanda</strong> (cuánto quieren comprar los consumidores a cada precio — baja) y la <strong>curva de oferta</strong> (cuánto quieren vender los productores — sube). El punto donde se cruzan es el <strong>equilibrio</strong>: el único precio donde la cantidad ofrecida iguala a la demandada y el mercado "se vacía". Puedes desplazar cada curva y aplicar un impuesto para ver cómo se mueve ese punto.</p>
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
SIMS['supply-demand'] = { title: 'Oferta y demanda', kicker: 'Microeconomía', lede: 'El mecanismo de precios: cómo el cruce de compradores y vendedores fija precio y cantidad, y qué pasa cuando algo los desplaza.', Component: SimSupplyDemand };

/* ----------------------------------------------------------------
   2) INTERÉS COMPUESTO
---------------------------------------------------------------- */
function SimCompound({ tab }) {
  const [principal, setP] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(30);
  const [freq, setFreq] = useState(12);
  const [contrib, setContrib] = useState(150);
  const [inflation, setInfl] = useState(4);
  const [showSimple, setSimple] = useState(true);
  const [showReal, setReal] = useState(false);

  const m = useMemo(() => compound({ principal, rate, years, freq, contrib, inflation }), [principal, rate, years, freq, contrib, inflation]);
  const pb = usePlayback(years, { fps: 8 });
  const upto = (arr) => arr.filter(([y]) => y <= pb.step);

  if (tab === 'sim') {
    const series = [{ type: 'area', data: upto(m.series), color: 'var(--c-blue)', fill: 'var(--c-blue)', opacity: 0.12, width: 2.6 }];
    if (showSimple) series.push({ type: 'line', data: upto(m.simpleSeries), color: 'var(--c-amber)', dash: '5 4', width: 2 });
    if (showReal) series.push({ type: 'line', data: upto(m.realSeries), color: 'var(--c-violet)', dash: '2 3', width: 2 });
    series.push({ type: 'line', data: upto(m.contribSeries), color: 'var(--c-slate)', width: 1.4, opacity: 0.7 });
    const cur = m.series.find(([y]) => y === pb.step) || m.series[m.series.length - 1];
    const legend = [{ name: 'Interés compuesto', color: 'var(--c-blue)' }, { name: 'Lo aportado', color: 'var(--c-slate)' }];
    if (showSimple) legend.push({ name: 'Interés simple', color: 'var(--c-amber)', dash: true });
    if (showReal) legend.push({ name: 'Valor real (ajust. inflación)', color: 'var(--c-violet)', dash: true });
    return (
      <div className="fade-in">
        <div className="sim-grid">
          <Panel title="Parámetros">
            <Slider label="Capital inicial" value={principal} min={0} max={100000} step={1000} onChange={setP} fmt={v => fmt.money(v)} />
            <Slider label="Tasa anual" value={rate} min={0} max={20} step={0.5} onChange={setRate} fmt={v => v.toFixed(1)} unit=" %" hint="Rendimiento nominal antes de inflación." />
            <Slider label="Aporte por periodo" value={contrib} min={0} max={2000} step={50} onChange={setContrib} fmt={v => fmt.money(v)} hint="Lo que añades cada periodo de capitalización." />
            <Slider label="Horizonte" value={years} min={1} max={45} step={1} onChange={setYears} unit=" años" />
            <Slider label="Inflación anual" value={inflation} min={0} max={12} step={0.5} onChange={setInfl} fmt={v => v.toFixed(1)} unit=" %" />
            <Field label="Frecuencia de capitalización">
              <Segmented value={freq} onChange={setFreq} options={[{ value: 1, label: 'Anual' }, { value: 4, label: 'Trim.' }, { value: 12, label: 'Mensual' }]} />
            </Field>
            <div className="divider" />
            <SwitchRow label="Comparar con interés simple" checked={showSimple} onChange={setSimple} />
            <SwitchRow label="Mostrar valor real (inflación)" checked={showReal} onChange={setReal} />
          </Panel>
          <div>
            <div className="kpis">
              <KPI label="Valor futuro" value={fmt.money(m.fv)} color="var(--c-blue)" />
              <KPI label="Total aportado" value={fmt.money(m.contribTotal)} color="var(--c-slate)" />
              <KPI label="Interés ganado" value={fmt.money(m.interestEarned)} color="var(--accent)" sub={`${fmt.pct(100 * m.interestEarned / m.contribTotal, 0)} sobre lo aportado`} />
              <KPI label="Valor real (hoy)" value={fmt.money(m.realFv)} color="var(--c-violet)" />
            </div>
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={years} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed} labelFmt={(s) => `Año ${s} · ${fmt.money(cur ? cur[1] : 0)}`} />
            <ChartCard title="Crecimiento del capital" sub={`Capitalización ${freq === 1 ? 'anual' : freq === 4 ? 'trimestral' : 'mensual'}`} legend={legend}>
              <Chart height={380} series={series} xDomain={[0, years]} yLabel="Saldo ($)" xLabel="Años" formatY={v => '$' + fmt.compact(v)} formatX={v => v + 'a'} />
            </ChartCard>
            <Callout tag="La magia del interés compuesto">De los <b>{fmt.money(m.fv)}</b> finales, solo <b>{fmt.money(m.contribTotal)}</b> salieron de tu bolsillo. Los otros <b>{fmt.money(m.interestEarned)}</b> son interés generando más interés — el efecto se acelera con el tiempo, no de forma lineal.</Callout>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'explain') return (
    <div className="prose fade-in">
      <p className="lead">El interés compuesto es interés que gana interés. Es la fuerza detrás del crecimiento de inversiones a largo plazo — y, en sentido inverso, del costo real de las deudas.</p>
      <h2><span className="h-no">A</span>¿Qué hace esta simulación?</h2>
      <p>Proyecta cómo crece un capital cuando los rendimientos se reinvierten periodo a periodo y se añaden aportes constantes. Lo contrasta con el <strong>interés simple</strong> (sin reinversión) y muestra el <strong>valor real</strong> una vez descontada la inflación, para distinguir el crecimiento nominal del poder adquisitivo verdadero.</p>
      <h2><span className="h-no">B</span>Significado de los parámetros</h2>
      <ParamList items={[
        { sym: 'P', name: 'Capital inicial', desc: 'El monto con el que empiezas (principal).' },
        { sym: 'r', name: 'Tasa anual', desc: 'Rendimiento nominal anual antes de inflación.' },
        { sym: 'n', name: 'Frecuencia', desc: 'Cuántas veces al año se capitaliza. A mayor frecuencia, ligeramente más interés.' },
        { sym: 'PMT', name: 'Aporte periódico', desc: 'Lo que sumas cada periodo. Su constancia importa más que su tamaño.' },
        { sym: 't', name: 'Horizonte', desc: 'Años de inversión. La variable más poderosa del modelo.' },
        { sym: 'π', name: 'Inflación', desc: 'Erosiona el valor real del dinero futuro.' },
      ]} />
      <h2><span className="h-no">C</span>Efectos que observarás</h2>
      <ul>
        <li><strong>Curva exponencial:</strong> la brecha contra el interés simple se dispara en los últimos años.</li>
        <li><strong>El tiempo gana al monto:</strong> empezar 10 años antes suele superar a aportar el doble.</li>
        <li><strong>Inflación silenciosa:</strong> una cifra nominal grande puede valer mucho menos en poder de compra.</li>
      </ul>
      <h2><span className="h-no">D</span>Utilidad en los negocios</h2>
      <Case n="1" title="Decisiones de inversión y VPN">Comparar proyectos descontando flujos futuros a valor presente usa exactamente esta matemática.</Case>
      <Case n="2" title="Financiamiento y deuda">El mismo motor que hace crecer ahorros hace crecer intereses de tarjetas y créditos — entender la TAE evita sorpresas.</Case>
      <Case n="3" title="Planes de retiro y fondos">Diseñar aportaciones a fondos de pensiones o reservas corporativas a 20–40 años.</Case>
    </div>
  );

  return (
    <div className="prose fade-in">
      <h2><span className="h-no">∑</span>Fórmula del valor futuro</h2>
      <p>Con capitalización <span className="fx">n</span> veces al año durante <span className="fx">t</span> años, el periodo tiene tasa <span className="fx">i = r/n</span> y hay <span className="fx">N = n·t</span> periodos:</p>
      <Formula where={<>VF: valor futuro · P: capital · i = r/n · N = n·t</>}>
        VF = P·(1 + i)<sup>N</sup>
      </Formula>
      <h3>Con aportes periódicos</h3>
      <p>Si además añades una cantidad fija <span className="fx">PMT</span> cada periodo (anualidad ordinaria):</p>
      <Formula>
        VF = P·(1+i)<sup>N</sup> + PMT·<Frac num="(1+i)ᴺ − 1" den="i" />
      </Formula>
      <h3>Interés simple (para comparar)</h3>
      <Formula>
        VF<sub>simple</sub> = P·(1 + r·t)
      </Formula>
      <h3>Valor real (ajustado por inflación)</h3>
      <Formula where={<>π: tasa de inflación anual</>}>
        VF<sub>real</sub> = <Frac num="VF" den="(1 + π)ᵗ" />
      </Formula>
      <Callout blue tag="Regla del 72">Una aproximación útil: tu dinero se duplica aproximadamente cada <b>72 / r</b> años. Al 8% anual, se duplica cada ~9 años.</Callout>
    </div>
  );
}
SIMS['compound'] = { title: 'Interés compuesto', kicker: 'Finanzas', lede: 'Interés que gana interés: cómo el tiempo, la tasa y la constancia de los aportes convierten ahorros modestos en capital — y por qué la inflación importa.', Component: SimCompound };

/* ----------------------------------------------------------------
   3) EOQ — Cantidad económica de pedido
---------------------------------------------------------------- */
function SimEOQ({ tab }) {
  const [demand, setD] = useState(12000);
  const [orderCost, setOC] = useState(400);
  const [holdCost, setHC] = useState(8);
  const [unitCost, setUC] = useState(25);
  const [leadDays, setLD] = useState(7);

  const m = useMemo(() => eoq({ demand, orderCost, holdCost, unitCost, leadDays }), [demand, orderCost, holdCost, unitCost, leadDays]);

  if (tab === 'sim') {
    const series = [
      { type: 'line', data: m.curve.order, color: 'var(--c-amber)', width: 2 },
      { type: 'line', data: m.curve.hold, color: 'var(--c-teal)', width: 2 },
      { type: 'line', data: m.curve.total, color: 'var(--c-blue)', width: 2.6 },
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
                xLabel="Tamaño del lote Q (unidades)" yLabel="Costo anual ($)" formatY={v => '$' + fmt.compact(v)} formatX={v => fmt.compact(v)} />
            </ChartCard>
            <div style={{ height: 14 }} />
            <ChartCard title="Nivel de inventario en el tiempo" sub="Patrón de diente de sierra">
              <Chart height={170} series={[{ type: 'area', data: m.saw, color: 'var(--c-teal)', opacity: 0.16, width: 2 }]}
                xDomain={[0, m.cycleDays * 3]} yDomain={[0, m.Q * 1.1]}
                refLines={[{ y: m.rop, color: 'var(--c-coral)', label: 'Reorden' }, { y: m.Q / 2, color: 'var(--ink-mute)', dash: '2 3', label: 'Inv. medio' }]}
                xLabel="Días" yLabel="Unidades" formatX={v => fmt.compact(v) + 'd'} yTicks={4} />
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
      <Formula>
        CT* = <Sqrt>2·D·S·H</Sqrt>
      </Formula>
      <Callout blue tag="Supuestos del modelo">Demanda constante y conocida, sin faltantes, reposición instantánea del lote completo y costos estables. Cuando la demanda es variable, se complementa con stock de seguridad (ver Punto de reorden).</Callout>
    </div>
  );
}
SIMS['eoq'] = { title: 'Cantidad económica de pedido', kicker: 'Inventarios', lede: 'El lote óptimo: cuántas unidades pedir cada vez para minimizar la suma del costo de ordenar y el de mantener inventario.', Component: SimEOQ };
