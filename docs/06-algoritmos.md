# Algoritmos — EconSim

## Algoritmo General de la Aplicación

```
ALGORITMO EconSim_Principal
ENTRADA: interacción del usuario
SALIDA: simulación económica interactiva en pantalla

INICIO
  // Inicialización
  tema ← localStorage.get('econsim.theme') ?? 'light'
  activa ← localStorage.get('econsim.active') ?? 'supply-demand'
  tab ← 'sim'
  
  APLICAR_TEMA(tema)
  RENDERIZAR_INTERFAZ(activa, tab)

  REPETIR (bucle de eventos React)
    ESPERAR evento de usuario
    
    SI evento = 'cambio_simulacion'(nueva_sim) ENTONCES
      activa ← nueva_sim
      localStorage.set('econsim.active', activa)
      tab ← 'sim'
      REMONTAR componente sim
    
    SI evento = 'cambio_tab'(nuevo_tab) ENTONCES
      tab ← nuevo_tab
      RERENDERIZAR contenido del tab
    
    SI evento = 'cambio_parametro'(param, valor) ENTONCES
      ACTUALIZAR estado param ← valor
      resultado ← EJECUTAR_MODELO(activa, todos_los_params)
      ACTUALIZAR KPIs con resultado
      ACTUALIZAR series para Chart con resultado
    
    SI evento = 'toggle_tema' ENTONCES
      tema ← SI tema = 'light' ENTONCES 'dark' SINO 'light'
      APLICAR_TEMA(tema)
      localStorage.set('econsim.theme', tema)
    
    SI evento = 'play_pause' ENTONCES
      CONTROLAR_ANIMACION()
  
  HASTA que el usuario cierre la página
FIN
```

## Algoritmo: Teoría de Colas M/M/c

```
ALGORITMO Cola_MMC
ENTRADA: lambda (llegadas/h), mu (servicio/h), c (servidores)
SALIDA: métricas del sistema de colas

INICIO
  rho ← lambda / (c * mu)        // utilización por servidor
  r   ← lambda / mu              // carga total
  
  SI rho >= 1 ENTONCES
    RETORNAR { stable: false, L: ∞, Wq: ∞, ... }
  FIN_SI

  // Erlang C: probabilidad de esperar (P_w)
  suma ← 0
  PARA n DESDE 0 HASTA c-1 HACER
    suma ← suma + (r^n / factorial(n))
  FIN_PARA
  
  termino_c ← (r^c / factorial(c)) * (1 / (1 - rho))
  P0 ← 1 / (suma + termino_c)    // prob. todos libres
  Pw ← termino_c * P0            // prob. de esperar (Erlang C)

  // Métricas de Little
  Lq ← Pw * rho / (1 - rho)     // clientes en cola
  L  ← Lq + r                   // clientes en sistema
  Wq ← Lq / lambda              // espera en cola (h)
  W  ← Wq + 1/mu                // tiempo en sistema (h)

  RETORNAR { rho, r, stable: true, L, Lq, W, Wq, P0, Pw, c }
FIN
```

## Algoritmo: Punto de Reorden con Demanda Aleatoria

