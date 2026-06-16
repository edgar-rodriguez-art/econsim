# Diagramas de Conexión — EconSim

## Flujo de Datos: Usuario → Pantalla

```mermaid
sequenceDiagram
    actor U as Usuario
    participant SL as Slider
    participant ST as Estado React
    participant MO as models.js
    participant CH as Chart.jsx
    participant RC as Recharts

    U->>SL: Arrastra slider (λ = 12)
    SL->>ST: onChange → setLambda(12)
    ST->>ST: useMemo detecta cambio en deps
    ST->>MO: queue({ lambda:12, mu, servers })
    MO->>MO: Erlang C, L, Lq, Wq, W...
    MO-->>ST: { rho, L, Wq, Pwait, curve, stable }
    ST->>CH: series=[...], markers=[...], xDomain, yDomain
    CH->>CH: useMemo convierte [[x,y]] → [{x,y}]
    CH->>RC: "ComposedChart data=[] por serie"
    RC-->>U: Gráfica actualizada en pantalla
```

## Flujo de Datos: Animación Temporal

```mermaid
sequenceDiagram
    actor U as Usuario
    participant PB as PlayBar
    participant UP as usePlayback
    participant RAF as requestAnimationFrame
    participant SIM as Simulación
    participant CH as Chart

    U->>PB: Clic Play
    PB->>UP: toggle()
    UP->>UP: playing = true
    UP->>RAF: requestAnimationFrame(loop)

    loop Cada frame
        RAF->>UP: timestamp
        UP->>UP: elapsed >= 1000/fps?
        alt sí
            UP->>UP: step++
            UP-->>SIM: setStep(step)
            SIM->>SIM: upto(arr) filtra hasta step
            SIM-->>CH: series actualizadas
            CH-->>U: Frame animado
        else no
            UP->>RAF: siguiente frame
        end
    end

    U->>PB: Clic Pause
    PB->>UP: toggle()
    UP->>UP: playing = false
    UP->>RAF: cancelAnimationFrame
```

## Conexiones entre Módulos

```mermaid
graph TB
    subgraph "Entrada del usuario"
        I1["Slider\nparámetros continuos"]
        I2["Segmented\nopciones discretas"]
        I3["SwitchRow\nbooleanos"]
        I4["PlayBar\ncontrol de tiempo"]
    end

    subgraph "Gestión de estado App.jsx"
        S1["useState\nactive sim"]
        S2["useState\ntab activo"]
        S3["useState\ntema claro/oscuro"]
        S4["localStorage\npersistencia"]
    end

    subgraph "Estado por simulación"
        S5["useState\nparámetros"]
        S6["useMemo\nresultados del modelo"]
        S7["usePlayback\nstep actual"]
    end

    subgraph "Capa de modelo lib/models.js"
        M1["supplyDemand()"]
        M2["compound()"]
        M3["eoq()"]
        M4["reorderPoint()"]
        M5["reviewSystems()"]
        M6["bullwhip()"]
        M7["beerGame()"]
        M8["queue()"]
        M9["makeRng(seed)\nBox-Muller RNG"]
        M10["zFromService()\nAcklam inverse CDF"]
    end

    subgraph "Renderizado"
        R1["KPI cards"]
        R2["Chart.jsx"]
        R3["Callout"]
        R4["Formula"]
    end

    subgraph "Recharts"
        RC1["ComposedChart"]
        RC2["Line / Area / Bar"]
        RC3["XAxis / YAxis"]
        RC4["ReferenceLine / Dot / Area"]
        RC5["Tooltip / ResponsiveContainer"]
    end

    I1 & I2 & I3 --> S5
    I4 --> S7
    S5 --> S6
    S6 --> M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8
    M9 --> M4 & M5 & M6 & M7
    M10 --> M4 & M5
    M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 --> R1 & R2
    S7 --> R2
    R2 --> RC1 --> RC2 & RC3 & RC4 & RC5
    S1 & S3 --> S4
    S3 --> |data-theme| THEME["CSS Variables\ntema claro/oscuro"]
```

## Conexión de Persistencia

```mermaid
sequenceDiagram
    participant LS as localStorage
    participant APP as App.jsx
    participant SB as Sidebar
    participant TH as HTML theme

    Note over LS,TH: Al cargar la página
    APP->>LS: getItem('econsim.active')
    LS-->>APP: 'queue' (o null)
    APP->>LS: getItem('econsim.theme')
    LS-->>APP: 'dark' (o null)
    APP->>TH: document.documentElement\n.dataset.theme = 'dark'

    Note over LS,TH: Al cambiar simulación
    SB->>APP: setActive('beer')
    APP->>LS: setItem('econsim.active', 'beer')

    Note over LS,TH: Al cambiar tema
    APP->>APP: setTheme('light')
    APP->>TH: dataset.theme = 'light'
    APP->>LS: setItem('econsim.theme', 'light')
```

## Conexión con Infraestructura (Deploy)

```mermaid
graph LR
    DEV["Desarrollador\ngit push origin main"] --> GH["GitHub\nedgar-rodriguez-art/econsim"]
    GH --> GHA["GitHub Actions\ndeploy.yml"]
    GHA --> NODE["Setup Node 20\nnpm ci"]
    NODE --> BUILD["npm run build\nvite build"]
    BUILD --> DIST["dist/\nindex.html + assets/"]
    DIST --> PAGES["GitHub Pages\narcade.github.io/econsim"]
    DIST --> VERCEL["Vercel\neconsim-theta.vercel.app"]

    VERCEL -.->|"base: '/'"| OK["✅ Funciona"]
    PAGES -.->|"base: '/econsim/'"| OK2["✅ Funciona"]
```
