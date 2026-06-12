# README — Handoff a Claude Code Web · EconSim

> **Qué es esto:** documento de implementación para convertir el prototipo de diseño (HTML + React vía CDN) en una app de producción **React + Vite + Recharts**, desplegable gratis en **Vercel** o **GitHub Pages**.
>
> **Regla de oro:** este README es la fuente de verdad. Si el diseño en `index.html` cambia, **actualiza también este archivo** (sección + changelog al final).

---

## 1. Objetivo del producto

EconSim es un **simulador económico y de operaciones** educativo, gratuito y accesible en la web. Reúne 8 simulaciones interactivas; cada una tiene **3 pestañas**: **Simulador** (parámetros en vivo + gráficas), **Explicación** (qué hace, parámetros, efectos, utilidad en negocios) y **Teoría** (fórmulas y derivaciones).

Audiencia: mezcla de estudiantes universitarios y profesionales. Tono: **editorial / data-journalism**, sobrio y tipográfico.

### Las 8 simulaciones (orden en la navegación)

| # | id | Título | Categoría |
|---|------|--------|-----------|
| 1 | `supply-demand` | Oferta y demanda | Microeconomía |
| 2 | `compound` | Interés compuesto | Finanzas |
| 3 | `eoq` | Cantidad económica de pedido (EOQ) | Inventarios |
| 4 | `reorder` | Punto de reorden con demanda variable | Inventarios |
| 5 | `review` | Revisión continua vs periódica | Inventarios |
| 6 | `bullwhip` | Efecto látigo (bullwhip) | Cadena de suministro |
| 7 | `beer` | Beer Game (simplificado) | Cadena de suministro |
| 8 | `queue` | Teoría de colas y cuellos de botella | Procesos y servicio |

---

## 2. Stack y arranque

```bash
npm create vite@latest econsim -- --template react
cd econsim
npm i recharts          # gráficas (alternativa: react-plotly.js + plotly.js)
npm i                   # resto de dependencias
npm run dev
```

- **React 18 + Vite.** Sin TypeScript salvo que se prefiera (el prototipo es JS).
- **Recharts** para todas las gráficas. Si se necesitan curvas paramétricas muy densas o 3D, usar Plotly puntualmente.
- **Sin backend.** Todo el cálculo corre en el cliente; los modelos son funciones puras y deterministas.
- Persistencia ligera en `localStorage` (simulación activa y tema), igual que el prototipo (claves `econsim.active`, `econsim.theme`).

### Estructura de carpetas sugerida

```
src/
  main.jsx
  App.jsx                 # shell: sidebar nav + tabs + theme
  theme.css               # = styles.css del prototipo (copiar tal cual)
  lib/
    models.js             # PORTAR models.jsx (funciones puras, ya en JS) — núcleo
    format.js             # helpers fmt.* (de charts.jsx)
  components/
    Slider.jsx Segmented.jsx SwitchRow.jsx Panel.jsx KPI.jsx
    PlayBar.jsx usePlayback.js Formula.jsx ParamList.jsx Callout.jsx Case.jsx
    charts/Chart.jsx       # wrapper sobre Recharts (ver §5)
  sims/
    SupplyDemand.jsx Compound.jsx Eoq.jsx Reorder.jsx
    Review.jsx Bullwhip.jsx Beer.jsx Queue.jsx
  content/                # opcional: texto de Explicación/Teoría por sim
```

---

## 3. Mapeo prototipo → producción

El prototipo ya contiene **toda la lógica y el contenido**. Portar es casi 1:1:

| Archivo prototipo | Destino producción | Notas |
|---|---|---|
| `styles.css` | `src/theme.css` | Copiar tal cual. Tokens en `:root` y `[data-theme="dark"]`. |
| `models.jsx` | `src/lib/models.js` | **Ya es JS puro.** Quitar la línea `Object.assign(window, …)` y usar `export`. No reescribir la matemática. |
| `charts.jsx` (`fmt`, `niceTicks`) | `src/lib/format.js` | El componente `Chart` SVG se reemplaza por Recharts (§5). |
| `components.jsx` | `src/components/*` | Un componente por export. Sustituir `window.*` por imports. |
| `sims-1/2/3.jsx` | `src/sims/*` | Cada `SimXxx` → su archivo. La estructura `{ tab }` con `if (tab==='sim'|'explain'|'theory')` se conserva o se separa en sub-componentes. |
| `app.jsx` | `src/App.jsx` | Nav, tabs y theme toggle. `SIMS` pasa a un registry importado. |

> ⚠️ Cada `<script type="text/babel">` del prototipo tiene scope propio y exporta a `window`. En Vite eso se reemplaza por **imports/exports ES estándar**.

