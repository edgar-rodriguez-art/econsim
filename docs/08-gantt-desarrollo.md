# Diagrama de Gantt — EconSim

> Jornada laboral humana: **8 horas/día · lunes a viernes**
> Fecha de inicio referencial: 2026-01-05
> Las duraciones excluyen fines de semana.

---

## Gantt por Perfil Humano (días hábiles)

```mermaid
gantt
    title EconSim — Estimación de Desarrollo Humano (8h/día · L-V)
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
```

---

## 🤖 Claude Code — Línea de Tiempo Real (minutos)

> Claude no trabaja en jornadas. El tiempo es de **generación activa**, sin pausas, sin reuniones, sin sueño.

```mermaid
gantt
    title Claude Code — Tiempo real de generación (~131 minutos)
    dateFormat  HH:mm
    axisFormat  %H:%M h

    section 🤖 Claude Code  (2 horas 11 minutos)
    Lectura README-handoff + análisis            :c1,  00:00,  5m
    Diseño de arquitectura + decisiones técnicas :c2,  after c1,  5m
    package.json · vite.config · index.html      :c3,  after c2,  5m
    lib/models.js  (8 modelos · 362 líneas)      :crit, c4,  after c3, 15m
    lib/format.js + src/theme.css                :c5,  after c4, 11m
    src/main.jsx + src/App.jsx (shell + nav)     :c6,  after c5, 12m
    14 componentes UI base                       :crit, c7,  after c6, 15m
    Chart.jsx + wrapper Recharts                 :crit, c8,  after c7, 10m
    usePlayback.js (animación RAF)               :c9,  after c8,  5m
    8 Simulaciones (SupplyDemand→Queue)          :crit, c10, after c9, 20m
    Pruebas npm run build · corrección errores   :c11, after c10,  5m
    CI/CD GitHub Actions · ajuste base path      :c12, after c11,  8m
    Documentación técnica (7 archivos · 1314 lín):c13, after c12, 15m
    milestone ✅ Total: 131 minutos              :mc,  after c13,  0m
```

---

## Comparación de Escala (perspectiva)

```mermaid
gantt
    title Comparación de duración total — mismas fases, misma medida (días hábiles)
    dateFormat  YYYY-MM-DD
    excludes    weekends

    section 🤖 Claude Code
    Todo el proyecto                      :crit, cc1, 2026-01-05, 1d
    milestone ✅ ~2h (representado como 1d):mcc, after cc1, 0d

    section 🏆 Senior
    Análisis + Brechas + Arquitectura     :sr1, 2026-01-05,  3d
    Config + Modelos + Componentes        :sr2, after sr1,   6d
    Chart + App + CSS                     :sr3, after sr2,   3d
    Sims 1-8 + Pruebas                    :sr4, after sr3,   7d
    CI/CD + Deploy + Docs                 :sr5, after sr4,   4d
    milestone ✅ 25 días hábiles           :msr, after sr5,   0d

    section 💼 Middle
    Análisis + Nivelación + Arquitectura  :md1, 2026-01-05,  8d
    Config + Modelos + Componentes        :md2, after md1,  14d
    Chart + App + CSS                     :md3, after md2,   7d
    Sims 1-8 + Pruebas                    :md4, after md3,  16d
    CI/CD + Deploy + Docs                 :md5, after md4,   6d
    milestone ✅ 56 días hábiles           :mmd, after md5,   0d

    section 🎓 Junior
    Análisis + Aprendizaje stack          :jr1, 2026-01-05, 23d
    Arquitectura + Config + Modelos       :jr2, after jr1,  23d
    Componentes + Chart + App + CSS       :jr3, after jr2,  23d
    Sims 1-8 + Pruebas + Deploy + Docs    :jr4, after jr3,  47d
    milestone ✅ 116 días hábiles          :mjr, after jr4,   0d
```

> ⚠️ La barra de **Claude Code** está representada con **1 día mínimo** por limitaciones de escala del diagrama.
> Su tiempo real fue **~131 minutos** de generación activa — equivalente al **0.86% del tiempo del Senior**.

---

## Resumen de Estimaciones

| Perfil | Tiempo real | Equivalente hábil | Fecha estimada de entrega |
|--------|-------------|-------------------|--------------------------|
| 🤖 **Claude Code** | **~131 minutos** | — | **mismo día** |
| 🏆 **Senior** | **25 días hábiles** | ~5 semanas | **10 feb 2026** |
| 💼 **Middle** | **56 días hábiles** | ~11 semanas | **24 mar 2026** |
| 🎓 **Junior** | **116 días hábiles** | ~23 semanas | **26 jun 2026** |

---

## Desglose por Fase

| Fase | 🎓 Junior | 💼 Middle | 🏆 Senior | 🤖 Claude Code |
|------|-----------|-----------|-----------|----------------|
| Análisis de requerimientos | 3d | 2d | 1d | **5 min** |
| Aprendizaje del stack | **20d** | **5d** | **1d** | **0 min** |
| Diseño de arquitectura | 5d | 3d | 1d | **5 min** |
| Config entorno desarrollo | 3d | 1d | 1d | **5 min** |
| lib/models.js (8 modelos) | 15d | 8d | 3d | **15 min** |
| format.js + theme.css | 5d | 3d | 1d | **11 min** |
| main.jsx + App.jsx | 5d | 3d | 1d | **12 min** |
| 14 Componentes UI base | 10d | 5d | 2d | **15 min** |
| Chart.jsx + Recharts | 8d | 4d | 1d | **10 min** |
| usePlayback.js | 2d | 1d | 1d | **5 min** |
| Simulaciones 1-8 | 24d | 12d | 5d | **20 min** |
| Pruebas + integración | 8d | 4d | 2d | **5 min** |
| CI/CD + GitHub Actions | 3d | 2d | 1d | **8 min** |
| Documentación | 5d | 3d | 2d | **15 min** |
| **TOTAL** | **116 días** | **56 días** | **25 días** | **131 min** |

---

## Supuestos del Estimado

**🎓 Junior**
- No conoce React, Vite, ni Recharts → 20 días de aprendizaje del stack
- Necesita investigar cada fórmula económica (Erlang C, EOQ, EWMA) antes de codificarla
- Requiere tiempo significativo de depuración en cada componente
- Puede necesitar refactorizar partes ya escritas al entender mejor el patrón del proyecto

**💼 Middle**
- Conoce React pero no Recharts ni la arquitectura `ComposedChart` con datos por serie
- Entiende JavaScript moderno pero puede necesitar repasar hooks avanzados (useMemo, RAF)
- Tiene nociones de economía/operaciones pero necesita estudiar las fórmulas específicas
- Velocidad ~2× mayor que el Junior una vez superada la curva de aprendizaje

**🏆 Senior**
- Domina React, Vite, CSS variables y patrones de arquitectura frontend
- Solo necesita revisar la API de Recharts (ComposedChart, series individuales)
- Conoce los modelos económicos básicos o los entiende rápido al leer la especificación
- Escribe código production-ready desde el primer intento, sin grandes refactorizaciones

**🤖 Claude Code**
- Sin aprendizaje previo necesario — conoce todo el stack desde el inicio
- Genera código correcto en el primer intento para la mayoría de casos
- No tiene tiempo de "pensar" entre tareas — genera en paralelo mientras razona
- Los 131 minutos incluyen lectura, razonamiento, generación de código y documentación
- No duerme · no toma breaks · no tiene reuniones · no navega Stack Overflow
- El tiempo de espera de aprobaciones del usuario **no está incluido** en los 131 minutos
