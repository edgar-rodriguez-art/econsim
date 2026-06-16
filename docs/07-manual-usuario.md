# Manual de Usuario — EconSim

## Descripción General

**EconSim** es una plataforma interactiva de simulaciones económicas y de operaciones. Permite explorar y comprender ocho modelos fundamentales de economía y gestión de cadenas de suministro a través de visualizaciones dinámicas, explicaciones narrativas y fundamentos matemáticos.

**URL de acceso:** https://econsim-theta.vercel.app/

---

## Interfaz Principal

### Componentes de la pantalla

| Zona | Descripción |
|------|-------------|
| **Barra lateral (izquierda)** | Lista de las 8 simulaciones disponibles y botón de cambio de tema |
| **Encabezado (superior)** | Nombre, categoría y descripción de la simulación activa |
| **Pestañas** | Alternan entre Simulador, Explicación y Teoría |
| **Panel de parámetros** | Controles para ajustar los valores del modelo |
| **KPIs** | Métricas clave calculadas en tiempo real |
| **Gráficas** | Visualizaciones que responden a los cambios de parámetros |

### Cambiar entre modo claro y oscuro

Haz clic en el ícono **🌙 / ☀️** en la esquina superior derecha de la barra lateral. La preferencia se guarda automáticamente.

---

## Las 8 Simulaciones

### ① Oferta y Demanda
**Categoría:** Microeconomía

Muestra cómo el precio de equilibrio y la cantidad de mercado se determinan por la intersección de las curvas de oferta y demanda. Permite simular el efecto de impuestos, subsidios y desplazamientos de curvas.

**Parámetros principales:**
- Intercepción y pendiente de la curva de demanda
- Intercepción y pendiente de la curva de oferta
- Desplazamiento de demanda / oferta
- Impuesto por unidad

**Métricas mostradas:** Precio y cantidad de equilibrio, excedentes del consumidor y productor, pérdida de peso muerto, recaudación fiscal.

---

### ② Interés Compuesto
**Categoría:** Finanzas personales

Visualiza el crecimiento del capital a lo largo del tiempo comparando interés compuesto, interés simple y valor real ajustado por inflación.

**Parámetros principales:**
- Capital inicial (principal)
- Tasa de interés anual (%)
- Horizonte en años
- Frecuencia de capitalización (anual / trimestral / mensual)
- Contribución periódica
- Inflación anual (%)

**Cómo usar la animación:**
1. Ajusta los parámetros con los sliders
2. Presiona ▶ **Play** para ver cómo crece el capital año a año
3. Usa el control de velocidad (1× / 2× / 4×) para acelerar

---

### ③ Cantidad Económica de Pedido (EOQ)
**Categoría:** Gestión de inventarios

Calcula la cantidad óptima de pedido que minimiza el costo total de inventario (costo de ordenar + costo de mantener).

**Parámetros principales:**
- Demanda anual (unidades)
- Costo fijo por pedido ($)
- Costo de mantener por unidad/año ($)
- Costo unitario del producto ($)
- Tiempo de entrega (días)

**Cómo interpretar la gráfica:**
- La curva **azul** muestra el costo de mantener (sube con Q)
- La curva **ámbar** muestra el costo de ordenar (baja con Q)
- La curva **verde** es el costo total — el mínimo es la EOQ óptima
- El patrón de diente de sierra muestra el ciclo de inventario

---

### ④ Punto de Reorden
**Categoría:** Gestión de inventarios

Simula un sistema de inventario continuo con demanda aleatoria. Muestra cuándo conviene hacer un pedido para evitar desabastecimientos.

**Parámetros principales:**
- Demanda diaria media y desviación estándar
- Tiempo de entrega (días)
- Nivel de servicio objetivo (%)
- Cantidad de pedido
- Semilla del generador aleatorio (para reproducibilidad)

**Indicadores clave:**
- **SS** — Inventario de seguridad calculado
- **ROP** — Punto de reorden recomendado
- **Fill Rate** — Porcentaje de demanda satisfecha
- Los puntos **rojos** en la gráfica indican días sin stock

---

### ⑤ Revisión Continua vs. Periódica
**Categoría:** Gestión de inventarios