---

## 4. Sistema de diseño

### Tipografía
- **Libre Franklin** (Google Fonts, pesos 300–800) para UI y prosa.
- **IBM Plex Mono** (400–600) para números, ejes, valores de parámetros y símbolos.
- Mínimos: cuerpo 15–16px; KPIs ~22px; títulos de sim 34px.

### Color (tokens CSS — ver `theme.css`)
Marca: zafiro `#0F52BA` (primario), azul `#1A73E8`, teal `#00C896` (acento). Fondo neutro frío.
Paleta categórica para series: `--c-blue #1A73E8`, `--c-teal #00A37D`, `--c-amber #D9892B`, `--c-coral #E0584E`, `--c-violet #7C5CDB`, `--c-slate #5A6B82`.
**Light y dark** se controlan con `document.documentElement.dataset.theme`. Todas las gráficas deben leer colores vía `var(--c-*)` para heredar el tema.

### Layout
- Sidebar fijo 270px (marca + nav de 8 sims + toggle de tema).
- Main centrado, máx. 1180px. Cabecera (kicker + título + lede) + tabs + cuerpo.
- Simulador = grid `312px 1fr`: panel de parámetros a la izquierda, KPIs + gráficas a la derecha. Colapsa a 1 columna < 980px.

---

## 5. Componente de gráfica con Recharts

El prototipo usa un `<Chart>` SVG propio. En producción, crear `components/charts/Chart.jsx` con la misma **API de props** apoyado en Recharts, para no tocar las sims:

```jsx
// Props que ya usan las sims: series[], xDomain, yDomain, xLabel, yLabel,
// formatX, formatY, refLines[], regions[], markers[]
// series item: { type:'line'|'area'|'bar'|'scatter', data:[[x,y]...], color, dash, width, fill, opacity, dotR }
```

Equivalencias Recharts:
- `type:'line'` → `<Line dot={false} stroke={color} strokeDasharray={dash} strokeWidth={width}/>`
- `type:'area'` → `<Area fill={color} fillOpacity={opacity}/>` + línea encima.
- `type:'bar'`  → `<Bar fill={color}/>`.
- `type:'scatter'` → `<Scatter/>`.
- `refLines` → `<ReferenceLine x|y={} stroke={} strokeDasharray label={}/>`.
- `regions` → `<ReferenceArea x1 x2 y1 y2 fill opacity/>`.
- `markers` → `<ReferenceDot x y r fill/>`.
- Ejes con `<XAxis type="number" domain={xDomain} tickFormatter={formatX}/>` (idem Y).
- Convertir cada `series.data` de `[[x,y]]` a `[{x, y0, y1, …}]` o usar `dataKey` con un dataset unificado por eje X. Mantén `tickFormatter` usando `fmt.*`.
- Envolver en `<ResponsiveContainer width="100%" height={height}>`.

Tooltip: usar `<Tooltip/>` de Recharts con formato `fmt.*`. Crosshair vertical viene incluido.

---

## 6. Especificación por simulación

Para cada una se listan: **parámetros (rango · default)**, **fórmulas** (la función de `models.js` ya las implementa), **KPIs**, **gráficas** e **interactividad**. El texto de *Explicación* y *Teoría* ya está redactado en los `SimXxx` del prototipo — reusarlo.

### 6.1 Oferta y demanda — `supplyDemand(p)`
- **Params:** `a` intercepto demanda (120–320 · 220) · `b` sensib. demanda (0.6–4 · 2.2) · `c` intercepto oferta (−40–80 · 20) · `d` sensib. oferta (0.6–4 · 2.8) · `demandShift` (−60–60 · 0) · `supplyShift` (−60–60 · 0) · `tax` $/u (0–40 · 0).
- **Modelo:** Demanda `Qd = a − bP`, Oferta `Qs = c + dP`. Equilibrio `P* = (a−c)/(b+d)`, `Q* = a − bP*`. Con impuesto: `Pc = (a−c+d·t)/(b+d)`, `Pp = Pc − t`. Excedentes (triángulos) y pérdida irrecuperable `DWL = ½·t·(Q*−Qt)`.
- **KPIs:** P*, Q*, excedente consumidor, excedente productor (o recaudación si hay impuesto).
- **Gráfica:** curvas D y O con **Q en X, P en Y**; marcador en equilibrio; con impuesto, líneas de referencia Pc/Pp.

