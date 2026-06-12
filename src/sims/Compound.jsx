import React, { useState, useMemo } from 'react';
import { compound } from '../lib/models';
import { fmt } from '../lib/format';
import Slider from '../components/Slider';
import Segmented from '../components/Segmented';
import SwitchRow from '../components/SwitchRow';
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

export default function SimCompound({ tab }) {
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
    const series = [{ type: 'area', data: upto(m.series), color: 'var(--c-blue)', fill: 'var(--c-blue)', opacity: 0.12, width: 2.6, name: 'Interés compuesto' }];
    if (showSimple) series.push({ type: 'line', data: upto(m.simpleSeries), color: 'var(--c-amber)', dash: '5 4', width: 2, name: 'Interés simple' });
    if (showReal) series.push({ type: 'line', data: upto(m.realSeries), color: 'var(--c-violet)', dash: '2 3', width: 2, name: 'Valor real' });
    series.push({ type: 'line', data: upto(m.contribSeries), color: 'var(--c-slate)', width: 1.4, opacity: 0.7, name: 'Aportado' });

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
            <PlayBar playing={pb.playing} onToggle={pb.toggle} onReset={pb.reset} step={pb.step} total={years} onSeek={pb.setStep} speed={pb.speed} onSpeed={pb.setSpeed}
              labelFmt={(s) => `Año ${s} · ${fmt.money(cur ? cur[1] : 0)}`} />
            <ChartCard title="Crecimiento del capital" sub={`Capitalización ${freq === 1 ? 'anual' : freq === 4 ? 'trimestral' : 'mensual'}`} legend={legend}>
              <Chart height={380} series={series} xDomain={[0, years]} yLabel="Saldo ($)" xLabel="Años"
                formatY={v => '$' + fmt.compact(v)} formatX={v => v + 'a'} />
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
      <Case n="2" title="Financiamiento y deuda">El mismo motor que hace crecer ahorros hace crecer intereses de tarjetas — entender la TAE evita sorpresas.</Case>
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
      <Formula>VF<sub>simple</sub> = P·(1 + r·t)</Formula>
      <h3>Valor real (ajustado por inflación)</h3>
      <Formula where={<>π: tasa de inflación anual</>}>
        VF<sub>real</sub> = <Frac num="VF" den="(1 + π)ᵗ" />
      </Formula>
      <Callout blue tag="Regla del 72">Una aproximación útil: tu dinero se duplica aproximadamente cada <b>72 / r</b> años. Al 8% anual, se duplica cada ~9 años.</Callout>
    </div>
  );
}
