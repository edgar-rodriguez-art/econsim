/* ============================================================
   EconSim — Modelos (lógica económica/operativa pura)
   Funciones puras y deterministas. Sin React.
   El RNG es sembrable para reproducibilidad de escenarios.
   ============================================================ */

/* ---- RNG sembrable (mulberry32) + normal (Box–Muller) ---- */
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  const u = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const normal = (mean = 0, sd = 1) => { let a = 0, b = 0; while (a === 0) a = u(); while (b === 0) b = u(); return mean + sd * Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); };
  return { u, normal };
}

/* z-score para nivel de servicio (inversa normal estándar, Acklam) */
function zFromService(p) {
  p = Math.min(0.99999, Math.max(0.5, p));
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425;
  let q, r, x;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  return x;
}

/* ============================================================
   1) OFERTA Y DEMANDA  (curvas lineales, equilibrio, excedentes)
   P en eje Y, Q en eje X. Demanda: Qd = a - b·P. Oferta: Qs = c + d·P
   ============================================================ */
function supplyDemand(p) {
  const { a, b, c, d, demandShift = 0, supplyShift = 0, tax = 0 } = p;
  const A = a + demandShift;       // intercepto demanda (desplazado)
  const C = c - supplyShift;       // intercepto oferta (shift+ = más oferta)
  // Equilibrio sin impuesto: A - b·P = C + d·P  => P* = (A-C)/(b+d)
  const Pe = (A - C) / (b + d);
  const Qe = A - b * Pe;
  // Con impuesto t por unidad pagado por el productor: oferta sube. Pc precio consumidor, Pp = Pc - t
  // A - b·Pc = C + d·(Pc - t)  => Pc = (A - C + d·t)/(b+d)
  const Pc = (A - C + d * tax) / (b + d);
  const Pp = Pc - tax;
  const Qt = A - b * Pc;
  // precios de choke
  const pMaxD = A / b;             // precio donde Qd=0
  const pMinS = C < 0 ? -C / d : 0;// precio donde Qs=0 (si C<0)
  const pAxisMax = Math.max(pMaxD, Pe * 1.6, Pc * 1.4) * 1.05;
  const qAxisMax = Math.max(A, Qe * 1.6) * 1.05;
  // excedentes (triángulos) en equilibrio sin impuesto
  const cs = 0.5 * Qe * (pMaxD - Pe);
  const ps = 0.5 * Qe * (Pe - pMinS);
  // con impuesto
  const csT = 0.5 * Qt * (pMaxD - Pc);
  const psT = 0.5 * Qt * (Pp - pMinS);
  const govRev = tax * Qt;
  const dwl = 0.5 * tax * (Qe - Qt);
  // curvas como [Q,P] convertidas a [P,Q]→ devolvemos [Q,P] para graficar Q en X
  const demandCurve = []; const supplyCurve = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const P = (pAxisMax) * i / N;
    demandCurve.push([Math.max(0, A - b * P), P]);
    supplyCurve.push([Math.max(0, C + d * P), P]);
  }
  return { Pe, Qe, Pc, Pp, Qt, pMaxD, pMinS, pAxisMax, qAxisMax, cs, ps, csT, psT, govRev, dwl, demandCurve, supplyCurve, hasTax: tax > 0 };
}

/* ============================================================
   2) INTERÉS COMPUESTO  (aportes periódicos, simple vs compuesto, real)
   ============================================================ */