### 6.2 Interés compuesto — `compound(p)`
- **Params:** `principal` (0–100k · 10 000) · `rate` % anual (0–20 · 8) · `contrib` por periodo (0–2000 · 150) · `years` (1–45 · 30) · `inflation` % (0–12 · 4) · `freq` {1,4,12} · 12. Toggles: comparar simple, mostrar valor real.
- **Modelo:** `i = r/n`, `N = n·t`. `VF = P(1+i)^N + PMT·((1+i)^N − 1)/i`. Simple: `P(1+r·t)`. Real: `VF/(1+π)^t`. Serie por año.
- **KPIs:** valor futuro, total aportado, interés ganado, valor real.
- **Gráfica:** área de crecimiento + líneas (simple, real, aportado). **Interactividad:** `usePlayback` revela año a año (play/pause + scrub + velocidades 1/2/4×).

### 6.3 EOQ — `eoq(p)`
- **Params:** `demand` anual (1000–50k · 12 000) · `orderCost` S (50–1500 · 400) · `holdCost` H /u·año (1–40 · 8) · `unitCost` C (1–120 · 25) · `leadDays` L (1–30 · 7).
- **Modelo:** `EOQ = √(2·D·S/H)`. `N = D/EOQ`, ciclo `365/N`, `CT = (D/Q)S + (Q/2)H`, `CT* = √(2DSH)`, `ROP = (D/365)·L`.
- **KPIs:** EOQ, pedidos/año, costo anual de inventario, punto de reorden.
- **Gráficas:** (a) costos vs Q (pedir, mantener, total) con mín. marcado en EOQ; (b) diente de sierra del inventario.

### 6.4 Punto de reorden — `reorderPoint(p)`
- **Params:** `dailyMean` d̄ (5–120 · 40) · `dailySd` σ (0–50 · 12) · `leadDays` L (1–20 · 6) · `service` % (80–99.5 · 95) · `orderQty` Q (100–600 · 300) · `seed` {7,23,99}.
- **Modelo:** `z = Φ⁻¹(servicio)` (inversa normal, Acklam — ya implementada). `SS = z·σ·√L`. `ROP = d̄·L + SS`. Simulación día a día con demanda `N(d̄, σ)` y reposición tras L días; cuenta faltantes y fill rate.
- **KPIs:** ROP (con z), stock de seguridad, días con faltante, tasa de cumplimiento.
- **Gráfica:** inventario simulado (área) + líneas ROP y SS + puntos de pedido. **Playback** día a día. El `seed` da escenarios reproducibles.

### 6.5 Revisión continua vs periódica — `reviewSystems(p)`
- **Params:** comunes d̄ σ L servicio; `reviewT` T días (3–30 · 14, solo periódica) · `orderQty` Q (100–500 · 280, solo continua).
- **Modelo:** Continua (s,Q): `s = d̄·L + z·σ·√L`. Periódica (R,S): `S = d̄·(T+L) + z·σ·√(T+L)`, pedido = `S − (stock + en tránsito)`. **Ambas corren sobre la MISMA secuencia aleatoria** (mismo seed) para comparar de forma justa.
- **KPIs:** ROP/SS continua, S/SS periódica, inventario medio cont/per, nº pedidos cont/per.
- **Gráfica:** dos curvas de inventario superpuestas. **Playback** día a día.

### 6.6 Efecto látigo — `bullwhip(p)`
- **Params:** `demandStep` (0–50 · 20, salto en semana 6) · `leadTime` sem (1–6 · 2) · `alpha` suavizado EWMA (0.1–0.9 · 0.3) · `safety` (0–3 · 1) · `noise` (0–20 · 6) · `shareInfo` bool.
- **Modelo (procesamiento de señal de demanda, Lee/Chen):** 4 eslabones. Cada uno pronostica con EWMA `f = α·d + (1−α)·f`, fija base-stock `S = f·(L+1) + safety·σ·√(L+1)` y pide `order = d + (S − S_prev)`, lo que **amplifica el cambio de demanda en ~(1+(L+1)α)** por eslabón. Si `shareInfo`, todos pronostican sobre la demanda del cliente final (el látigo casi desaparece). Amplificación = `Var(pedidos eslabón)/Var(demanda cliente)`.
- **KPIs:** amplificación por eslabón (minorista→fábrica, creciente).
- **Gráficas:** (a) pedidos de los 4 eslabones + demanda del cliente en el tiempo; (b) barras de amplificación con línea 1×. **Playback** semana a semana.