```
ALGORITMO Punto_Reorden
ENTRADA: mu_d, sigma_d (demanda diaria), lead_days, service_level,
         order_qty, seed, horizon
SALIDA: inventario simulado, métricas de desempeño

INICIO
  // Calcular parámetros estadísticos
  z ← INVERSA_NORMAL_ESTANDAR(service_level)   // factor de seguridad
  sigma_DL ← sigma_d * RAIZ(lead_days)          // desv. estándar en lead time
  ss  ← z * sigma_DL                            // inventario de seguridad
  rop ← mu_d * lead_days + ss                   // punto de reorden

  // Inicializar simulación
  rng ← CREAR_RNG(seed)
  inv ← rop + order_qty                         // inventario inicial
  pendiente ← 0                                 // pedido en tránsito
  dias_llegada ← -1                             // cuándo llega el pedido
  stockouts ← 0
  unidades_cortas ← 0
  pedidos_realizados ← 0
  inventario_hist ← []

  // Simular día a día
  PARA dia DESDE 1 HASTA horizon HACER
    // Generar demanda aleatoria del día
    demanda_dia ← NORMAL(mu_d, sigma_d, rng)
    demanda_dia ← MAX(0, demanda_dia)
    
    // Recibir pedido si llegó hoy
    SI dias_llegada = dia ENTONCES
      inv ← inv + order_qty
      pendiente ← 0
    FIN_SI
    
    // Satisfacer demanda
    SI inv >= demanda_dia ENTONCES
      inv ← inv - demanda_dia
    SINO
      unidades_cortas ← unidades_cortas + (demanda_dia - inv)
      stockouts ← stockouts + 1
      inv ← 0
    FIN_SI
    
    // ¿Hay que pedir?
    pos_inv ← inv + pendiente                   // posición de inventario
    SI pos_inv <= rop Y pendiente = 0 ENTONCES
      pendiente ← order_qty
      dias_llegada ← dia + lead_days
      pedidos_realizados ← pedidos_realizados + 1
      REGISTRAR orden_en [dia, inv]
    FIN_SI
    
    REGISTRAR [dia, inv] en inventario_hist
  FIN_PARA

  fill_rate ← 1 - (unidades_cortas / (mu_d * horizon))
  RETORNAR { inv: inventario_hist, ss, rop, stockouts, fill_rate, pedidos_realizados }
FIN
```

## Algoritmo: Efecto Látigo (Bullwhip)

```
ALGORITMO Bullwhip
ENTRADA: weeks, demanda_inicial, salto_demanda, lead_time,
         alpha, factor_seguridad, compartir_info, ruido, seed
SALIDA: pedidos por eslabón, amplificación de variabilidad

INICIO
  rng ← CREAR_RNG(seed)
  etapas ← ['Minorista', 'Mayorista', 'Distribuidor', 'Fábrica']
  N ← 4

  // Inicializar estado de cada eslabón
  PARA i DESDE 0 HASTA N-1 HACER
    inv[i] ← demanda_inicial * (lead_time + 1)
    pronostico[i] ← demanda_inicial
    sigma[i] ← 0
    pipeline[i] ← ARREGLO(lead_time, demanda_inicial)
  FIN_PARA

  demanda_cliente_hist ← []
  pedidos_hist[N] ← ARREGLOS vacíos

  // Simular semana a semana
  PARA sem DESDE 0 HASTA weeks-1 HACER
    // Demanda del cliente
    SI sem < 6 ENTONCES
      demanda ← demanda_inicial
    SINO
      demanda ← demanda_inicial + salto_demanda
    FIN_SI
    demanda ← demanda + NORMAL(0, ruido, rng)
    demanda ← MAX(0, demanda)
    REGISTRAR demanda_cliente_hist[sem]

    // Cada eslabón actualiza sus pedidos
    PARA i DESDE 0 HASTA N-1 HACER
      // ¿Qué demanda ve este eslabón?
      SI compartir_info = true ENTONCES
        demanda_vista ← demanda        // ve la demanda real del cliente
      SINO
        SI i = 0 ENTONCES
          demanda_vista ← demanda      // minorista ve cliente
        SINO
          demanda_vista ← pedidos_hist[i-1][sem]  // ve pedidos del eslabón anterior
        FIN_SI
      FIN_SI

      // Actualizar pronóstico con EWMA
      pronostico[i] ← alpha * demanda_vista + (1 - alpha) * pronostico[i]
      sigma[i] ← RAIZ(alpha * (demanda_vista - pronostico[i])^2 +
                       (1 - alpha) * sigma[i]^2)

      // Recibir envío del pipeline
      recibido ← pipeline[i][0]
      ROTAR pipeline[i] (quitar primer elemento)

      // Actualizar inventario
      inv[i] ← inv[i] + recibido - demanda_vista
      inv[i] ← MAX(0, inv[i])

      // Calcular nivel meta (order-up-to)
      nivel_meta ← pronostico[i] * (lead_time + 1) +
                   factor_seguridad * sigma[i] * RAIZ(lead_time + 1)

      // Pedido = max(0, nivel_meta - posición_inventario)
      pos_inv ← inv[i] + SUMA(pipeline[i])
      pedido ← MAX(0, nivel_meta - pos_inv)
      AGREGAR pedido al final de pipeline[i]

      pedidos_hist[i][sem] ← pedido
    FIN_PARA
  FIN_PARA

  // Calcular amplificación (razón de varianzas)
  var_cliente ← VARIANZA(demanda_cliente_hist)
  PARA i DESDE 0 HASTA N-1 HACER
    amplificacion[i] ← VARIANZA(pedidos_hist[i]) / var_cliente
  FIN_PARA

  RETORNAR { pedidos_hist, amplificacion, demanda_cliente_hist }
FIN
```