function compound(p) {
  const { principal, rate, years, freq = 12, contrib = 0, inflation = 0 } = p;
  const i = rate / 100 / freq;
  const N = years * freq;
  const series = [];          // por año
  const simpleSeries = [];
  let bal = principal, contribTotal = principal, simpleBal = principal;
  let lastYear = 0;
  series.push([0, principal]); simpleSeries.push([0, principal]);
  for (let k = 1; k <= N; k++) {
    bal = bal * (1 + i) + contrib;
    contribTotal += contrib;
    if (k % freq === 0) {
      const yr = k / freq;
      // interés simple: principal·(1+r·t) + aportes sin reinversión de su interés
      const simple = principal * (1 + (rate / 100) * yr) + contrib * freq * yr;
      simpleBal = simple;
      const real = bal / Math.pow(1 + inflation / 100, yr);
      series.push([yr, bal]);
      simpleSeries.push([yr, simpleBal]);
      lastYear = yr;
    }
  }
  const fv = bal;
  const interestEarned = fv - contribTotal;
  const realFv = fv / Math.pow(1 + inflation / 100, years);
  // serie de poder adquisitivo real
  const realSeries = series.map(([y, v]) => [y, v / Math.pow(1 + inflation / 100, y)]);
  // serie de aportes acumulados (línea base)
  const contribSeries = series.map(([y]) => [y, principal + contrib * freq * y]);
  return { series, simpleSeries, realSeries, contribSeries, fv, contribTotal, interestEarned, realFv, freq, N };
}

/* ============================================================
   3) EOQ — Cantidad económica de pedido
   ============================================================ */
function eoq(p) {
  const { demand, orderCost, holdCost, unitCost = 0, leadDays = 0 } = p;
  const Q = Math.sqrt((2 * demand * orderCost) / holdCost);
  const ordersPerYear = demand / Q;
  const cycleDays = 365 / ordersPerYear;
  const annualOrder = (demand / Q) * orderCost;
  const annualHold = (Q / 2) * holdCost;
  const totalInv = annualOrder + annualHold;     // costo relevante (sin compra)
  const totalAll = totalInv + unitCost * demand;
  const rop = (demand / 365) * leadDays;
  // curva de costos vs Q
  const curve = { order: [], hold: [], total: [] };
  const qMax = Q * 2.6;
  const M = 60;
  for (let k = 1; k <= M; k++) {
    const q = qMax * k / M;
    const oc = (demand / q) * orderCost;
    const hc = (q / 2) * holdCost;
    curve.order.push([q, oc]);
    curve.hold.push([q, hc]);
    curve.total.push([q, oc + hc]);
  }
  // diente de sierra (nivel de inventario en el tiempo)
  const saw = [];
  const cycles = 3;
  for (let c = 0; c < cycles; c++) { saw.push([c * cycleDays, Q]); saw.push([(c + 1) * cycleDays, 0]); }
  return { Q, ordersPerYear, cycleDays, annualOrder, annualHold, totalInv, totalAll, rop, curve, saw, qMax };
}

/* ============================================================
   4) PUNTO DE REORDEN con demanda variable + stock de seguridad
   ============================================================ */
function reorderPoint(p) {
  const { dailyMean, dailySd, leadDays, service, orderQty, seed = 7, horizon = 120 } = p;
  const z = zFromService(service / 100);
  const sigmaDL = dailySd * Math.sqrt(leadDays);
  const ss = z * sigmaDL;
  const rop = dailyMean * leadDays + ss;
  // simulación de inventario con demanda diaria N(media, sd) y reposición tras lead time
  const rng = makeRng(seed);
  const inv = []; const ordersAt = []; let stock = rop + orderQty; let pending = []; // {arriveDay, qty}
  let stockouts = 0, unitsShort = 0, sumInv = 0, ordersPlaced = 0;
  for (let day = 0; day < horizon; day++) {
    pending = pending.filter(o => { if (o.arrive === day) { stock += o.qty; return false; } return true; });
    const dmd = Math.max(0, rng.normal(dailyMean, dailySd));
    const served = Math.min(stock, dmd);
    if (dmd > stock) { stockouts++; unitsShort += (dmd - stock); }
    stock = Math.max(0, stock - dmd);
    sumInv += stock;
    inv.push([day, stock]);
    const onOrder = pending.reduce((s, o) => s + o.qty, 0);
    if (stock + onOrder <= rop && pending.length < 3) { pending.push({ arrive: day + leadDays, qty: orderQty }); ordersAt.push([day, stock]); ordersPlaced++; }
  }
  const fillRate = 100 * (1 - unitsShort / (dailyMean * horizon));
  return { z, ss, rop, sigmaDL, inv, ordersAt, stockoutDays: stockouts, fillRate, avgInv: sumInv / horizon, ordersPlaced, horizon };
}

