# Diagrama de Componentes — EconSim

## Jerarquía de Componentes React

```mermaid
graph TD
    MAIN["main.jsx\nReactDOM.createRoot"] --> APP

    APP["App.jsx\nstate: active, tab, theme"] --> SB["Sidebar\nnav + theme toggle"]
    APP --> HEADER["Header\ntitle + lede + tabs"]
    APP --> SIM_COMP["&lt;SimComponent tab={tab}/&gt;\ncomponente activo"]

    SB --> NAV_ITEMS["NavItem × 8\ncada simulación"]

    SIM_COMP --> PANEL["Panel\ncontrol de parámetros"]
    SIM_COMP --> KPIS["KPI × N\nmétricas clave"]
    SIM_COMP --> PLAYBAR["PlayBar\njugar/pausar/buscar"]
    SIM_COMP --> CHARTCARD["ChartCard × N\ncontenedor de gráfica"]

    PANEL --> SLIDER["Slider × N\nparámetros continuos"]
    PANEL --> SEGMENTED["Segmented\nselección discreta"]
    PANEL --> SWITCHROW["SwitchRow\nbooleanos"]
    PANEL --> FIELD["Field\nenvoltorio de campo"]

    CHARTCARD --> LEGEND["Legend\nreferencia de series"]
    CHARTCARD --> CHART["Chart.jsx\nRecharts wrapper"]

    CHART --> RC_CC["ComposedChart\nRecharts"]
    RC_CC --> RC_LINE["Line × N\nseries de línea"]
    RC_CC --> RC_AREA["Area × N\nseries de área"]
    RC_CC --> RC_BAR["Bar × N\nseries de barra"]
    RC_CC --> RC_REFLINE["ReferenceLine\nrefLines"]
    RC_CC --> RC_REFDOT["ReferenceDot\nmarkers"]
    RC_CC --> RC_REFAREA["ReferenceArea\nregions"]

    SIM_COMP --> EXPLAIN["tab=explain:\nProsa + Casos"]
    EXPLAIN --> PARAMLIST["ParamList\ndefinición de parámetros"]
    EXPLAIN --> CASE["Case × N\ncasos de negocio"]
    EXPLAIN --> CALLOUT["Callout\ndestaques"]

    SIM_COMP --> THEORY["tab=theory:\nTeoría + Fórmulas"]
    THEORY --> FORMULA["Formula\nbloque de fórmula"]
    FORMULA --> FRAC["Frac\nfracción tipográfica"]
    FORMULA --> SQRT["Sqrt\nraíz cuadrada"]

    style APP fill:#4f46e5,color:#fff
    style CHART fill:#0891b2,color:#fff
    style SIM_COMP fill:#059669,color:#fff
```

## Árbol de Dependencias de Módulos

```mermaid
graph LR
    subgraph "Punto de entrada"
        MAIN["main.jsx"]
    end

    subgraph "Shell"
        APP["App.jsx"]
    end

    subgraph "Simulaciones"
        SD["SupplyDemand.jsx"]
        CP["Compound.jsx"]
        EQ["Eoq.jsx"]
        RO["Reorder.jsx"]
        RV["Review.jsx"]
        BW["Bullwhip.jsx"]
        BG["Beer.jsx"]
        QU["Queue.jsx"]
    end

    subgraph "Biblioteca"
        MOD["lib/models.js"]
        FMT["lib/format.js"]
        UPB["usePlayback.js"]
    end

    subgraph "Componentes UI"
        CHT["Chart.jsx"]
        SLD["Slider.jsx"]
        KPI["KPI.jsx"]
        PNL["Panel.jsx"]
        PBR["PlayBar.jsx"]
        FRM["Formula.jsx"]
        SEG["Segmented.jsx"]
        SWR["SwitchRow.jsx"]
        CCR["ChartCard.jsx"]
        CLT["Callout.jsx"]
        CSE["Case.jsx"]
        PRM["ParamList.jsx"]
        FLD["Field.jsx"]
        LGD["Legend.jsx"]
    end

    MAIN --> APP
    APP --> SD & CP & EQ & RO & RV & BW & BG & QU

    SD & CP & EQ & RO & RV & BW & BG & QU --> MOD
    SD & CP & EQ & RO & RV & BW & BG & QU --> FMT
    RO & RV & BW & BG & CP --> UPB

    SD & CP & EQ & RO & RV & BW & BG & QU --> CHT
    SD & CP & EQ & RO & RV & BW & BG & QU --> SLD
    SD & CP & EQ & RO & RV & BW & BG & QU --> KPI
    SD & CP & EQ & RO & RV & BW & BG & QU --> PNL
    SD & CP & EQ & RO & RV & BW & BG & QU --> CCR
    SD & CP & EQ & RO & RV & BW & BG & QU --> FRM
    SD & CP & EQ & RO & RV & BW & BG & QU --> CLT
    SD & CP & EQ & RO & RV & BW & BG & QU --> CSE
    SD & CP & EQ & RO & RV & BW & BG & QU --> PRM
```

## Contratos de Props de Componentes Clave

```mermaid
classDiagram
    class Chart {
        +height: number
        +series: Serie[]
        +xDomain: number[]
        +yDomain: number[]
        +xLabel: string
        +yLabel: string
        +formatX: Function
        +formatY: Function
        +xTicks: number
        +yTicks: number
        +refLines: RefLine[]
        +regions: Region[]
        +markers: Marker[]
        +gridX: boolean
    }

    class Serie {
        +type: line|area|bar
        +data: number[][]
        +color: string
        +width: number
        +dash: string
        +opacity: number
        +name: string
    }

    class KPI {
        +label: string
        +value: string|number
        +unit: string
        +sub: string
        +color: string
    }

    class Slider {
        +label: string
        +value: number
        +min: number
        +max: number
        +step: number
        +onChange: Function
        +fmt: Function
        +unit: string
        +hint: string
    }

    class PlayBar {
        +playing: boolean
        +step: number
        +total: number
        +speed: 1|2|4
        +onToggle: Function
        +onReset: Function
        +onSeek: Function
        +onSpeed: Function
        +labelFmt: Function
    }

    class usePlayback {
        +step: number
        +setStep: Function
        +playing: boolean
        +toggle: Function
        +reset: Function
        +speed: number
        +setSpeed: Function
    }

    Chart --> Serie
    PlayBar --> usePlayback
