import React, { useState, useEffect } from 'react';
import SupplyDemand from './sims/SupplyDemand';
import Compound from './sims/Compound';
import Eoq from './sims/Eoq';
import Reorder from './sims/Reorder';
import Review from './sims/Review';
import Bullwhip from './sims/Bullwhip';
import Beer from './sims/Beer';
import Queue from './sims/Queue';

const SIMS = {
  'supply-demand': { title: 'Oferta y demanda', kicker: 'Microeconomía', lede: 'El mecanismo de precios: cómo el cruce de compradores y vendedores fija precio y cantidad, y qué pasa cuando algo los desplaza.', Component: SupplyDemand },
  'compound': { title: 'Interés compuesto', kicker: 'Finanzas', lede: 'Interés que gana interés: cómo el tiempo, la tasa y la constancia de los aportes convierten ahorros modestos en capital — y por qué la inflación importa.', Component: Compound },
  'eoq': { title: 'Cantidad económica de pedido', kicker: 'Inventarios', lede: 'El lote óptimo: cuántas unidades pedir cada vez para minimizar la suma del costo de ordenar y el de mantener inventario.', Component: Eoq },
  'reorder': { title: 'Punto de reorden con demanda variable', kicker: 'Inventarios', lede: 'Cuándo volver a pedir cuando la demanda es incierta: el stock de seguridad como precio de un nivel de servicio prometido.', Component: Reorder },
  'review': { title: 'Revisión continua vs periódica', kicker: 'Inventarios', lede: 'Vigilar el stock en todo momento o revisarlo en fechas fijas: dos políticas sobre la misma demanda, con distinto colchón y carga administrativa.', Component: Review },
  'bullwhip': { title: 'Efecto látigo (bullwhip)', kicker: 'Cadena de suministro', lede: 'Cómo una pequeña variación de demanda del cliente se amplifica eslabón por eslabón hasta sacudir a la fábrica — y cómo la información lo apaga.', Component: Bullwhip },
  'beer': { title: 'Beer Game (simplificado)', kicker: 'Cadena de suministro', lede: 'La simulación clásica de operaciones: cuatro eslabones, decisiones locales y retrasos que producen oscilaciones globales de inventario y costo.', Component: Beer },
  'queue': { title: 'Teoría de colas y cuellos de botella', kicker: 'Procesos y servicio', lede: 'Líneas de espera explicadas: por qué un sistema al 95% de uso colapsa, y cuántos servidores se necesitan para cumplir un objetivo de espera.', Component: Queue },
};

const SIM_ORDER = ['supply-demand', 'compound', 'eoq', 'reorder', 'review', 'bullwhip', 'beer', 'queue'];

const GLYPHS = {
  'supply-demand': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13L13 3M2 3l11 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  'compound': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13c3 0 4-9 11-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M10 4h3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'eoq': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12c2-7 8-7 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="8" cy="9.3" r="1.6" fill="currentColor" /></svg>,
  'reorder': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4l2.5 6 2.5-6 2.5 6L11.5 4M14 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'review': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2.5" width="5" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="2.5" width="5" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" /></svg>,
  'bullwhip': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8c1.5 0 1.5-3 3-3s1.5 4 3 4 1.5-6 3-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  'beer': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="7" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><path d="M10 7h2.5a1.5 1.5 0 0 1 0 3H10" stroke="currentColor" strokeWidth="1.4" /><path d="M4 5c0-2 5-2 5 0" stroke="currentColor" strokeWidth="1.4" /></svg>,
  'queue': <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3.5" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" /><circle cx="12.5" cy="8" r="1.6" fill="currentColor" /></svg>,
};

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5 6 6 0 1 0 13.5 9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
const BrandMark = () => (
  <div className="mark">
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <rect width="38" height="38" rx="10" fill="#0F52BA" />
      <rect x="9" y="22" width="3.4" height="8" rx="1" fill="#fff" opacity="0.55" />
      <rect x="14.5" y="18" width="3.4" height="12" rx="1" fill="#fff" opacity="0.7" />
      <rect x="20" y="14" width="3.4" height="16" rx="1" fill="#fff" opacity="0.55" />
      <rect x="25.5" y="9" width="3.4" height="21" rx="1" fill="#00C896" />
      <path d="M9 24l7-4 5-3.5 6-7" stroke="#00C896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </div>
);

const TABS = [
  { id: 'sim', label: 'Simulador', n: '01' },
  { id: 'explain', label: 'Explicación', n: '02' },
  { id: 'theory', label: 'Teoría', n: '03' },
];

export default function App() {
  const [active, setActive] = useState(() => localStorage.getItem('econsim.active') || 'supply-demand');
  const [tab, setTab] = useState('sim');
  const [theme, setTheme] = useState(() => localStorage.getItem('econsim.theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('econsim.theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('econsim.active', active);
  }, [active]);

  const sim = SIMS[active];
  const Comp = sim.Component;
  const idx = SIM_ORDER.indexOf(active) + 1;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div className="word"><b>EconSim</b><span>Simulador Económico</span></div>
        </div>
        <div className="nav-label">Simulaciones</div>
        <nav className="nav">
          {SIM_ORDER.map((id, i) => (
            <button key={id} className={'nav-item' + (active === id ? ' active' : '')}
              onClick={() => { setActive(id); setTab('sim'); }}>
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="glyph">{GLYPHS[id]}</span>
              <span style={{ lineHeight: 1.2 }}>{SIMS[id].title}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            <span className={'seg' + (theme === 'light' ? ' on' : '')}><SunIcon /> Claro</span>
            <span className={'seg' + (theme === 'dark' ? ' on' : '')}><MoonIcon /> Oscuro</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          <header className="sim-head">
            <div className="kicker">{sim.kicker} · {String(idx).padStart(2, '0')} / 08</div>
            <h1>{sim.title}</h1>
            <p className="lede">{sim.lede}</p>
          </header>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                <span className="tnum">{t.n}</span>{t.label}
              </button>
            ))}
          </div>

          <Comp tab={tab} key={active} />
        </div>
      </main>
    </div>
  );
}