/* ============================================================
   5) REVISIÓN CONTINUA (Q,R) vs PERIÓDICA (P,T)
   ============================================================ */
function reviewSystems(p) {
  const { dailyMean, dailySd, leadDays, service, reviewT, orderQty, seed = 11, horizon = 140 } = p;
  const z = zFromService(service / 100);
  // Continua (s,Q): ROP = dL + z·σ·√L
  const ssCont = z * dailySd * Math.sqrt(leadDays);
  const ropCont = dailyMean * leadDays + ssCont;
  // Periódica (R,S): revisa cada T, sube a S = d·(T+L) + z·σ·√(T+L)
  const ssPer = z * dailySd * Math.sqrt(reviewT + leadDays);
  const targetS = dailyMean * (reviewT + leadDays) + ssPer;
  const sim = (mode) => {
    const rng = makeRng(seed);
    const inv = []; let stock = (mode === 'cont' ? ropCont + orderQty : targetS);
    let pending = []; let stockouts = 0, short = 0, sumInv = 0, orders = 0;
    for (let day = 0; day < horizon; day++) {
      pending = pending.filter(o => { if (o.arrive === day) { stock += o.qty; return false; } return true; });
      const dmd = Math.max(0, rng.normal(dailyMean, dailySd));
      if (dmd > stock) { stockouts++; short += dmd - stock; }
      stock = Math.max(0, stock - dmd);
      sumInv += stock; inv.push([day, stock]);
      const onOrder = pending.reduce((s, o) => s + o.qty, 0);
      if (mode === 'cont') {
        if (stock + onOrder <= ropCont) { pending.push({ arrive: day + leadDays, qty: orderQty }); orders++; }
      } else {
        if (day % reviewT === 0) { const q = Math.max(0, targetS - stock - onOrder); if (q > 0.5) { pending.push({ arrive: day + leadDays, qty: q }); orders++; } }
      }
    }
    return { inv, stockoutDays: stockouts, avgInv: sumInv / horizon, orders, fillRate: 100 * (1 - short / (dailyMean * horizon)) };
  };
  return { z, ssCont, ropCont, ssPer, targetS, cont: sim('cont'), per: sim('per'), horizon };
}

/* ============================================================
   6) EFECTO LÁTIGO (bullwhip) — procesamiento de señal de demanda
   Modelo estándar (Lee, Padmanabhan & Whang / Chen et al.):
   cada eslabón pronostica con EWMA y usa base-stock order-up-to.
   El pedido amplifica el cambio de demanda en factor (1+(L+1)·α).
   ============================================================ */
