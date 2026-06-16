# Diagrama de Gantt — EconSim

> Jornada laboral: **8 horas/día · lunes a viernes**
> Fecha de inicio: 2026-01-05
> Las duraciones excluyen fines de semana.

---

## Gantt por Perfil (vista individual)

```mermaid
gantt
    title EconSim — Estimación de Desarrollo por Perfil (8h/día · L-V)
    dateFormat  YYYY-MM-DD
    excludes    weekends

    section 🎓 Junior  (~23 semanas · 116 días hábiles)
    Análisis de requerimientos y alcance        :j1,  2026-01-05,  3d
    Aprendizaje React + Vite + ES Modules       :j2,  after j1,   10d
    Aprendizaje Recharts + CSS variables        :j3,  after j2,    5d
    Aprendizaje modelos económicos/operaciones  :j4,  after j3,    5d
    Diseño de arquitectura del proyecto         :j5,  after j4,    5d
    Configuración del entorno de desarrollo     :j6,  after j5,    3d
    Implementación lib/models.js (8 modelos)    :j7,  after j6,   15d
    Componentes UI base (14 componentes)        :j8,  after j7,   10d
    Componente Chart.jsx + integración Recharts :j9,  after j8,    8d
    App shell · navegación · persistencia       :j10, after j9,    5d
    CSS design system (tokens + dark mode)      :j11, after j10,   5d
    Simulaciones 1-4 (SD, Compound, EOQ, ROP)  :j12, after j11,  12d
    Simulaciones 5-8 (Review, BW, Beer, Queue) :j13, after j12,  12d
    Pruebas · depuración · integración          :j14, after j13,   8d
    Configuración CI/CD · GitHub Actions        :j15, after j14,   3d
    Despliegue a Vercel + ajuste base path      :j16, after j15,   2d
    Documentación técnica y manual de usuario   :j17, after j16,   5d
    milestone ✅ Entrega Junior                  :mj,  after j17,   0d

    section 💼 Middle  (~11 semanas · 56 días hábiles)
    Análisis de requerimientos y alcance        :m1,  2026-01-05,  2d
    Nivelación del stack (brechas a cubrir)     :m2,  after m1,    3d
    Estudio modelos económicos/operaciones      :m3,  after m2,    2d
    Diseño de arquitectura del proyecto         :m4,  after m3,    3d
    Configuración del entorno de desarrollo     :m5,  after m4,    1d
    Implementación lib/models.js (8 modelos)    :m6,  after m5,    8d
    Componentes UI base                         :m7,  after m6,    5d
    Componente Chart.jsx + integración Recharts :m8,  after m7,    4d
    App shell · navegación · persistencia       :m9,  after m8,    3d
    CSS design system (tokens + dark mode)      :m10, after m9,    3d
    Simulaciones 1-4 (SD, Compound, EOQ, ROP)  :m11, after m10,   6d
    Simulaciones 5-8 (Review, BW, Beer, Queue) :m12, after m11,   6d
    Pruebas · depuración · integración          :m13, after m12,   4d
    Configuración CI/CD · GitHub Actions        :m14, after m13,   2d
    Despliegue a Vercel + ajuste base path      :m15, after m14,   1d
    Documentación técnica y manual de usuario   :m16, after m15,   3d
    milestone ✅ Entrega Middle                  :mm,  after m16,   0d

    section 🏆 Senior  (~5 semanas · 25 días hábiles)
    Análisis de requerimientos y alcance        :s1,  2026-01-05,  1d
    Revisión de brechas del stack               :s2,  after s1,    1d
    Diseño de arquitectura del proyecto         :s3,  after s2,    1d
    Configuración del entorno de desarrollo     :s4,  after s3,    1d
    Implementación lib/models.js (8 modelos)    :s5,  after s4,    3d
    Componentes UI base                         :s6,  after s5,    2d
    Componente Chart.jsx + integración Recharts :s7,  after s6,    1d
    App shell · navegación · persistencia       :s8,  after s7,    1d
    CSS design system (tokens + dark mode)      :s9,  after s8,    1d
    Simulaciones 1-4 (SD, Compound, EOQ, ROP)  :s10, after s9,    2d
    Simulaciones 5-8 (Review, BW, Beer, Queue) :s11, after s10,   3d
    Pruebas · depuración · integración          :s12, after s11,   2d
    Configuración CI/CD · GitHub Actions        :s13, after s12,   1d
    Despliegue a Vercel + ajuste base path      :s14, after s13,   1d
    Documentación técnica y manual de usuario   :s15, after s14,   2d
    milestone ✅ Entrega Senior                  :ms,  after s15,   0d

    section 🤖 Claude Code  (~7 días hábiles)
    Análisis de requerimientos y alcance        :c1,  2026-01-05,  1d
    Diseño de arquitectura + scaffolding        :c2,  after c1,    1d
    lib/models.js + format.js (8 modelos)       :c3,  after c2,    1d
    Componentes UI base + Chart.jsx + Recharts  :c4,  after c3,    1d
    App shell + CSS design system + usePlayback :c5,  after c4,    1d
    Simulaciones 1-8 (los 8 módulos)            :c6,  after c5,    1d
    Pruebas · CI/CD · Deploy Vercel · Docs      :c7,  after c6,    1d
    milestone ✅ Entrega Claude Code             :mc,  after c7,    0d
```

---

## Gantt Comparativo (todos en el mismo eje de tiempo)