### 6.7 Beer Game — `beerGame(p)`
- **Params:** `policy` {basestock, naive} · `stepDemand` (4–20 · 8, salto en semana 5) · `baseStock` S (8–40 · 16) · `holdCost` /u (0.25–2 · 0.5) · `backCost` /u (0.5–4 · 1). Vista del gráfico: inventario / pedidos / costo.
- **Modelo:** 4 etapas con **retrasos** de envío y de pedido (2 sem c/u). Inventario neto `I = I + recibido − (demanda + backlog)`. Posición de inventario `IP = I − B + en tránsito`. Base-stock: `pedido = max(0, S − IP)`; naive: `pedido = lo recibido`. Costo `= h·I⁺ + b·B`.
- **KPIs:** costo total por etapa (+ gran total en callout).
- **Gráfica:** según vista — inventario neto (positivo stock / negativo backlog), pedidos (con línea de cliente) o costo acumulado. **Playback** semanal. Política `naive` debe verse claramente más oscilante/cara.

### 6.8 Teoría de colas — `queue(p)`
- **Params:** `lambda` λ /h (1–20 · 8) · `mu` μ /h por servidor (2–22 · 10) · `servers` c (1–6 · 1).
- **Modelo:** `ρ = λ/(c·μ)`. **M/M/1:** `L = ρ/(1−ρ)`, `Wq = λ/(μ(μ−λ))`, `W = 1/(μ−λ)`, `Lq = ρ²/(1−ρ)`. **M/M/c:** Erlang C para `Pwait`, luego `Lq = Pwait·ρ/(1−ρ)`, `Wq = Lq/λ`, `W = Wq + 1/μ`, `L = λW`. Ley de Little `L = λW`. Marcar `ρ ≥ 1` como inestable (cola → ∞).
- **KPIs:** utilización ρ, L (en sistema), Wq (min), probabilidad de esperar.
- **Gráficas:** (a) **Wq vs utilización** (la curva explota cerca de ρ=1) con marcador de la operación actual y zona crítica en 85%; (b) barras Lq vs en servicio. Sin playback (es analítico/estacionario).

---

## 7. Interactividad (las 3 modalidades pedidas)

1. **Sliders en tiempo real** — todas las sims; recalcular con `useMemo(model, [params])`.
2. **Animación temporal play/pause** — sims 2, 4, 5, 6, 7 vía hook `usePlayback(total, {fps})` (devuelve `step, playing, toggle, reset, speed, setSpeed`). La gráfica filtra los datos hasta `step`.
3. **Comparación de escenarios** — ya integrada donde es más didáctico: oferta/demanda (curvas desplazadas + impuesto), interés (simple vs compuesto vs real), revisión continua vs periódica (dos políticas, misma demanda), bullwhip (con/sin compartir info), beer game (base-stock vs naive). Se puede extender con "guardar escenario A/B" si se desea.

---

## 8. Accesibilidad y responsive

- Contraste AA en ambos temas (los tokens ya están calibrados; el teal de acento usa `#00936f` sobre blanco).
- Sliders con `aria-label`; toggles con `aria-pressed`.
- Hit targets ≥ 40px en móvil; el grid colapsa a 1 columna < 980px y el sidebar pasa a barra superior < 860px.
- `prefers-reduced-motion`: desactivar la animación de entrada `fade-in` y autoplay.

---

## 9. Despliegue gratuito

### Vercel (recomendado)
1. Push del repo a GitHub.
2. Importar en Vercel → framework **Vite** (autodetectado). Build `npm run build`, output `dist`.
3. Deploy automático en cada push. URL pública gratuita.

### GitHub Pages
1. En `vite.config.js`: `base: '/NOMBRE_DEL_REPO/'`.
2. `npm run build` y publicar `dist/` con la action `peaceiris/actions-gh-pages` o `gh-pages -d dist`.
3. Activar Pages en *Settings → Pages* (rama `gh-pages`).

---

## 10. Criterios de aceptación

- [ ] Las 8 sims calculan con las fórmulas de §6 (portadas desde `models.js` sin alterar la matemática).
- [ ] Cada sim tiene las 3 pestañas con su contenido (Simulador / Explicación / Teoría).
- [ ] Sliders recalculan en vivo; playback funciona en las sims con dimensión temporal.
- [ ] Tema claro/oscuro con persistencia; gráficas heredan colores del tema.
- [ ] Responsive (desktop, tablet, móvil) sin desbordes.
- [ ] Desplegado en una URL pública gratuita.

---

## 11. Changelog del diseño

> Mantener al actualizar el prototipo. Si cambian parámetros, defaults o fórmulas, edítalos en §6 y registra aquí la fecha.

- **2026-06-12** — Versión inicial. 8 simulaciones, sistema editorial light/dark, marca EconSim. Modelo de bullwhip basado en procesamiento de señal de demanda (amplificación creciente por varianza).
