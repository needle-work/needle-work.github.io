
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const AXIS = '#9a9ea6';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const txt = (parent, x, y, s, attrs) => {
    const t = el('text', Object.assign({ x, y }, attrs || {}), parent);
    t.textContent = s;
    return t;
  };

  const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'nor', 'of', 'in', 'on', 'at', 'by', 'for', 'to', 'vs', 'via', 'as', 'per']);
  const tc = (str) => String(str).split(/(\s+)/).map((w, i, arr) => {
    const lead = i === 0 || /·$/.test((arr[i - 2] || '').trim());
    return (!lead && SMALL.has(w)) ? w : w.replace(/^([(\/]?)([a-z])/, (m, a, b) => a + b.toUpperCase());
  }).join('').replace('(Cm)', '(cm)').replace('(S)', '(s)');
  const nice = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]; return steps.find(s => m <= s) * p; };

  function axes(svg, box, xr, yr, opts) {
    const f = (opts && opts.font) || 1;
    const g = el('g', { class: 'axis' }, svg);
    const [x0, y0, x1, y1] = box;
    el('line', { x1: x0, y1: y1, x2: x1, y2: y1, stroke: AXIS, 'stroke-width': 1 }, g);
    el('line', { x1: x0, y1: y0, x2: x0, y2: y1, stroke: AXIS, 'stroke-width': 1 }, g);
    const ystep = opts && opts.ystep ? opts.ystep : nice((yr[1] - yr[0]) / 4);
    for (let v = yr[0]; v <= yr[1] + 1e-9; v += ystep) {
      const y = y1 - (v - yr[0]) / (yr[1] - yr[0]) * (y1 - y0);
      el('line', { x1: x0 - 4, y1: y, x2: x0, y2: y, stroke: AXIS }, g);
      txt(g, x0 - 8, y + 4, opts && opts.yfmt ? opts.yfmt(v) : String(Math.round(v)), { 'text-anchor': 'end', 'font-size': 13 * f });
    }
    if (opts && opts.xticks) {
      for (const v of opts.xticks) {
        const x = x0 + (v - xr[0]) / (xr[1] - xr[0]) * (x1 - x0);
        el('line', { x1: x, y1: y1, x2: x, y2: y1 + 4, stroke: AXIS }, g);
        txt(g, x, y1 + 18, String(v), { 'text-anchor': 'middle', 'font-size': 13 * f });
      }
    }
    if (opts && opts.xlabel) txt(g, (x0 + x1) / 2, y1 + 38, tc(opts.xlabel), { 'text-anchor': 'middle', 'font-size': 13 * f });
    if (opts && opts.ylabel) {
      const t = txt(g, 0, 0, tc(opts.ylabel), { 'text-anchor': 'middle', 'font-size': 13 * f });
      t.setAttribute('transform', `translate(${x0 - 30 - 14 * f},${(y0 + y1) / 2}) rotate(-90)`);
    }
    return g;
  }

  function errorBar(svg, cx, y0, y1) {
    el('line', { x1: cx, y1: y0, x2: cx, y2: y1, stroke: '#31353d', 'stroke-width': 1.2 }, svg);
    el('line', { x1: cx - 4, y1: y0, x2: cx + 4, y2: y0, stroke: '#31353d', 'stroke-width': 1.2 }, svg);
    el('line', { x1: cx - 4, y1: y1, x2: cx + 4, y2: y1, stroke: '#31353d', 'stroke-width': 1.2 }, svg);
  }


  function groupedBars(container, groups, opts) {
    const W = opts.width || 520, H = opts.height || 260;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const f0 = opts.font || 1;
    const top = opts.title ? 34 * f0 : 22;
    const box = [44 + 10 * f0, top, W - 12, H - 30 - 16 * f0 - (opts.groupLabelDrop || 0)];
    if (opts.title) txt(svg, (box[0] + box[2]) / 2, 16 * f0, tc(opts.title), { 'text-anchor': 'middle', 'font-size': 15 * f0 });
    let ymax = 0;
    groups.forEach(gp => gp.bars.forEach(b => { ymax = Math.max(ymax, b.value + (b.sem || 0)); }));
    const ymin = opts.ymin != null ? opts.ymin : 0;
    ymax = opts.ymax != null ? opts.ymax : nice(ymax * 1.12 - ymin) + ymin;
    const f = opts.font || 1;
    axes(svg, box, [0, 1], [ymin, ymax], { ylabel: opts.ylabel, yfmt: opts.yfmt, font: f, ystep: opts.ystep });
    if (ymin > 0 && opts.axisBreak) { const bx = box[0], by = box[3] - 10; el('rect', { x: bx - 6, y: by - 5, width: 12, height: 8, fill: '#fff' }, svg); el('line', { x1: bx - 5, y1: by + 4, x2: bx + 5, y2: by - 4, stroke: AXIS, 'stroke-width': 1.5 }, svg); el('line', { x1: bx - 5, y1: by + 1, x2: bx + 5, y2: by - 7, stroke: AXIS, 'stroke-width': 1.5 }, svg); }
    const gw = (box[2] - box[0]) / groups.length;
    const yOf = v => box[3] - (Math.max(v, ymin) - ymin) / (ymax - ymin) * (box[3] - box[1]);
    groups.forEach((gp, gi) => {
      const n = gp.bars.length, pad = gw * (opts.groupPad != null ? opts.groupPad : 0.12), bw = (gw - 2 * pad) / n;
      const frac = opts.barFrac || 1;                       // < 1 draws thinner bars centered in their slot
      gp.bars.forEach((b, bi) => {
        const slotX = box[0] + gi * gw + pad + bi * bw;
        const wBar = (bw - 3) * frac;
        const x = slotX + 1.5 + (bw - 3 - wBar) / 2;
        const y = yOf(b.value);
        const r = el('rect', { x, y, width: wBar, height: Math.max(0, yOf(ymin) - y), fill: b.color, stroke: b.edge || b.color, 'stroke-width': 1.5, class: 'bar' }, svg);
        r.dataset.name = b.name || '';
        if (b.task) r.dataset.task = b.task;
        const cx = x + wBar / 2;
        if (b.dots) {
          const seed = (i) => ((Math.sin(i * 12.9898 + gi * 78.233 + bi * 37.719) * 43758.5453) % 1 + 1) % 1;
          b.dots.forEach((v, i) => {
            const jx = (seed(i) - 0.5) * wBar * 0.8;
            const ok = !b.dotFail || !b.dotFail[i];
            el('circle', { cx: cx + jx, cy: yOf(Math.min(v, ymax)), r: 2.6, fill: ok ? b.edge : '#fff', stroke: b.edge, 'stroke-width': 1, opacity: ok ? 0.55 : 0.9, 'pointer-events': 'none' }, svg);
          });
        }
        if (opts.onHover && !(opts.hideZero && b.value === 0)) {
          r.classList.add('hoverable');
          r.setAttribute('tabindex', '0');
          r.setAttribute('aria-label', b.aria || `${b.label}: ${b.value}`);
          r.addEventListener('mouseenter', () => opts.onHover(b, gp, r));
          r.addEventListener('focus', () => opts.onHover(b, gp, r));
          r.addEventListener('click', () => opts.onHover(b, gp, r, true));
          r.addEventListener('mouseleave', () => opts.onLeave && opts.onLeave(b, gp, r));
          r.addEventListener('blur', () => opts.onLeave && opts.onLeave(b, gp, r));
        }
        if (b.sem) errorBar(svg, cx, yOf(b.value - b.sem), yOf(b.value + b.sem));
        if (opts.values !== false && !(opts.hideZero && b.value === 0)) txt(svg, cx, yOf(b.value + (b.sem || 0)) - 6, opts.fmt ? opts.fmt(b.value) : String(Math.round(b.value)), Object.assign({ 'text-anchor': 'middle', 'font-size': 13 * f }, b.dots ? { stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'font-weight': 700 } : {}));
        if (b.label) txt(svg, cx, box[3] + 16 + 6 * f, b.label, { 'text-anchor': 'middle', 'font-size': 13 * f });
        if (b.inside) { const tall = (yOf(ymin) - y) > 30 * f; txt(svg, cx, tall ? y + 12 + 14 * f : yOf(b.value + (b.sem || 0)) - 8 - 16 * f, b.inside, { 'text-anchor': 'middle', 'font-size': 13 * f, fill: b.edge }); }
        if (opts.onClick) {
          r.setAttribute('tabindex', '0');
          r.setAttribute('role', 'button');
          r.setAttribute('aria-label', `${b.label}: ${b.value}%. View all trials.`);
          r.addEventListener('click', () => opts.onClick(b, gp));
          r.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              opts.onClick(b, gp);
            }
          });
        }
      });
      if (gp.label) txt(svg, box[0] + gi * gw + gw / 2, box[3] + 18 + (opts.groupLabelDrop || 0), tc(gp.label), { 'text-anchor': 'middle', 'font-size': 13 * f });
      if (opts.refLine && opts.refLine[gi] != null) {
        const y = yOf(opts.refLine[gi]);
        el('line', { x1: box[0] + gi * gw + 4, y1: y, x2: box[0] + (gi + 1) * gw - 4, y2: y, stroke: opts.refColor || '#356fb0', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      }
    });
    return svg;
  }


  function hbarPanels(container, spec, opts) {
    const W = opts.width || 1040, rowH = opts.rowH || 26, labelW = opts.labelW || 230, gap = 34, glyphW = opts.glyphW || 0;
    const n = spec.labels.length, H = n * rowH + 60;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const top = 26, bottom = H - 34;
    const pw = (W - labelW - glyphW - gap * spec.panels.length) / spec.panels.length;
    spec.labels.forEach((r, i) => {
      const y = top + i * rowH, cy = y + (rowH - 8) / 2;
      txt(svg, labelW - 10, cy + 4, tc(r.label), { 'text-anchor': 'end', 'font-size': 13, fill: r.emph ? '#31353d' : '#5c616a' });
      if (r.glyph) drawGlyph(svg, labelW + 14, y - 4, glyphW - 28, rowH - 4, r.glyph);
      if (r.separatorAfter) el('line', { x1: 10, y1: y + rowH - 4, x2: W - 10, y2: y + rowH - 4, stroke: '#d5d7db' }, svg);
    });
    spec.panels.forEach((pnl, pi) => {
      const x0 = labelW + glyphW + pi * (pw + gap), x1 = x0 + pw - 30;
      const xmax = pnl.xmax || 100, xstep = pnl.xstep || 25;  // per-task axis maximum (same as the paper's figures)
      const X = v => x0 + v / xmax * (x1 - x0);
      txt(svg, (x0 + x1) / 2, 14, tc(pnl.title), { 'text-anchor': 'middle', 'font-size': 18 });
      el('line', { x1: x0, y1: bottom, x2: x1, y2: bottom, stroke: AXIS }, svg);
      const g = el('g', { class: 'axis' }, svg);
      Array.from({ length: Math.round(xmax / xstep) + 1 }, (_, k) => k * xstep).forEach(v => { el('line', { x1: X(v), y1: bottom, x2: X(v), y2: bottom + 4, stroke: AXIS }, g); txt(g, X(v), bottom + 16, String(v), { 'text-anchor': 'middle', 'font-size': 13 }); });
      txt(g, (x0 + x1) / 2, bottom + 30, 'Success Rate (%)', { 'text-anchor': 'middle', 'font-size': 13 });
      pnl.rows.forEach((r, i) => {
        const y = top + i * rowH, h = rowH - 8, cy = y + h / 2;
        if (r.missing) { txt(svg, X(2), cy + 4, 'Not Evaluated', { 'font-size': 13, fill: '#9a9ea6', 'font-style': 'italic' }); return; }
        el('rect', { x: x0, y, width: X(r.value) - x0, height: h, fill: r.color, stroke: r.edge || r.color, 'stroke-width': 1.3 }, svg);
        if (r.sem) { el('line', { x1: X(r.value - r.sem), y1: cy, x2: X(r.value + r.sem), y2: cy, stroke: '#31353d', 'stroke-width': 1.1 }, svg); [r.value - r.sem, r.value + r.sem].forEach(v => el('line', { x1: X(v), y1: cy - 3, x2: X(v), y2: cy + 3, stroke: '#31353d', 'stroke-width': 1.1 }, svg)); }
        txt(svg, X(r.value + (r.sem || 0)) + 5, cy + 4, r.value.toFixed(1), { 'font-size': 13, fill: '#5c616a' });
      });
    });
    return svg;
  }



  const G = { cyan: ['#b9ebf3', '#008f9d'], green: ['#99bf9e', '#00682c'], blue: ['#99accf', '#00528e'], pink: ['#f4cbe8', '#ab5b98'], grey: ['#ffffff', '#9a9ea6'], amber: '#c9780f', red: '#b83c41' };
  function drawGlyph(svg, x, y, w, h, kind) {
    const X0 = x + 34;                                  // column origin, 34px gutter for lane tags
    const P = 22, CW = 20, CH = 12;                     // main lane
    const DP = 15, DCW = 12, DCH = 11;                  // detour lane
    const OS = 7, DOS = 6;                              // observation squares
    const Y_OBS = y + 0, Y_MAIN = y + 9, Y_DOBS = y + 24, Y_DET = y + 32;
    const CX = i => X0 + i * P;
    const DX = j => X0 + 66 + j * DP;
    const D = (el_, a) => { el_.setAttribute('fill-opacity', a); return el_; };

    const t = (tx, ty, s, attrs) => txt(svg, tx, ty, s, Object.assign({ 'font-size': 8 }, attrs));
    const cellMain = (i, k, opts) => {
      const cx = CX(i), cy = Y_MAIN;
      const r = el('rect', { x: cx, y: cy, width: CW, height: CH, rx: 2,
        fill: G[k][0], stroke: (opts && opts.stroke) || G[k][1],
        'stroke-width': (opts && opts.sw) || 1 }, svg);
      if (k === 'grey' && !(opts && opts.noHatch))
        el('line', { x1: cx + 2, y1: cy + CH - 2, x2: cx + CW - 2, y2: cy + 2,
          stroke: '#9a9ea6', 'stroke-width': 1 }, svg);
      return r;
    };
    const cellDet = (j) => el('rect', { x: DX(j), y: Y_DET, width: DCW, height: DCH, rx: 2,
      fill: G.blue[0], stroke: G.blue[1], 'stroke-width': 1 }, svg);
    const obsMain = (i, src) => el('rect', {
      x: CX(i) + (src ? 6 : 6), y: Y_OBS, width: src ? 8 : OS, height: src ? 8 : OS, rx: 1,
      fill: src ? G.cyan[1] : '#ffffff', stroke: G.cyan[1],
      'stroke-width': src ? 1.6 : 1 }, svg);
    const obsDet = (j) => el('rect', { x: DX(j) + 3, y: Y_DOBS, width: DOS, height: DOS, rx: 1,
      fill: '#ffffff', stroke: G.cyan[1], 'stroke-width': 1 }, svg);
    const cross = (cx, cy, a) => {
      el('line', { x1: cx - a, y1: cy - a, x2: cx + a, y2: cy + a, stroke: G.red,
        'stroke-width': 1.4, 'stroke-linecap': 'round' }, svg);
      el('line', { x1: cx - a, y1: cy + a, x2: cx + a, y2: cy - a, stroke: G.red,
        'stroke-width': 1.4, 'stroke-linecap': 'round' }, svg);
    };
    const tri = (cx, ty, col) => el('polygon', {
      points: `${cx - 4},${ty} ${cx + 4},${ty} ${cx},${ty + 5}`, fill: col }, svg);


    t(x + 30, y + 19, 'bridge', { 'text-anchor': 'end', fill: '#5c616a' });
    t(x + 30, y + 41, 'original', { 'text-anchor': 'end', fill: '#5c616a' });

    for (let i = 0; i < 3; i++) { cellMain(i, 'cyan'); obsMain(i, false); }
    const srcObs = obsMain(3, true);
    for (let i = 3; i < 7; i++) cellMain(i, 'green');
    const tail = [];
    for (let i = 7; i < 10; i++) tail.push(i);

    // tail cells (columns 7-9) differ by row
    if (kind === 'concat_suffix') tail.forEach(i => cellMain(i, 'pink'));
    else tail.forEach(i => cellMain(i, 'grey'));

    // training-example bracket + anchor dot
    const bRight = kind === 'concat_suffix' ? CX(9) + CW + 3
                 : CX(6) + CW + 3;
    el('circle', { cx: CX(1) + 9.5, cy: y + 3.5, r: 2, fill: G.amber }, svg);
    el('rect', { x: CX(1) - 3, y: y + 7, width: bRight - (CX(1) - 3), height: 16, rx: 3,
      fill: 'none', stroke: G.amber, 'stroke-width': 1.4 }, svg);

    // fork: source observation -> detour lane
    const forkCut = kind === 'twin_off';
    const forkCol = forkCut ? G.red : G.amber;
    const forkPts = `${X0 + 75},${y + 7} ${X0 + 63},${y + 7} ${X0 + 63},${y + 38} ${X0 + 66},${y + 38}`;
    const mkFork = (dx, sw) => {
      const p = el('polyline', { points: forkPts, fill: 'none', stroke: forkCol,
        'stroke-width': sw, 'stroke-linejoin': 'round' }, svg);
      if (forkCut) p.setAttribute('stroke-dasharray', '3 2');
      if (dx) p.setAttribute('transform', `translate(${dx},0)`);
      el('polygon', { points: `${X0 + 66 + (dx || 0)},${y + 35} ${X0 + 66 + (dx || 0)},${y + 41} ${X0 + 71 + (dx || 0)},${y + 38}`,
        fill: forkCol }, svg);
    };
    mkFork(0, kind === 'twin_full' ? 1.6 : 1.4);
    if (kind === 'twin_full') { mkFork(3, 1.6); srcObs.setAttribute('stroke-width', 2.2); }

    // detour lane + its observation squares
    const detCells = [], detObs = [];
    for (let j = 0; j < 6; j++) detCells.push(cellDet(j));
    for (let j = 1; j < 6; j++) detObs.push(obsDet(j));

    // rejoin
    const joint = el('line', { x1: CX(7) - 3, y1: y + 5, x2: CX(7) - 3,
      y2: kind === 'concat_suffix' ? y + 27 : y + 25,
      stroke: kind === 'concat_suffix' ? G.red : G.amber,
      'stroke-width': kind === 'concat_suffix' ? 1.4 : 1.2 }, svg);
    if (kind === 'concat_suffix') joint.setAttribute('stroke-dasharray', '2 2');
    el('polyline', { points: `${X0 + 153},${y + 37} ${X0 + 158},${y + 37} ${X0 + 158},${y + 23} ${X0 + 152},${y + 23}`,
      fill: 'none', stroke: G.amber, 'stroke-width': 1.2 }, svg);
    el('polygon', { points: `${X0 + 155},${y + 20} ${X0 + 155},${y + 26} ${X0 + 150},${y + 23}`,
      fill: G.amber }, svg);


    if (kind === 'twin_off') {
      cross(X0 + 63, y + 29, 4);
      D(detCells[0], 0.25);
      el('line', { x1: DX(0) + 1, y1: y + 42, x2: DX(0) + 11, y2: y + 33,
        stroke: G.red, 'stroke-width': 1.4 }, svg);
      t(X0 + 60, y + 30, 'at source', { 'text-anchor': 'end', fill: G.red });
    } else if (kind === 'no_bypass') {
      detObs.forEach((r, k) => { r.setAttribute('stroke', G.red); r.setAttribute('stroke-width', 1.2);
        cross(DX(k + 1) + 6, Y_DOBS + 3, 3); });
      for (let j = 1; j < 6; j++) D(detCells[j], 0.25);
      t(X0 + 60, y + 30, 'along detour', { 'text-anchor': 'end', fill: G.red });
    } else if (kind === 'concat_suffix') {
      t(X0 + 160, y + 30, 'assumed exact', { fill: G.red });
    }


    if (kind === 'twin_off') t(X0 + 164, y + 41, '×0', { fill: G.red });
    else if (kind === 'twin_full') t(X0 + 164, y + 41, '×1', { 'font-size': 9, 'font-weight': 'bold', fill: G.amber });
    else t(X0 + 164, y + 41, '×½', { fill: '#5c616a' });
  }


  function lines(container, series, opts) {
    const W = opts.width || 360, H = opts.height || 240, f = opts.font || 1;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const box = [50, opts.title ? 28 * f : 16, W - 12, H - 46];
    if (opts.title) txt(svg, (box[0] + box[2]) / 2, 16 * f, tc(opts.title), { 'text-anchor': 'middle', 'font-size': 15 * f });
    const xmax = opts.xmax || Math.max(...series.map(s => s.x[s.x.length - 1]));
    let ymax = 0;
    series.forEach(s => s.y.forEach((v, i) => { ymax = Math.max(ymax, v + (s.sem ? s.sem[i] : 0)); }));
    ymax = opts.ymax || nice(ymax * 1.15);
    const xt = [];
    const xs = nice(xmax / 4);
    for (let v = 0; v <= xmax; v += xs) xt.push(v);
    axes(svg, box, [0, xmax], [0, ymax], { xticks: xt, xlabel: opts.xlabel, ylabel: opts.ylabel, yfmt: ymax <= 1 ? (v => v.toFixed(2)) : undefined, font: f });
    const X = v => box[0] + v / xmax * (box[2] - box[0]);
    const Y = v => box[3] - v / ymax * (box[3] - box[1]);
    series.forEach(s => {
      if (s.sem) {
        const up = s.x.map((x, i) => `${X(x)},${Y(s.y[i] + s.sem[i])}`);
        const lo = s.x.map((x, i) => `${X(x)},${Y(Math.max(0, s.y[i] - s.sem[i]))}`).reverse();
        el('polygon', { points: up.concat(lo).join(' '), fill: s.color, opacity: 0.16 }, svg);
      }
      el('polyline', { points: s.x.map((x, i) => `${X(x)},${Y(s.y[i])}`).join(' '), fill: 'none', stroke: s.color, 'stroke-width': s.width || 2.2, 'stroke-linejoin': 'round' }, svg);
    });
    return svg;
  }


  function completionCurves(container, series, opts) {
    const W = opts.width || 520, H = opts.height || 330, f = opts.font || 1;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const box = [40 + 34 * f, opts.title ? 34 * f : 22, W - (opts.rightPad || 14), H - 46 - 6 * f];
    if (opts.title) txt(svg, (box[0] + box[2]) / 2, 16 * f, tc(opts.title), { 'text-anchor': 'middle', 'font-size': 15 * f });
    const xmax = opts.xmax, xs = opts.xstep || nice(xmax / 5);
    const xt = []; for (let v = 0; v <= xmax + 1e-9; v += xs) xt.push(v);
    axes(svg, box, [0, xmax], [0, 100], { xticks: xt, xlabel: opts.xlabel, ylabel: opts.ylabel, ystep: 25, yfmt: v => v + '%', font: f });
    const X = v => box[0] + Math.min(v, xmax) / xmax * (box[2] - box[0]);
    const Y = v => box[3] - v / 100 * (box[3] - box[1]);
    const finals = [];
    series.forEach(s => {
      let pts;
      if (s.x) {                                  // precomputed smooth curve (the paper's monotone fit), clipped at xmax
        pts = s.x.map((x, i) => [x, s.y[i]]).filter(([x]) => x <= xmax + 1e-9).map(([x, y]) => `${X(x)},${Y(y)}`);
      } else {                                    // raw step function
        const done = s.times.filter(t => t != null).sort((a, b) => a - b), n = s.times.length;
        pts = [`${X(0)},${Y(0)}`];
        done.forEach((t, i) => { pts.push(`${X(t)},${Y(100 * i / n)}`); pts.push(`${X(t)},${Y(100 * (i + 1) / n)}`); });
        pts.push(`${X(xmax)},${Y(100 * done.length / n)}`);
      }
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: s.color, 'stroke-width': s.width || 2.4, 'stroke-linejoin': 'round' }, svg);
      if (s.final != null) finals.push({ v: s.final, color: s.color });
    });
    finals.sort((a, b) => a.v - b.v);                 // final success rate beside each curve, pushed apart if close
    let lastY = 1e9;
    finals.forEach(e => { let y = Y(e.v) + 4.5 * f; if (lastY - y < 14 * f) y = lastY - 14 * f; lastY = y;
      txt(svg, box[2] + 5 * f, y, `${Math.round(e.v)}%`, { 'font-size': 13 * f, style: `fill:${e.color}` }); });
    return svg;
  }


  function stackedHBars(container, groups, opts) {
    const W = opts.width || 520, f = opts.font || 1, rowH = (opts.rowH || 26) * f, headH = 44 * f, gap = 14 * f;
    const labelW = opts.labelW || 70 * f, x0 = labelW, x1 = W - 40 * f, xmax = opts.xmax;
    const H = groups.reduce((h, g) => h + headH + g.rows.length * rowH + gap, 0) + 34 * f;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const X = v => x0 + v / xmax * (x1 - x0);
    let y = 4;
    groups.forEach(g => {
      txt(svg, x0, y + 14 * f, g.title, { 'font-size': 14 * f, 'font-weight': 700 });
      let lx = x0, ly = y + 24 * f;
      g.legend.forEach(it => {
        const t = txt(svg, 0, 0, it.label, { 'font-size': 12 * f, fill: '#31353d' });
        const tw = t.getComputedTextLength() || it.label.length * 6.5 * f;     // measured once the SVG is in the page
        if (lx + 15 * f + tw > W - 4 && lx > x0) { lx = x0; ly += 17 * f; y += 17 * f; }   // wrap
        el('rect', { x: lx, y: ly, width: 11 * f, height: 11 * f, fill: it.color, rx: 1.5 }, svg);
        t.setAttribute('x', lx + 15 * f); t.setAttribute('y', ly + 9.5 * f);
        lx += 15 * f + tw + 14 * f;
      });
      y += headH;
      g.rows.forEach(r => {
        const bh = rowH * 0.66, by = y + (rowH - bh) / 2;
        txt(svg, x0 - 8, by + bh / 2 + 4.5 * f, r.label, { 'text-anchor': 'end', 'font-size': 13 * f, 'font-weight': r.emph ? 700 : 400 });
        let left = 0;
        r.segments.forEach(sg => {
          if (!sg.value) return;
          const rect = el('rect', { x: X(left), y: by, width: X(left + sg.value) - X(left), height: bh, fill: sg.color, stroke: sg.edge || '#fff', 'stroke-width': sg.edge ? 1 : 1.2, class: 'bar seg' }, svg);
          rect.dataset.key = sg.key || '';
          if (sg.value >= 2) txt(svg, (X(left) + X(left + sg.value)) / 2, by + bh / 2 + 4.5 * f, String(sg.value), { 'text-anchor': 'middle', 'font-size': 12 * f, style: `fill:${sg.dark ? '#fff' : '#31353d'}`, 'pointer-events': 'none' });
          if (opts.onSelect) {
            rect.classList.add('hoverable');
            rect.setAttribute('tabindex', '0');
            rect.setAttribute('role', 'button');
            rect.setAttribute('aria-label', sg.aria || '');
            rect.addEventListener('click', () => opts.onSelect(sg.data, rect));
            rect.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onSelect(sg.data, rect); } });
          }
          left += sg.value;
        });
        txt(svg, X(left) + 6, by + bh / 2 + 4.5 * f, String(left), { 'font-size': 13 * f, 'font-weight': r.emph ? 700 : 400 });
        y += rowH;
      });
      y += gap;
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${y + 34 * f}`);
    const g = el('g', { class: 'axis' }, svg);
    el('line', { x1: X(0), y1: y, x2: X(xmax), y2: y, stroke: AXIS }, g);
    for (let v = 0; v <= xmax; v += opts.xstep || 5) {
      el('line', { x1: X(v), y1: y, x2: X(v), y2: y + 4, stroke: AXIS }, g);
      txt(g, X(v), y + 18 * f, String(v), { 'text-anchor': 'middle', 'font-size': 12 * f });
    }
    return svg;
  }


  function barTable(container, spec, opts) {
    const W = opts.width || 520, f = opts.font || 1, rowH = 24 * f, labelW = opts.labelW || 150 * f;
    const colW = (W - labelW - 8) / spec.columns.length, barMax = colW * 0.66, xmax = opts.xmax;
    const svg = el('svg', { viewBox: `0 0 ${W} 10` }, container);
    let y = 16 * f;
    spec.columns.forEach((c, i) => txt(svg, labelW + i * colW, y, c.label, { 'font-size': 14 * f, 'font-weight': 700, style: `fill:${c.edge}` }));
    y += 16 * f;
    spec.groups.forEach(g => {
      txt(svg, 0, y + 10 * f, tc(g.title), { 'font-size': 14 * f, 'font-weight': 700 });
      y += 22 * f;
      const top = y;
      g.rows.forEach(r => {
        const cy = y + rowH / 2;
        txt(svg, 10 * f, cy + 4.5 * f, tc(r.label), { 'font-size': 13 * f });
        r.cells.forEach((cell, i) => {
          const c = spec.columns[i], x0 = labelW + i * colW, w = cell.value / xmax * barMax, bh = rowH * 0.62;
          if (cell.value) {
            const rect = el('rect', { x: x0, y: cy - bh / 2, width: w, height: bh, fill: c.color, stroke: c.edge, 'stroke-width': 1.3, class: 'bar seg' }, svg);
            rect.dataset.key = cell.data.key;
            if (opts.onSelect) {
              rect.classList.add('hoverable');
              rect.setAttribute('tabindex', '0'); rect.setAttribute('role', 'button'); rect.setAttribute('aria-label', cell.aria || '');
              rect.addEventListener('click', () => opts.onSelect(cell.data, rect));
              rect.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onSelect(cell.data, rect); } });
            }
          }
          txt(svg, x0 + w + 5 * f, cy + 4.5 * f, String(cell.value), { 'font-size': 13 * f, 'font-weight': cell.emph && cell.value ? 700 : 400, style: `fill:${cell.value ? '#31353d' : '#bbbec4'}`, 'pointer-events': 'none' });
        });
        y += rowH;
      });
      spec.columns.forEach((c, i) => el('line', { x1: labelW + i * colW, y1: top + 2, x2: labelW + i * colW, y2: y - 2, stroke: AXIS, 'stroke-width': 1 }, svg));
      y += 10 * f;
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${y}`);
    return svg;
  }


  function progressLines(container, spec, opts) {
    const W = opts.width || 520, H = opts.height || 260, f = opts.font || 1;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, container);
    const box = [44 + 10 * f, opts.title ? 34 * f : 16, W - 50 * f, H - 30 * f];
    if (opts.title) txt(svg, (box[0] + box[2]) / 2, 16 * f, tc(opts.title), { 'text-anchor': 'middle', 'font-size': 15 * f });
    const n = spec.checkpoints.length, yr = [20, 52];
    axes(svg, box, [0, n - 1], yr, { ystep: 10, font: f, ylabel: opts.ylabel });
    const X = i => box[0] + 18 * f + i / (n - 1) * (box[2] - box[0] - 30 * f), Y = v => box[3] - (v - yr[0]) / (yr[1] - yr[0]) * (box[3] - box[1]);
    spec.checkpoints.forEach((c, i) => txt(svg, X(i), box[3] + 18 * f, tc(c), { 'text-anchor': 'middle', 'font-size': 13 * f, class: 'tick' }));
    const nudge = { 0: 0.33, 1: 0, 2: -0.33 };            // coinciding lines sit a third of a trial apart
    const ends = [], labels = [];
    spec.series.forEach((s, si) => {
      const ys = s.alive.map(v => v + nudge[si]);
      el('polyline', { points: ys.map((v, i) => `${X(i)},${Y(v)}`).join(' '), fill: 'none', stroke: s.color, 'stroke-width': (s.emph ? 3 : 2.2) * f / 1.5, 'stroke-linejoin': 'round' }, svg);
      ys.forEach((v, i) => {
        const d = i > 0 ? s.drops[i] : null;
        const c = el('circle', { cx: X(i), cy: Y(v), r: 5 * f, fill: '#fff', stroke: s.color, 'stroke-width': 1.8 }, svg);   // one size for every point
        if (d && d.n >= (opts.labelMin || 7)) labels.push({ i, n: d.n, color: s.color, my: (Y(ys[i - 1]) + Y(v)) / 2 });
        if (d && d.n > 0 && opts.onSelect) {
          c.classList.add('hoverable', 'seg'); c.dataset.key = d.data.key;
          c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); c.setAttribute('aria-label', d.aria || '');
          c.setAttribute('r', 5 * f); c.setAttribute('fill', s.color);
          c.__data = d.data;
          c.addEventListener('click', () => opts.onSelect(d.data, c));
          c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onSelect(d.data, c); } });
        }
      });
      ends.push({ v: s.alive[n - 1], y: ys[n - 1], color: s.color, emph: s.emph });
    });

    for (let i = 1; i < n; i++) {
      const here = labels.filter(l => l.i === i).sort((a, b) => a.my - b.my);
      let y = -1e9;
      here.forEach(l => { y = Math.max(l.my + 14 * f, y + 15 * f);
        txt(svg, (X(i - 1) + X(i)) / 2 - 6 * f, y, '\u2212' + l.n, { 'text-anchor': 'end', 'font-size': 13 * f, style: `fill:${l.color}` }); });
    }
    ends.sort((a, b) => a.y - b.y);
    let last = -1e9;
    ends.forEach(e => { let yy = Y(e.y); if (last > -1e9 && last - yy < 15 * f) yy = last - 15 * f; last = yy;
      txt(svg, X(n - 1) + 20 * f, yy + 4.5 * f, String(e.v), { 'font-size': 13 * f, 'font-weight': e.emph ? 700 : 400, style: `fill:${e.color}` }); });
    return svg;
  }

  function legend(container, items) {
    const d = document.createElement('div');
    d.className = 'legend';
    items.forEach(it => {
      const s = document.createElement('span');
      const i = document.createElement('i');
      if (it.line) { i.className = 'line'; i.style.background = it.color; } else { i.style.background = it.color; i.style.borderColor = it.edge || it.color; }
      s.appendChild(i); s.appendChild(document.createTextNode(tc(it.label)));
      d.appendChild(s);
    });
    container.appendChild(d);
    return d;
  }

  window.Charts = { groupedBars, hbarPanels, lines, completionCurves, stackedHBars, barTable, progressLines, legend, el, txt, tc };
})();