```mermaid
gantt
    title EconSim — Comparación de Duración Total por Perfil
    dateFormat  YYYY-MM-DD
    excludes    weekends

    section 🤖 Claude Code
    Análisis + Arquitectura             :crit, cc1, 2026-01-05, 2d
    Modelos + Componentes + Chart       :crit, cc2, after cc1,  2d
    Sims 1-8 + App + CSS                :crit, cc3, after cc2,  2d
    Tests + CI/CD + Deploy + Docs       :crit, cc4, after cc3,  1d
    milestone ✅ 7 días hábiles          :mcc, after cc4, 0d

    section 🏆 Senior
    Análisis + Brechas + Arquitectura   :sr1, 2026-01-05, 3d
    Config + Modelos + Componentes      :sr2, after sr1,  6d
    Chart + App + CSS                   :sr3, after sr2,  3d
    Sims 1-8 + Pruebas                  :sr4, after sr3,  7d
    CI/CD + Deploy + Docs               :sr5, after sr4,  4d
    milestone ✅ 25 días hábiles         :msr, after sr5, 0d

    section 💼 Middle
    Análisis + Nivelación + Arquitectura :md1, 2026-01-05, 8d
    Config + Modelos + Componentes       :md2, after md1, 14d
    Chart + App + CSS                    :md3, after md2,  7d
    Sims 1-8 + Pruebas                   :md4, after md3, 16d
    CI/CD + Deploy + Docs                :md5, after md4,  6d
    milestone ✅ 56 días hábiles          :mmd, after md5, 0d

    section 🎓 Junior
    Análisis + Aprendizaje stack         :jr1, 2026-01-05, 23d
    Arquitectura + Config + Modelos      :jr2, after jr1,  23d
    Componentes + Chart + App + CSS      :jr3, after jr2,  23d
    Sims 1-8 + Pruebas + Deploy + Docs   :jr4, after jr3,  47d
    milestone ✅ 116 días hábiles         :mjr, after jr4,  0d
```

---

## Resumen de Estimaciones

| Perfil | Días hábiles | Semanas | Meses aprox. | Fecha estimada de entrega |
|--------|-------------|---------|--------------|--------------------------|
| 🤖 **Claude Code** | **7 días** | **~1.5 sem** | — | **14 ene 2026** |
| 🏆 **Senior** | **25 días** | **~5 sem** | **~1.2 meses** | **10 feb 2026** |
| 💼 **Middle** | **56 días** | **~11 sem** | **~2.7 meses** | **24 mar 2026** |
| 🎓 **Junior** | **116 días** | **~23 sem** | **~5.8 meses** | **26 jun 2026** |

---

## Desglose por Fase y Perfil

| Fase | 🎓 Junior | 💼 Middle | 🏆 Senior | 🤖 Claude |
|------|-----------|-----------|-----------|-----------|
| Análisis de requerimientos | 3d | 2d | 1d | — (incluido en día 1) |
| **Aprendizaje del stack** | **20d** | **5d** | **1d** | **0d** |
| Diseño de arquitectura | 5d | 3d | 1d | — (incluido en día 2) |
| Config entorno desarrollo | 3d | 1d | 1d | — |
| lib/models.js (8 modelos) | 15d | 8d | 3d | 1d |
| Componentes UI base (×14) | 10d | 5d | 2d | — (incluido con Chart) |
| Chart.jsx + Recharts | 8d | 4d | 1d | 1d |
| App shell + CSS + routing | 10d | 6d | 2d | 1d |
| Simulaciones 1-4 | 12d | 6d | 2d | — (incluido en día 6) |
| Simulaciones 5-8 | 12d | 6d | 3d | 1d |
| Pruebas + integración | 8d | 4d | 2d | — (incluido en día 7) |
| CI/CD + GitHub Actions | 3d | 2d | 1d | — |
| Despliegue a Vercel | 2d | 1d | 1d | — |
| Documentación | 5d | 3d | 2d | 1d |
| **TOTAL** | **116 días** | **56 días** | **25 días** | **7 días** |

---

## Supuestos del Estimado

### Por perfil

**🎓 Junior**
- No conoce React, Vite, ni Recharts → 20 días de aprendizaje del stack
- Necesita investigar cada fórmula económica (Erlang C, EOQ, EWMA) antes de codificarla
- Requiere tiempo significativo de depuración en cada componente
- Puede necesitar refactorizar partes ya escritas al entender mejor el patrón del proyecto

**💼 Middle**
- Conoce React pero no Recharts ni la arquitectura ComposedChart con datos por serie
- Entiende JavaScript moderno pero puede necesitar repasar hooks avanzados (useMemo, useCallback, RAF)
- Tiene nociones de economía/operaciones pero necesita estudiar las fórmulas específicas
- Velocidad de codificación ~2× mayor que el Junior una vez superada la curva de aprendizaje

**🏆 Senior**
- Domina React, Vite, CSS variables y patrones de arquitectura frontend
- Solo necesita revisar la API de Recharts (ComposedChart, series individuales)
- Conoce los modelos económicos básicos o los entiende rápido al leer la especificación
- Escribe código production-ready desde el primer intento, sin grandes refactorizaciones

**🤖 Claude Code**
- Conoce todo el stack sin aprendizaje previo
- Genera código correcto en el primer intento para la mayoría de componentes
- El tiempo estimado incluye el pensamiento/planificación antes de cada bloque de código
- Las iteraciones con el usuario (correcciones menores, ajustes de deployment) suman ~1 día adicional
- **No duerme, no toma breaks, no tiene reuniones**