function bullwhip(p) {
  const { weeks = 40, baseDemand = 100, demandStep = 20, stepWeek = 6, leadTime = 2, alpha = 0.3, safety = 1, shareInfo = false, seed = 3, noise = 6 } = p;
  const rng = makeRng(seed);
  const stages = ['Minorista', 'Mayorista', 'Distribuidor', 'Fábrica'];
  // demanda del cliente final: nivel base + escalón en stepWeek + ruido
  const customer = [];
  for (let w = 0; w < weeks; w++) {
    const lvl = baseDemand + (w >= stepWeek ? demandStep : 0);
    customer.push(Math.max(0, lvl + rng.normal(0, noise)));
  }
  // estado de pronóstico por eslabón (EWMA) y nivel base-stock previo
  const forecast = stages.map(() => baseDemand);
  const prevS = stages.map(() => baseDemand * (leadTime + 1));
  const orders = stages.map(() => []);
  for (let w = 0; w < weeks; w++) {
    let downstreamDemand = customer[w];   // demanda que recibe el eslabón de abajo
    for (let s = 0; s < stages.length; s++) {
      const obs = shareInfo ? customer[w] : downstreamDemand;
      // EWMA: pronóstico de la demanda observada
      forecast[s] = alpha * obs + (1 - alpha) * forecast[s];
      // nivel base-stock objetivo: cubre L+1 periodos + colchón de seguridad
      const sigma = (noise + 2) * safety;
      const S = forecast[s] * (leadTime + 1) + safety * sigma * Math.sqrt(leadTime + 1);
      // pedido = reponer lo que se fue + ajuste del nivel base-stock (amplifica el cambio)
      let order = obs + (S - prevS[s]);
      prevS[s] = S;
      order = Math.max(0, order);
      orders[s].push(order);
      downstreamDemand = order;           // este pedido es la demanda del eslabón de arriba
    }
  }
  // medida de amplificación = razón de varianzas (estándar en la literatura)
  const variance = (arr) => { const m = arr.reduce((a, b) => a + b, 0) / arr.length; return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length; };
  const custVar = Math.max(1e-6, variance(customer));
  const amp = orders.map(o => variance(o) / custVar);
  const series = {
    customer: customer.map((v, w) => [w, v]),
    stages: orders.map(o => o.map((v, w) => [w, v]))
  };
  return { stages, series, amplification: amp, weeks };
}

/* ============================================================
   7) BEER GAME simplificado — 4 etapas, retrasos de envío/pedido
   ============================================================ */
function beerGame(p) {
  const { weeks = 36, initDemand = 4, stepDemand = 8, stepWeek = 5, policy = 'basestock', baseStock = 12, holdCost = 0.5, backCost = 1, seed = 9, noise = 0 } = p;
  const rng = makeRng(seed);
  const names = ['Minorista', 'Mayorista', 'Distribuidor', 'Fábrica'];
  const n = 4;
  // estado por etapa
  const inv = Array(n).fill(12);
  const back = Array(n).fill(0);
  const shipDelay = Array.from({ length: n }, () => [4, 4]);   // 2 semanas en tránsito
  const orderDelay = Array.from({ length: n }, () => [4, 4]);  // 2 semanas para que el pedido llegue arriba
  const hist = { inv: names.map(() => []), back: names.map(() => []), order: names.map(() => []), cost: names.map(() => []) };
  let custDemand;
  const customerSeries = [];
  for (let w = 0; w < weeks; w++) {
    custDemand = (w >= stepWeek ? stepDemand : initDemand) + (noise ? Math.round(rng.normal(0, noise)) : 0);
    custDemand = Math.max(0, custDemand);
    customerSeries.push([w, custDemand]);
    // demanda entrante a cada etapa = pedido que llega desde abajo (con retraso)
    let incoming = custDemand;
    const incomingOrders = [incoming];
    for (let s = 1; s < n; s++) incomingOrders.push(orderDelay[s - 1].shift() ?? initDemand);
    for (let s = 0; s < n; s++) {
      // recibir envío desde arriba
      const received = shipDelay[s].shift() ?? initDemand;
      inv[s] += received;
      // demanda a servir = pedido entrante + backlog
      const demandIn = incomingOrders[s] + back[s];
      const ship = Math.min(inv[s], demandIn);
      inv[s] -= ship;
      back[s] = demandIn - ship;
      // enviar aguas abajo (con retraso de envío)
      if (s === 0) { /* al cliente */ } else { shipDelay[s - 1].push(ship); }
      // política de pedido
      let order;
      if (policy === 'basestock') {
        const pipeline = shipDelay[s].reduce((a, b) => a + b, 0) + (s < n - 1 ? orderDelay[s].reduce((a, b) => a + b, 0) : 0);
        order = Math.max(0, baseStock + back[s] - inv[s] - pipeline + incomingOrders[s]);
      } else { // 'naive' = pedir lo que te piden
        order = incomingOrders[s];
      }
      // colocar pedido aguas arriba (con retraso de pedido)
      if (s < n - 1) orderDelay[s].push(order); else shipDelay[s].push(order); // fábrica produce
      const cost = inv[s] * holdCost + back[s] * backCost;
      hist.inv[s].push([w, inv[s]]);
      hist.back[s].push([w, -back[s]]);
      hist.order[s].push([w, order]);
      hist.cost[s].push([w, cost]);
    }
  }
  const totalCost = names.map((_, s) => hist.cost[s].reduce((a, [, c]) => a + c, 0));
  const grandTotal = totalCost.reduce((a, b) => a + b, 0);
  return { names, hist, customerSeries, totalCost, grandTotal, weeks };
}