## Algoritmo: Interés Compuesto

```
ALGORITMO Interes_Compuesto
ENTRADA: principal, tasa_anual, años, frecuencia,
         contribucion_periodica, inflacion
SALIDA: series de crecimiento, valor futuro

INICIO
  periodos_totales ← años * frecuencia
  tasa_periodo ← tasa_anual / frecuencia / 100
  tasa_inflacion_periodo ← inflacion / frecuencia / 100

  saldo ← principal
  saldo_simple ← principal
  contribuciones ← principal
  series_compound ← []
  series_simple ← []
  series_real ← []
  series_contrib ← []

  PARA periodo DESDE 0 HASTA periodos_totales HACER
    año_actual ← periodo / frecuencia

    // Interés compuesto
    SI periodo > 0 ENTONCES
      saldo ← saldo * (1 + tasa_periodo) + contribucion_periodica
      saldo_simple ← principal * (1 + tasa_anual/100 * año_actual) +
                     contribucion_periodica * periodo
      contribuciones ← contribuciones + contribucion_periodica
    FIN_SI

    // Solo registrar en puntos anuales
    SI periodo MOD frecuencia = 0 ENTONCES
      factor_inflacion ← (1 + inflacion/100)^año_actual
      saldo_real ← saldo / factor_inflacion

      REGISTRAR [año_actual, saldo] en series_compound
      REGISTRAR [año_actual, saldo_simple] en series_simple
      REGISTRAR [año_actual, saldo_real] en series_real
      REGISTRAR [año_actual, contribuciones] en series_contrib
    FIN_SI
  FIN_PARA

  interes_ganado ← saldo - contribuciones
  RETORNAR { series_compound, series_simple, series_real, series_contrib,
             fv: saldo, contrib_total: contribuciones, interes_ganado }
FIN
```

## Algoritmo: Generador de Números Aleatorios (RNG Semillado)

```
ALGORITMO makeRng
ENTRADA: semilla (entero de 32 bits)
SALIDA: función rng() → número uniforme [0, 1)
        función normal(media, desv) → número con distribución normal

INICIO
  estado ← semilla

  FUNCIÓN rng()
    // Mulberry32 — generador de periodo 2^32
    estado ← (estado + 0x6D2B79F5) AND 0xFFFFFFFF
    z ← estado XOR (estado >>> 15)
    z ← (z * (z XOR (z >>> 7))) AND 0xFFFFFFFF
    RETORNAR (z >>> 0) / 4294967296
  FIN_FUNCIÓN

  FUNCIÓN normal(media, desv)
    // Transformación de Box-Muller
    u1 ← rng()
    u2 ← rng()
    z0 ← RAIZ(-2 * LN(u1)) * COS(2π * u2)
    RETORNAR media + desv * z0
  FIN_FUNCIÓN

  RETORNAR { rng, normal }
FIN
```
