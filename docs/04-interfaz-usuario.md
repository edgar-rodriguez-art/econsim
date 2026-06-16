# Interfaz de Usuario — EconSim

## Mapa de Pantallas

```mermaid
graph LR
    subgraph "Pantallas disponibles (3 tabs × 8 sims = 24 vistas)"
        direction TB
        SIM_TAB["Tab: Simulador\n(interactivo)"]
        EXP_TAB["Tab: Explicación\n(narrativo)"]
        THE_TAB["Tab: Teoría\n(matemático)"]
    end

    subgraph "8 Simulaciones"
        direction TB
        SD["Oferta y Demanda"]
        CP["Interés Compuesto"]
        EQ["Cantidad Económica de Pedido"]
        RO["Punto de Reorden"]
        RV["Revisión Continua vs Periódica"]
        BW["Efecto Látigo"]
        BG["Beer Game"]
        QU["Teoría de Colas"]
    end

    SD & CP & EQ & RO & RV & BW & BG & QU --> SIM_TAB
    SD & CP & EQ & RO & RV & BW & BG & QU --> EXP_TAB
    SD & CP & EQ & RO & RV & BW & BG & QU --> THE_TAB
```

## Layout General de la Interfaz

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EconSim                            🌙/☀️   │
├──────────────┬──────────────────────────────────────────────────────┤
│              │  ┌─ TÍTULO DE SIMULACIÓN ──────────────────────────┐ │
│  BARRA       │  │  Kicker: Microeconomía                          │ │
│  LATERAL     │  │  Título: Oferta y Demanda                       │ │
│              │  │  Lede: descripción breve                        │ │
│  ① Oferta    │  └─────────────────────────────────────────────────┘ │
│    y demanda │                                                       │
│  ② Interés   │  ┌─ TABS ──────────────────────────────────────────┐ │
│    compuesto │  │  [Simulador]  [Explicación]  [Teoría]           │ │
│  ③ EOQ       │  └─────────────────────────────────────────────────┘ │
│  ④ Punto de  │                                                       │
│    reorden   │  ┌─ SIM-GRID ──────────────────────────────────────┐ │
│  ⑤ Revisión  │  │ ┌──────────────┐  ┌───────────────────────────┐ │ │
│  ⑥ Látigo    │  │ │    PANEL     │  │  ┌─ KPIs ───────────────┐ │ │ │
│  ⑦ Beer Game │  │ │  de control  │  │  │ KPI1 KPI2 KPI3 KPI4 │ │ │ │
│  ⑧ Colas     │  │ │              │  │  └─────────────────────┘ │ │ │
│              │  │ │  [Slider 1]  │  │                           │ │ │
│              │  │ │  [Slider 2]  │  │  [PlayBar] (si aplica)   │ │ │
│              │  │ │  [Slider 3]  │  │                           │ │ │
│              │  │ │  ──────────  │  │  ┌─ ChartCard ─────────┐ │ │ │
│              │  │ │  [Switch]    │  │  │ Título de gráfica   │ │ │ │
│              │  │ │              │  │  │                     │ │ │ │
│              │  │ │  Estado:     │  │  │   [GRÁFICA]         │ │ │ │
│              │  │ │  ✓ Estable   │  │  │                     │ │ │ │
│              │  │ └──────────────┘  │  └─────────────────────┘ │ │ │
│              │  │                   │                           │ │ │
│              │  │                   │  ┌─ ChartCard 2 ───────┐ │ │ │
│              │  │                   │  │   [GRÁFICA 2]       │ │ │ │
│              │  │                   │  └─────────────────────┘ │ │ │
│              │  │                   └───────────────────────────┘ │ │
│              │  └─────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────┘
```

## Layout Tab "Explicación"

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Simulador]  [Explicación]  [Teoría]                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Párrafo de introducción (lead)                                     │
│                                                                      │
│  A  ¿Qué hace esta simulación?                                      │
│     ──────────────────────────                                       │
│     Descripción narrativa del modelo...                             │
│                                                                      │
│  B  Significado de los parámetros                                   │
│     ──────────────────────────────                                  │
│     ┌───┬──────────────────────────────────────────────────┐       │
│     │ λ │ Tasa de llegadas — descripción completa          │       │
│     │ μ │ Tasa de servicio — descripción completa          │       │
│     │ c │ Número de servidores — descripción               │       │
│     └───┴──────────────────────────────────────────────────┘       │
│                                                                      │
│  C  Efectos que observarás                                          │
│     ────────────────────────                                         │
│     • Efecto 1                                                      │
│     • Efecto 2                                                      │
│                                                                      │
│  D  Utilidad en los negocios                                        │
│     ────────────────────────                                         │
│     ┌1─────────────────────────────────────────────────────┐       │
│     │ Caso de uso 1: título                                │       │
│     │ Descripción de aplicación real                       │       │
│     └─────────────────────────────────────────────────────┘       │
│     ┌2─────────────────────────────────────────────────────┐       │
│     │ Caso de uso 2...                                     │       │
│     └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Layout Tab "Teoría"

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Simulador]  [Explicación]  [Teoría]                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ∑  Título del modelo matemático                                    │
│                                                                      │
│     Texto de contexto con variables inline fx...                    │
│                                                                      │
│     ┌─ FÓRMULA ──────────────────────────────────────────────┐     │
│     │                                                         │     │
│     │          λ                                              │     │
│     │   ρ =  ─────    (estable si ρ < 1)                    │     │
│     │          μ                                              │     │
│     │                                                         │     │
│     │  donde:  ρ: utilización · λ: llegadas · μ: servicio    │     │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                      │
│     ┌─ CALLOUT ──────────────────────────────────────────────┐     │
│     │  💡 La intuición clave                                  │     │
│     │  Cuando ρ → 1, la espera tiende a infinito...          │     │
│     └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Estados de los Componentes Interactivos

```mermaid
stateDiagram-v2
    [*] --> Estable: sistema estable\nρ < 1

    Estable --> Critico: ρ > 0.85
    Critico --> Estable: ρ ≤ 0.85
    Critico --> Saturado: ρ ≥ 1.0
    Saturado --> Critico: ρ < 1.0

    state Estable {
        KPIs_normales: KPIs en azul/verde
        Graficas_OK: Gráficas con datos finitos
    }

    state Critico {
        KPIs_advertencia: KPI utilización en rojo
        Zona_critica: Línea punteada "zona crítica"
    }

    state Saturado {
        KPIs_infinito: KPIs muestran ∞
        Aviso_coral: Aviso en coral/rojo
    }
```

## Sistema de Colores Semánticos

```mermaid
graph LR
    subgraph "Colores por función"
        direction TB
        A["🔵 --c-blue\nClientes en sistema (L)"]
        B["🟡 --c-amber\nEspera / tiempo (Wq, W)"]
        C["🔴 --c-coral\nAlertas / utilización alta"]
        D["🟢 --c-teal\nMinorista / etapa 1"]
        E["💜 --c-violet\nProbabilidades"]
        F["🟣 --c-blue\nMayorista / etapa 2"]
        G["⚪ --ink\nDemanda del cliente real"]
    end
```