/* ============================================================
   8) TEORÍA DE COLAS — M/M/1 y M/M/c (Erlang C), cuellos de botella
   ============================================================ */
function factorial(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
function queue(p) {
  const { lambda, mu, servers = 1 } = p;
  const c = Math.max(1, Math.round(servers));
  const rho = lambda / (c * mu);          // utilización
  const r = lambda / mu;                  // intensidad de tráfico (offered load)
  let res = { rho, r, stable: rho < 1, c };
  if (rho >= 1) {
    return { ...res, L: Infinity, Lq: Infinity, W: Infinity, Wq: Infinity, P0: 0, Pwait: 1, curve: queueCurve(p) };
  }
  if (c === 1) {
    const L = rho / (1 - rho);
    const Lq = (rho * rho) / (1 - rho);
    const W = 1 / (mu - lambda);
    const Wq = lambda / (mu * (mu - lambda));
    return { ...res, L, Lq, W, Wq, P0: 1 - rho, Pwait: rho, curve: queueCurve(p) };
  }
  // M/M/c Erlang C
  let sum = 0;
  for (let k = 0; k < c; k++) sum += Math.pow(r, k) / factorial(k);
  const last = (Math.pow(r, c) / factorial(c)) * (1 / (1 - rho));
  const P0 = 1 / (sum + last);
  const Pwait = last * P0;                // prob. de esperar (Erlang C)
  const Lq = Pwait * rho / (1 - rho);
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;
  return { ...res, L, Lq, W, Wq, P0, Pwait, curve: queueCurve(p) };
}
function queueCurve(p) {
  // Wq vs utilización (variando λ) para mostrar la explosión no lineal
  const { mu, servers = 1 } = p; const c = Math.max(1, Math.round(servers));
  const pts = { L: [], Wq: [] };
  for (let i = 1; i <= 49; i++) {
    const rho = i / 50;                   // 0.02 .. 0.98
    const lam = rho * c * mu;
    const q = queuePoint(lam, mu, c);
    pts.L.push([rho, q.L]);
    pts.Wq.push([rho, q.Wq]);
  }
  return pts;
}
function queuePoint(lambda, mu, c) {
  const rho = lambda / (c * mu); const r = lambda / mu;
  if (rho >= 1) return { L: 20, Wq: 999 };
  if (c === 1) return { L: rho / (1 - rho), Wq: lambda / (mu * (mu - lambda)) };
  let sum = 0; for (let k = 0; k < c; k++) sum += Math.pow(r, k) / factorial(k);
  const last = (Math.pow(r, c) / factorial(c)) * (1 / (1 - rho));
  const P0 = 1 / (sum + last); const Pwait = last * P0;
  const Lq = Pwait * rho / (1 - rho); const Wq = Lq / lambda; const W = Wq + 1 / mu;
  return { L: lambda * W, Wq };
}

Object.assign(window, { makeRng, zFromService, supplyDemand, compound, eoq, reorderPoint, reviewSystems, bullwhip, beerGame, queue });