Compara dos políticas de reposición de inventario con la misma demanda simulada:
- **Revisión continua** — pedido automático cuando el stock cae al ROP
- **Revisión periódica** — pedido en intervalos fijos de tiempo

**Parámetros principales:**
- Demanda diaria media y desviación estándar
- Tiempo de entrega (días)
- Nivel de servicio objetivo (%)
- Intervalo de revisión periódica (días)

**Cómo interpretar:**
- La curva **teal** es el inventario con revisión continua
- La curva **violeta** es el inventario con revisión periódica
- Compara métricas de desempeño en los KPIs laterales

---

### ⑥ Efecto Látigo (Bullwhip Effect)
**Categoría:** Cadena de suministro

Modela cómo una pequeña variación en la demanda del cliente final se amplifica al subir por la cadena de suministro (minorista → mayorista → distribuidor → fábrica).

**Parámetros principales:**
- Cambio de demanda (salto en semana 6)
- Tiempo de entrega en semanas
- Factor de suavizado del pronóstico (α)
- Factor de seguridad de inventario
- Ruido de demanda
- **Compartir información de demanda** (toggle)

**Experimento recomendado:**
1. Establece α = 0.5, lead time = 3
2. Observa cómo la amplificación crece eslabón a eslabón
3. Activa **"Compartir información"** — el efecto látigo casi desaparece
4. Las barras inferiores muestran la amplificación de variabilidad de cada etapa (valores > 1× indican amplificación)

---

### ⑦ Beer Game
**Categoría:** Cadena de suministro

Recrea el famoso juego de simulación de MIT: una cadena de distribución de 4 eslabones donde las decisiones locales generan caos global.

**Parámetros principales:**
- Demanda tras el salto (semana 5)
- Política de pedido: **Base-stock** (óptima) vs **Ingenua** (replica el pedido recibido)
- Nivel base-stock objetivo
- Costo de mantener por unidad
- Costo de faltante por unidad

**Vista del gráfico:**
- **Inventario** — stock neto por etapa (negativo = backlog)
- **Pedidos** — órdenes colocadas (línea negra = demanda real)
- **Costo** — acumulación de costos por semana

**Experimento recomendado:**
1. Compara política **Base-stock** vs **Ingenua**
2. Con la política ingenua verás cómo el costo total de la cadena se dispara
3. El callout al final muestra el costo total de la cadena

---

### ⑧ Teoría de Colas
**Categoría:** Investigación de operaciones

Modela sistemas de espera (M/M/1 y M/M/c) para calcular cuántos clientes esperan, cuánto tiempo esperan y cuándo el sistema se satura.

**Parámetros principales:**
- Tasa de llegadas λ (clientes/hora)
- Tasa de servicio μ (clientes/hora por servidor)
- Número de servidores c

**Métricas mostradas:**
- **ρ** — Utilización del sistema
- **L** — Número promedio de clientes en el sistema
- **Wq** — Tiempo promedio de espera en cola (minutos)
- **P(esperar)** — Probabilidad de que un cliente tenga que esperar

**Señales de alerta:**
- Etiqueta **"Sistema saturado"** cuando ρ ≥ 1 (la cola crece indefinidamente)
- KPI de utilización en **rojo** cuando ρ > 85%
- La gráfica principal muestra por qué el sistema es no lineal: la espera se dispara al acercarse al 100%

---

## Las 3 Pestañas de cada Simulación

| Pestaña | Contenido | Para quién |
|---------|-----------|------------|
| **Simulador** | Panel interactivo con sliders, gráficas en tiempo real y KPIs | Exploración intuitiva |
| **Explicación** | Narrativa del modelo, definición de parámetros y casos de negocio reales | Comprender el "para qué" |
| **Teoría** | Fórmulas matemáticas, derivaciones y notas sobre supuestos | Profundizar en el "por qué" |

---

## Controles de Animación (PlayBar)

Las simulaciones con dimensión temporal (Interés Compuesto, Punto de Reorden, Revisión, Bullwhip y Beer Game) incluyen una barra de reproducción:

```
◀◀ Reset    ▶ Play / ⏸ Pause    [────●────────] Semana 12    1× 2× 4×
```

| Control | Función |
|---------|---------|
| ▶ / ⏸ | Iniciar o pausar la animación |
| ◀◀ | Volver al inicio |
| Barra de progreso | Arrastrar para saltar a cualquier punto en el tiempo |
| 1× / 2× / 4× | Cambiar la velocidad de reproducción |

---

## Preguntas Frecuentes

**¿Por qué la Teoría de Colas muestra ∞?**
Cuando la tasa de llegadas supera la capacidad total del sistema (λ ≥ c·μ), el sistema es inestable y la cola crece indefinidamente. Añade servidores o reduce λ para estabilizarlo.

**¿Para qué sirve la semilla aleatoria?**
Las simulaciones de inventario usan demanda aleatoria. La semilla garantiza que obtengas los mismos resultados al reproducir un escenario. Cámbiala para ver diferentes realizaciones del mismo modelo.

**¿Qué diferencia hay entre política Base-stock e Ingenua en el Beer Game?**
La política base-stock considera el inventario en tránsito al decidir cuánto pedir, lo que estabiliza el sistema. La política ingenua simplemente repite el pedido recibido, lo que amplifica las oscilaciones (efecto látigo).

**¿Por qué "compartir información" elimina el efecto látigo?**
Cuando todos los eslabones ven la demanda real del cliente final (en lugar de solo los pedidos del eslabón siguiente), eliminan el ruido estadístico acumulado en cada nivel. El resultado es una cadena mucho más estable.

**¿Cómo interpreto la amplificación en el Bullwhip?**
Un valor de 3.5× en la fábrica significa que la varianza de sus pedidos es 3.5 veces mayor que la varianza de la demanda del cliente. Valores cercanos a 1× indican una cadena estable.

---

## Casos de Uso Típicos

### En educación
- Demostrar conceptos de microeconomía, finanzas e inventarios de forma visual
- Realizar experimentos "¿qué pasaría si...?" en tiempo real durante una clase
- Complementar lecturas de texto con simulaciones interactivas

### En consultoría y negocios
- **Dimensionamiento de personal:** usar Teoría de Colas para definir cuántos agentes de servicio al cliente necesitas para cumplir un SLA
- **Optimización de inventario:** usar EOQ y Punto de Reorden para definir políticas de reabasto
- **Análisis de cadena de suministro:** demostrar el efecto látigo y justificar inversiones en visibilidad de datos
- **Planeación financiera:** usar Interés Compuesto para ilustrar el valor del ahorro temprano

### En investigación operativa
- Comparar políticas de revisión continua vs. periódica bajo distintos escenarios de demanda
- Analizar la sensibilidad de los modelos ante cambios en parámetros clave
- Generar intuición antes de construir modelos más complejos

---

## Glosario de Términos

| Término | Definición |
|---------|------------|
| **λ (lambda)** | Tasa de llegada de clientes o demanda por unidad de tiempo |
| **μ (mu)** | Tasa de servicio — cuántos clientes atiende un servidor por unidad de tiempo |
| **ρ (rho)** | Utilización del sistema: λ / (c·μ). Debe ser < 1 para estabilidad |
| **EOQ** | Cantidad Económica de Pedido — cantidad que minimiza el costo total de inventario |
| **ROP** | Punto de Reorden — nivel de inventario en el que se debe lanzar un pedido |
| **SS** | Inventario de Seguridad — colchón para absorber variabilidad de la demanda |
| **Fill Rate** | Proporción de demanda satisfecha inmediatamente (sin backlog) |
| **Backlog** | Pedidos pendientes de entregar por falta de inventario |
| **Bullwhip** | Amplificación de la variabilidad de pedidos al subir por la cadena de suministro |
| **Lead Time** | Tiempo de entrega desde que se hace un pedido hasta que llega el material |
| **Base-stock** | Política de inventario que pide para mantener una posición de inventario objetivo |
| **EWMA** | Media móvil ponderada exponencialmente — método de pronóstico con factor α |
| **Erlang C** | Fórmula para calcular la probabilidad de esperar en un sistema M/M/c |
| **Ley de Little** | L = λ · W — relación universal entre inventario, tasa y tiempo |
