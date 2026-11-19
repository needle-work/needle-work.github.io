// Charts and example data adapted from the rebuttal page.
function figLegend(id, items) {
  const host = document.getElementById(id);
  if (!host || !host.closest) return;
  const plot = host.closest(".plot") || host, box = document.createElement("div");
  box.className = "legend";
  if (id === "fig-s2-swap") { box.classList.add("legend-compact"); box.setAttribute("tabindex", "0"); box.setAttribute("role", "region"); box.setAttribute("aria-label", "Bridge replacement legend, scroll horizontally if needed"); }
  items.forEach(([label, fill, edge, shape]) => { const sp = document.createElement("span"), i = document.createElement("i"); if (shape === "dot") i.className = "dot"; i.style.background = fill; i.style.borderColor = edge; sp.append(i, document.createTextNode(label)); box.appendChild(sp); });
  if (id === "fig-s2-pose") document.getElementById("filter-comparison-legend").appendChild(box);
  else plot.after(box);
}

(function(){
  const C = {ink:"#31353d", slate:"#5c616a", axis:"#9a9ea6", ours:"#00528e", oursLt:"#99accf", dp:"#ffead9", dpDk:"#c9780f", ref:"#bbbec4", refDk:"#5c616a", bg:"#ffffff", good:"#00682c"};

  function yaxis(svg, x, top, bot, ticks, sy) { add(svg, "line", {x1: x, x2: x, y1: top - 6, y2: bot, stroke: C.axis}); ticks.forEach(v => { add(svg, "line", {x1: x - 4, x2: x, y1: sy(v), y2: sy(v), stroke: C.axis}); add(svg, "text", {x: x - 7, y: sy(v) + 4, "text-anchor": "end", "font-size": 12, fill: C.slate}, v); }); }
  function key(svg, x, y, fill, edge) { add(svg, "rect", {x: x, y: y, width: 11, height: 11, rx: 1.5, fill: fill, stroke: edge, "stroke-width": 1.5}); }
  const L = {"n30_p25":{"rec":[127,143,133,136,127,174,137,123,155,130,132,134,145,170,136,147,148,133,134,134,142,144,1051,936,775,771,700,660,630,565],"best":[127,115,95,109,93,129,104,123,122,86,132,102,145,110,136,104,148,133,85,107,90,112,129,132,135,139,137,128,99,125],"fail":30,"withb":23,"n":30},"n30_p50":{"rec":[127,143,133,136,127,174,137,123,155,130,132,134,145,170,136,1051,936,775,771,700,660,630,565,571,566,553,526,516,503,512],"best":[127,143,133,136,127,132,137,123,155,130,132,134,145,131,136,152,138,143,134,133,133,138,129,146,140,130,129,131,132,138],"fail":28,"withb":17,"n":30},"n30_p75":{"rec":[127,143,133,136,127,174,137,1051,936,775,771,700,660,630,565,571,566,553,526,516,503,512,488,462,458,462,448,440,437,428],"best":[127,143,133,136,127,130,137,141,405,160,152,149,138,141,130,134,147,137,147,130,148,133,140,143,141,129,134,140,136,133],"fail":32,"withb":24,"n":30},"n30_p100":{"rec":[1051,936,775,771,700,660,630,565,571,566,553,526,516,503,512,488,462,458,462,448,440,437,428,427,424,418,415,405,411,396],"best":[391,398,403,420,413,403,384,409,237,359,397,415,401,272,388,398,384,307,401,389,291,299,394,349,366,378,301,296,369,285],"fail":27,"withb":30,"n":30},"n20_p50":{"rec":[127,143,133,136,127,174,137,123,155,130,1051,936,775,771,700,660,630,565,571,566],"best":[127,143,133,136,127,129,137,123,128,130,139,144,130,136,142,131,131,129,129,133],"fail":21,"withb":12,"n":20},"n40_p50":{"rec":[127,127,174,155,143,136,130,132,145,133,137,123,134,170,136,147,148,133,134,134,1051,936,775,771,700,660,630,565,571,566,553,526,516,503,512,488,462,458,462,448],"best":[127,127,130,155,143,136,130,132,145,133,137,123,134,135,136,147,148,133,134,134,166,150,149,143,162,136,140,142,143,141,142,144,138,157,135,137,134,135,135,135],"fail":27,"withb":22,"n":40}};
  const ns = "http://www.w3.org/2000/svg";
  function svgEl(W, H, cls) { const s = document.createElementNS(ns, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); if (cls) s.setAttribute("class", cls); if (s.style) s.style.maxWidth = W + "px"; return s; }
  function add(svg, tag, a, text) { const e = document.createElementNS(ns, tag); for (const k in a) e.setAttribute(k, a[k]); if (text != null) e.textContent = text; svg.appendChild(e); return e; }

  function bars(svg, x0, y0, w, h, labels, dp, ours, xlab, ylab) {
    const ax = x0 + 52, top = y0 + 24, bot = y0 + h - 48, ymax = 50, sy = v => bot - v / ymax * (bot - top);
    yaxis(svg, ax, top, bot, [0, 10, 20, 30, 40, 50], sy);
    add(svg, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: C.ink, transform: `translate(${x0 + 14},${(top + bot) / 2}) rotate(-90)`}, ylab);
    const gw = (w - 52) / labels.length, bw = Math.min(46, gw / 2.7);
    labels.forEach((lab, i) => {
      const cx = ax + gw * (i + 0.5);
      [[dp[i], C.dp, C.dpDk, -1], [ours[i], C.oursLt, C.ours, 0]].forEach(([[v, se], c, e, k]) => {
        const bx = cx + k * bw + 1.5, mx = bx + (bw - 3) / 2;
        add(svg, "rect", {x: bx, y: sy(v), width: bw - 3, height: bot - sy(v), fill: c, stroke: e, "stroke-width": 1.5});
        add(svg, "line", {x1: mx, x2: mx, y1: sy(v - se), y2: sy(v + se), stroke: C.ink, "stroke-width": 1.2});
        [v - se, v + se].forEach(t => add(svg, "line", {x1: mx - 4, x2: mx + 4, y1: sy(t), y2: sy(t), stroke: C.ink, "stroke-width": 1.2}));
      });
      const g = ours[i][0] - dp[i][0], txt = (g > 0 ? "+" : g < 0 ? "−" : "") + Math.abs(g).toFixed(1);
      add(svg, "text", {x: cx, y: sy(Math.max(dp[i][0] + dp[i][1], ours[i][0] + ours[i][1])) - 8, "text-anchor": "middle", "font-size": 13, fill: g > 0 ? C.good : C.slate, "font-weight": g > 0 ? 700 : 400}, txt);
      add(svg, "text", {x: cx, y: bot + 18, "text-anchor": "middle", "font-size": 13, fill: C.ink}, lab);
    });
    add(svg, "line", {x1: ax, x2: x0 + w, y1: bot, y2: bot, stroke: C.axis});
    add(svg, "text", {x: ax + (w - 52) / 2, y: bot + 40, "text-anchor": "middle", "font-size": 13, fill: C.ink}, xlab);
  }

  function kde(vals, lo, hi, n) {
    const sd = Math.sqrt(vals.reduce((a, v) => a + (v - vals.reduce((x, y) => x + y, 0) / vals.length) ** 2, 0) / vals.length);
    const bwd = Math.max(12, 1.06 * sd * Math.pow(vals.length, -0.2) * 0.6);
    const ys = [], step = (hi - lo) / (n - 1);
    for (let i = 0; i < n; i++) { const y = lo + i * step; ys.push([y, vals.reduce((a, v) => a + Math.exp(-0.5 * ((y - v) / bwd) ** 2), 0)]); }
    return ys;
  }
  const q = (v, p) => { const s = [...v].sort((a, b) => a - b), i = (s.length - 1) * p, f = Math.floor(i); return s[f] + (s[Math.min(f + 1, s.length - 1)] - s[f]) * (i - f); };
  function violins(svg, x0, y0, w, h, cells, labels, xlab, title) {
    const top = y0 + 24, bot = y0 + h - 48, ymax = 1100, sy = v => bot - v / ymax * (bot - top);
    yaxis(svg, x0 + 38, top, bot, [0, 250, 500, 750, 1000], sy);
    add(svg, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: C.ink, transform: `translate(${x0 - 6},${(top + bot) / 2}) rotate(-90)`}, "Demonstration length (steps)");
    const gw = (w - 38) / cells.length, half = Math.min(gw / 4.4, 26);
    let maxd = 0; const dens = cells.map(c => ["rec", "best"].map(k => { const d = kde(L[c][k], 60, 1080, 80); maxd = Math.max(maxd, ...d.map(p => p[1] / L[c][k].length)); return d.map(p => [p[0], p[1] / L[c][k].length]); }));
    const medianLabels = [];
    cells.forEach((c, i) => {
      const cx = x0 + 38 + gw * (i + 0.5);
      [["rec", C.ref, C.refDk, -1.05], ["best", C.oursLt, C.ours, 1.05]].forEach(([k, fill, edge, off], j) => {
        const vx = cx + off * half, d = dens[i][j];
        const pts = d.map(p => `${vx + p[1] / maxd * half},${sy(p[0])}`).concat(d.slice().reverse().map(p => `${vx - p[1] / maxd * half},${sy(p[0])}`));
        add(svg, "polygon", {points: pts.join(" "), fill: fill, stroke: edge, "stroke-width": 1.5});
        const v = L[c][k], md = q(v, 0.5);
        add(svg, "line", {x1: vx, x2: vx, y1: sy(Math.min(...v)), y2: sy(Math.max(...v)), stroke: C.ink, "stroke-width": 0.8});
        add(svg, "line", {x1: vx - 7, x2: vx + 7, y1: sy(md), y2: sy(md), stroke: C.ink, "stroke-width": 2});
        medianLabels.push({x: vx, y: sy(md) - 5, value: Math.round(md)});
      });
      add(svg, "text", {x: cx, y: bot + 17, "text-anchor": "middle", "font-size": 13, fill: C.ink}, labels[i]);
    });
    medianLabels.forEach(({x, y, value}) => add(svg, "text", {x, y, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: C.ink, stroke: "#fff", "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke"}, value));
    add(svg, "line", {x1: x0 + 38, x2: x0 + w, y1: bot, y2: bot, stroke: C.axis});
    add(svg, "text", {x: x0 + 38 + (w - 38) / 2, y: bot + 40, "text-anchor": "middle", "font-size": 13, fill: C.ink}, xlab);
  }

  const mix = ["n30_p25", "n30_p50", "n30_p75", "n30_p100"], mixLab = ["25 %", "50 %", "75 %", "100 %"];

  let s = svgEl(900, 300);
  bars(s, 0, 0, 400, 300, mixLab, [[40.4, 1.6], [35.2, 1.2], [22.0, 1.7], [20.4, 0.7]], [[39.2, 1.9], [40.8, 1.7], [27.6, 1.3], [24.8, 0.8]], "Proportion of data that is suboptimal", "Success Rate (%)");
  violins(s, 450, 0, 450, 300, mix, mixLab, "Proportion of data that is suboptimal", null);
  document.getElementById("fig-mix").appendChild(s);
  figLegend("fig-mix", [["DP", C.dp, C.dpDk, "box"], ["NEEDLEwork", C.oursLt, C.ours, "box"], ["Recorded demonstration length", C.ref, C.refDk, "box"], ["Shortest length after stitching", C.oursLt, C.ours, "box"]]);

  const num = ["n20_p50", "n30_p50", "n40_p50"], numLab = ["20", "30", "40 (paper)"];

  s = svgEl(480, 300);
  bars(s, 0, 0, 480, 300, numLab, [[13.2, 0.5], [35.2, 1.2], [39.6, 1.5]], [[16.8, 1.6], [40.8, 1.7], [47.2, 1.4]], "Number of trajectories", "Success Rate (%)");
  document.getElementById("fig-num").appendChild(s);
  figLegend("fig-num", [["DP", C.dp, C.dpDk, "box"], ["NEEDLEwork", C.oursLt, C.ours, "box"]]);

  s = svgEl(480, 340, "small");
  violins(s, 0, 0, 470, 340, num, numLab, "successful demonstrations (50 % slow)", "Demonstration lengths");
  (document.getElementById("opt1") || {appendChild() {}}).appendChild(s);

  s = svgEl(480, 340, "small");
  (function () {
    const top = 52, bot = 296, ymax = 45, sy = v => bot - v / ymax * (bot - top), w = 470;
    add(s, "text", {x: 0, y: 16, "font-size": 15, fill: C.ink}, "What gets a bridge");
    [["successful demos with a bridge", C.oursLt, C.ours], ["failed attempts with a bridge", C.ref, C.refDk]].forEach(([n, c, e], i) => { key(s, i * 200, 25, c, e); add(s, "text", {x: 16 + i * 200, y: 35, "font-size": 12, fill: C.slate}, n); });
    yaxis(s, 28, top, bot, [0, 10, 20, 30, 40], sy);
    const gw = (w - 28) / 3, bw = 30;
    num.forEach((c, i) => {
      const cx = 28 + gw * (i + 0.5);
      [[L[c].withb, `${L[c].withb} of ${L[c].n}`, C.oursLt, C.ours, -1], [L[c].fail, `${L[c].fail} of 150`, C.ref, C.refDk, 0]].forEach(([v, t, col, e, k]) => {
        add(s, "rect", {x: cx + k * bw + 1.5, y: sy(v), width: bw - 3, height: bot - sy(v), fill: col, stroke: e, "stroke-width": 1.5});
        add(s, "text", {x: cx + k * bw + bw / 2, y: sy(v) - 5, "text-anchor": "middle", "font-size": 10.5, fill: C.ink}, t);
      });
      add(s, "text", {x: cx, y: bot + 17, "text-anchor": "middle", "font-size": 13, fill: C.ink}, numLab[i]);
    });
    add(s, "line", {x1: 28, x2: w, y1: bot, y2: bot, stroke: C.axis});
    add(s, "text", {x: 28 + (w - 28) / 2, y: bot + 36, "text-anchor": "middle", "font-size": 12, fill: C.slate}, "successful demonstrations (50 % slow)");
  })();
  (document.getElementById("opt2") || {appendChild() {}}).appendChild(s);

  s = svgEl(480, 340, "small");
  (function () {
    const x0 = 34, x1 = 470, top = 52, bot = 296, tmax = 1100, sx = t => x0 + t / tmax * (x1 - x0), sy = f => bot - f * (bot - top);
    add(s, "text", {x: 0, y: 16, "font-size": 15, fill: C.ink}, "Finished within t steps");
    const shades = ["#99accf", "#356fb0", "#00385f"];
    num.forEach((c, i) => { add(s, "line", {x1: i * 120, x2: i * 120 + 14, y1: 31, y2: 31, stroke: shades[i], "stroke-width": 2.5}); add(s, "text", {x: i * 120 + 19, y: 35, "font-size": 12, fill: C.slate}, numLab[i] + " demos"); });
    add(s, "text", {x: 370, y: 35, "font-size": 11, fill: C.slate}, "dashed: recorded");
    yaxis(s, x0, top, bot, [0, 0.25, 0.5, 0.75, 1], sy);
    [0, 250, 500, 750, 1000].forEach(t => add(s, "text", {x: sx(t), y: bot + 17, "text-anchor": "middle", "font-size": 11, fill: C.slate}, t));
    num.forEach((c, i) => ["rec", "best"].forEach(k => {
      const v = [...L[c][k]].sort((a, b) => a - b); let d = `M${sx(0)},${sy(0)}`;
      v.forEach((t, j) => { d += ` L${sx(t)},${sy(j / v.length)} L${sx(t)},${sy((j + 1) / v.length)}`; });
      d += ` L${sx(tmax)},${sy(1)}`;
      add(s, "path", {d: d, fill: "none", stroke: shades[i], "stroke-width": 2, "stroke-dasharray": k === "rec" ? "5 4" : "none"});
    }));
    add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: C.axis});
    add(s, "text", {x: (x0 + x1) / 2, y: bot + 36, "text-anchor": "middle", "font-size": 12, fill: C.slate}, "steps t");
  })();
  (document.getElementById("opt3") || {appendChild() {}}).appendChild(s);
})();

(function(){

  const ns = "http://www.w3.org/2000/svg", AX = "#9a9ea6", INK = "#31353d", SL = "#5c616a";
  const COL = {dp: ["#ffead9", "#c9780f"], ours: ["#99accf", "#00528e"], grey: ["#bbbec4", "#5c616a"], purple: ["#a78bbd", "#4a2468"],
               r1: ["#f9d2cb", "#b8827a"], r2: ["#e8a4b1", "#a04557"], r3: ["#cd92ba", "#7c2e63"], r4: ["#a78bbd", "#4a2468"]};
  const svg = (W, H) => { const s = document.createElementNS(ns, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); if (s.style) s.style.maxWidth = W + "px"; return s; };
  const add = (p, t, a, x) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (x != null) e.textContent = x; p.appendChild(e); return e; };
  const put = (id, s) => { const el = document.getElementById(id); if (el) el.appendChild(s); };
  function legend(s, x, y, items) {
    items.forEach(([n, c]) => { add(s, "rect", {x: x, y: y - 11, width: 12, height: 12, rx: 1.5, fill: c[0], stroke: c[1], "stroke-width": 1.5}); add(s, "text", {x: x + 18, y: y, "font-size": 13, fill: INK}, n); x += 46 + n.length * 7.4; });
  }

  function grouped(id, o) {
    const W = o.W || 760, H = 286, x0 = 56, x1 = W - 10, top = 30, bot = H - 40, sy = v => bot - v / o.ymax * (bot - top);
    const s = svg(W, H);
    add(s, "line", {x1: x0, x2: x0, y1: top - 6, y2: bot, stroke: AX});
    o.ticks.forEach(v => { add(s, "line", {x1: x0 - 4, x2: x0, y1: sy(v), y2: sy(v), stroke: AX}); add(s, "text", {x: x0 - 8, y: sy(v) + 4, "text-anchor": "end", "font-size": 12, fill: SL}, v); });
    add(s, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: INK, transform: `translate(16,${(top + bot) / 2}) rotate(-90)`}, o.ylabel);
    const gw = (x1 - x0) / o.groups.length, bw = Math.min((gw * 0.68) / o.series.length, 52), pad = (gw - bw * o.series.length) / 2;
    if (o.ref != null) add(s, "line", {x1: x0, x2: x1, y1: sy(o.ref), y2: sy(o.ref), stroke: COL.ours[1], "stroke-width": 1.6, "stroke-dasharray": "6 5"});
    o.groups.forEach((g, gi) => {
      o.series.forEach(([n, c, vals], bi) => {
        const val = vals[gi], v = Array.isArray(val) ? val[0] : val, se = Array.isArray(val) ? val[1] : 0;
        const x = x0 + gi * gw + pad + bi * bw + 3, w = bw - 6, cx = x + w / 2;
        add(s, "rect", {x: x, y: sy(v), width: w, height: bot - sy(v), fill: c[0], stroke: c[1], "stroke-width": 1.5});
        if (se) { add(s, "line", {x1: cx, x2: cx, y1: sy(v - se), y2: sy(v + se), stroke: INK, "stroke-width": 1.2}); [v - se, v + se].forEach(e => add(s, "line", {x1: cx - 4, x2: cx + 4, y1: sy(e), y2: sy(e), stroke: INK, "stroke-width": 1.2})); }
        add(s, "text", {x: cx, y: sy(v + se) - 6, "text-anchor": "middle", "font-size": 12.5, fill: INK, stroke: "#fff", "stroke-width": 4, "paint-order": "stroke"}, o.fmt(v));
      });
      add(s, "text", {x: x0 + gi * gw + gw / 2, y: bot + 20, "text-anchor": "middle", "font-size": 14, fill: INK}, g);
    });
    add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    put(id, s);
    if (o.legend !== false) figLegend(id, o.series.map(([n, c]) => [n, c[0], c[1], "box"]));
  }

  let selSeg = null;
  function exampleHover(seg, task, cls, ex) {
    seg.style.cursor = "pointer";
    seg.setAttribute("role", "button"); seg.setAttribute("tabindex", "0"); seg.setAttribute("aria-label", `${task}: ${cls}. View example.`);
    seg.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); seg.dispatchEvent(new MouseEvent("click")); } });
    seg.addEventListener("click", () => {
      const box = document.getElementById("ex-viewer"); if (!box) return;
      if (selSeg) selSeg.setAttribute("stroke-width", 1.2);
      selSeg = seg; seg.setAttribute("stroke-width", 3);
      box.querySelector("h4").textContent = `${task} · ${cls}`;
      box.querySelector(".fv-count").textContent = (ex.within ? `A ${ex.L}-step bridge replaces ${ex.n} recorded steps of the same demonstration.`
        : `A ${ex.L}-step bridge into another demonstration; the route to finish is ${ex.n} steps shorter.`);
      const [v1, v2] = box.querySelectorAll("video"), tabs = box.querySelectorAll(".tabs button");
      v1.src = `rebuttal/media/${ex.name}_stitch_v3.mp4`; v2.src = `rebuttal/media/${ex.name}_${ex.within ? "detour" : "suffix"}_v3.mp4`;
      const pick = (i) => { tabs.forEach((t, j) => t.setAttribute("aria-selected", String(j === i))); [v1, v2].forEach((v, j) => { v.hidden = j !== i; if (j === i) v.play(); else v.pause(); }); };
      tabs.forEach((t, i) => { t.onclick = () => pick(i); });
      box.querySelector(".ex-videos").hidden = false; pick(0);
    });
  }

  function strip(id, o) {
    const W = 760, x0 = 96, x1 = 740, top = 14, rh = 54, H = top + rh * o.groups.length + 44, xmax = 2700, sx = v => x0 + v / xmax * (x1 - x0);
    const s = svg(W, H);
    o.groups.forEach((g, gi) => {
      const cy = top + gi * rh + rh / 2;
      add(s, "text", {x: x0 - 12, y: cy + 5, "text-anchor": "end", "font-size": 14, fill: INK}, g);
      [["src", COL.ours, 7], ["iso", COL.r2, -7]].forEach(([k, c, dy]) => o.data[g][k].forEach((v, i) => {
        const jit = ((i * 37) % 9 - 4) * 1.3;
        add(s, "circle", {cx: sx(v), cy: cy + dy + jit, r: 4.5, fill: c[0], stroke: c[1], "stroke-width": 1.2});
      }));
    });
    const bot = top + rh * o.groups.length;
    add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    [0, 500, 1000, 1500, 2000, 2500].forEach(v => { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 18, "text-anchor": "middle", "font-size": 12, fill: SL}, v); });
    add(s, "text", {x: (x0 + x1) / 2, y: bot + 38, "text-anchor": "middle", "font-size": 13, fill: INK}, "Demonstration length (steps)");
    put(id, s);
    figLegend(id, [["Never a bridge source", COL.r2[0], COL.r2[1], "dot"], ["Bridge source", COL.ours[0], COL.ours[1], "dot"]]);
  }

  function remaining(id, o) {
    const pw = 220, ph = 220, gap = 60, x0 = 58, top = 22, W = x0 + o.groups.length * (pw + gap), H = top + ph + 58;
    const s = svg(W, H);
    o.groups.forEach((g, gi) => {
      const px = x0 + gi * (pw + gap), m = o.max[gi], sx = v => px + v / m * pw, sy = v => top + ph - v / m * ph;
      add(s, "text", {x: px + pw / 2, y: top - 6, "text-anchor": "middle", "font-size": 14, fill: INK}, g);
      add(s, "line", {x1: sx(0), y1: sy(0), x2: sx(m), y2: sy(m), stroke: AX, "stroke-width": 1.2, "stroke-dasharray": "5 4"});
      o.data[g].src.forEach((v, i) => add(s, "circle", {cx: sx(Math.min(v, m)), cy: sy(Math.min(o.data[g].tgt[i], m)), r: 3, fill: COL.ours[0], stroke: COL.ours[1], "stroke-width": 0.9, "fill-opacity": 0.8}));
      add(s, "line", {x1: px, x2: px + pw, y1: top + ph, y2: top + ph, stroke: AX}); add(s, "line", {x1: px, x2: px, y1: top, y2: top + ph, stroke: AX});
      [0, m / 2, m].forEach(v => { add(s, "text", {x: sx(v), y: top + ph + 16, "text-anchor": "middle", "font-size": 12, fill: SL}, Math.round(v)); add(s, "text", {x: px - 6, y: sy(v) + 4, "text-anchor": "end", "font-size": 12, fill: SL}, Math.round(v)); });
    });
    add(s, "text", {x: W / 2 + x0 / 2, y: top + ph + 40, "text-anchor": "middle", "font-size": 13, fill: INK}, "Steps remaining at the source");
    add(s, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: INK, transform: `translate(14,${top + ph / 2}) rotate(-90)`}, "Steps remaining at the target");
    put(id, s);
  }

  function hpanels(id, o) {
    const lw = 200, pw = 220, gap = 26, rh = 30, top = 30, W = lw + o.panels.length * (pw + gap), H = top + rh * o.rows.length + 46;
    const s = svg(W, H);
    o.rows.forEach(([lab, c, emph], ri) => add(s, "text", {x: lw - 10, y: top + ri * rh + rh / 2 + 5, "text-anchor": "end", "font-size": 13, fill: emph ? INK : SL, "font-weight": emph ? 700 : 400}, lab));
    o.panels.forEach(([title, xmax, step, vals], pi) => {
      const x0 = lw + pi * (pw + gap), sx = v => x0 + v / xmax * pw;
      add(s, "text", {x: x0 + pw / 2, y: top - 12, "text-anchor": "middle", "font-size": 14, fill: INK, "font-weight": 700}, title);
      o.rows.forEach(([lab, c], ri) => {
        const [v, se] = vals[ri], y = top + ri * rh + 5, h = rh - 10, cy = y + h / 2;
        if (ri === o.rows.length - 1) add(s, "line", {x1: x0, x2: x0 + pw, y1: y - 5, y2: y - 5, stroke: "#d5d7db"});
        add(s, "rect", {x: x0, y: y, width: sx(v) - x0, height: h, fill: c[0], stroke: c[1], "stroke-width": 1.5});
        add(s, "line", {x1: sx(v - se), x2: sx(v + se), y1: cy, y2: cy, stroke: INK, "stroke-width": 1.1});
        [v - se, v + se].forEach(e => add(s, "line", {x1: sx(e), x2: sx(e), y1: cy - 3, y2: cy + 3, stroke: INK, "stroke-width": 1.1}));
        add(s, "text", {x: sx(v + se) + 5, y: cy + 4, "font-size": 12, fill: SL}, v.toFixed(1));
      });
      const bot = top + rh * o.rows.length;
      add(s, "line", {x1: x0, x2: x0 + pw, y1: bot, y2: bot, stroke: AX});
      for (let v = 0; v <= xmax + 1e-9; v += step) { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 17, "text-anchor": "middle", "font-size": 12, fill: SL}, v); }
      add(s, "text", {x: x0 + pw / 2, y: bot + 36, "text-anchor": "middle", "font-size": 13, fill: INK}, "Success Rate (%)");
    });
    put(id, s);
  }

  function costbars(id, o) {
    const W = 760, x0 = 96, x1 = 700, top = 12, rh = 64, H = top + rh * o.rows.length + 44, sx = v => x0 + v / o.xmax * (x1 - x0);
    const s = svg(W, H);
    o.rows.forEach(([task, parts, dp], ri) => {
      const y = top + ri * rh; let left = 0;
      add(s, "text", {x: x0 - 12, y: y + 26, "text-anchor": "end", "font-size": 14, fill: INK}, task);
      parts.forEach((v, k) => { const c = o.parts[k][1]; add(s, "rect", {x: sx(left), y: y + 8, width: sx(left + v) - sx(left), height: 24, fill: c[0], stroke: c[1], "stroke-width": 1.2}); left += v; });
      add(s, "text", {x: sx(left) + 6, y: y + 25, "font-size": 12.5, fill: INK}, left.toFixed(1) + " GPU-h");
      add(s, "rect", {x: x0, y: y + 38, width: sx(dp) - x0, height: 14, fill: COL.dp[0], stroke: COL.dp[1], "stroke-width": 1.2});
      add(s, "text", {x: sx(dp) + 6, y: y + 50, "font-size": 12, fill: SL}, dp.toFixed(1));
    });
    const bot = top + rh * o.rows.length;
    add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    for (let v = 0; v <= o.xmax; v += 4) { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 18, "text-anchor": "middle", "font-size": 12, fill: SL}, v); }
    add(s, "text", {x: (x0 + x1) / 2, y: bot + 38, "text-anchor": "middle", "font-size": 13, fill: INK}, "GPU-hours");
    put(id, s);
    figLegend(id, o.parts.map(([n, c]) => [n, c[0], c[1], "box"]).concat([["One DP training", COL.dp[0], COL.dp[1], "box"]]));
  }

  function timeline(id, o) {
    const W = o.W || 760, lw = o.lw || 190, x1 = W - 54, top = 10, rh = 34, H = top + rh * o.rows.length + 46, sx = v => lw + v / o.xmax * (x1 - lw);
    const s = svg(W, H);
    o.rows.forEach(([lab, a, b, c, note, rng], ri) => {
      const y = top + ri * rh + 6, h = rh - 12;
      add(s, "text", {x: lw - 10, y: y + h / 2 + 5, "text-anchor": "end", "font-size": 13, fill: INK}, lab);
      add(s, "rect", {x: sx(a), y: y, width: Math.max(2, sx(b) - sx(a)), height: h, fill: c[0], stroke: c[1], "stroke-width": 1.5});
      if (rng) { const cy = y + h / 2; add(s, "line", {x1: sx(b), x2: sx(rng), y1: cy, y2: cy, stroke: INK, "stroke-width": 1.1}); add(s, "line", {x1: sx(rng), x2: sx(rng), y1: cy - 4, y2: cy + 4, stroke: INK, "stroke-width": 1.1}); }
      add(s, "text", {x: sx(rng || b) + 6, y: y + h / 2 + 4, "font-size": 12, fill: SL}, note);
    });
    const bot = top + rh * o.rows.length;

    add(s, "line", {x1: lw, x2: x1, y1: bot, y2: bot, stroke: AX});
    for (let v = 0; v <= o.xmax; v += (o.step || 1)) { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 18, "text-anchor": "middle", "font-size": 12, fill: SL}, v); }
    add(s, "text", {x: (lw + x1) / 2, y: bot + 38, "text-anchor": "middle", "font-size": 13, fill: INK}, "Hours");
    put(id, s);
  }

  function scaling(id, o) {
    const W = 560, x0 = 64, x1 = 540, top = 14, bot = 250, H = 300, sx = v => x0 + v / o.xmax * (x1 - x0), sy = v => bot - v / o.ymax * (bot - top);
    const s = svg(W, H);
    add(s, "line", {x1: x0, x2: x0, y1: top, y2: bot, stroke: AX}); add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    [0, 30, 60, 90, 120].forEach(v => { add(s, "line", {x1: x0 - 4, x2: x0, y1: sy(v), y2: sy(v), stroke: AX}); add(s, "text", {x: x0 - 8, y: sy(v) + 4, "text-anchor": "end", "font-size": 12, fill: SL}, v); });
    [0, 50000, 100000, 150000, 200000].forEach(v => { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 18, "text-anchor": "middle", "font-size": 12, fill: SL}, v ? (v / 1000) + "k" : "0"); });
    add(s, "text", {x: (x0 + x1) / 2, y: bot + 40, "text-anchor": "middle", "font-size": 13, fill: INK}, "Candidate source–target pairs scored");
    add(s, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: INK, transform: `translate(16,${(top + bot) / 2}) rotate(-90)`}, "Scoring time (min)");
    o.series.forEach(([n, c, pts, a, b]) => {
      add(s, "line", {x1: sx(0), y1: sy(a / 60), x2: sx(o.xmax), y2: sy((a + b * o.xmax) / 60), stroke: c[1], "stroke-width": 1.6, "stroke-dasharray": "6 4"});
      pts.forEach(([x, t]) => add(s, "circle", {cx: sx(x), cy: sy(t / 60), r: 5, fill: c[0], stroke: c[1], "stroke-width": 1.5}));
    });
    put(id, s);
    figLegend(id, o.series.map(([n, c]) => [n, c[0], c[1], "dot"]));
  }

  function stacked(id, o) {
    const W = 760, x0 = o.sub ? 200 : 96, x1 = 740, top = 14, rh = o.sub ? 52 : 46, bh = 28, H = top + rh * o.groups.length + 36, sx = v => x0 + v / 100 * (x1 - x0);
    const s = svg(W, H);
    o.groups.forEach((g, gi) => {
      const y = top + gi * rh + (rh - bh) / 2;
      add(s, "text", {x: x0 - 12, y: y + bh / 2 + (o.sub ? -1 : 5), "text-anchor": "end", "font-size": 14, fill: INK}, g);
      if (o.sub) add(s, "text", {x: x0 - 12, y: y + bh / 2 + 15, "text-anchor": "end", "font-size": 11.5, fill: SL}, o.sub[gi]);
      let left = 0;
      o.shares[gi].forEach((v, ci) => {
        const c = o.classes[ci][1];
        const seg = add(s, "rect", {x: sx(left), y: y, width: sx(left + v) - sx(left), height: bh, fill: c[0], stroke: c[1], "stroke-width": 1.2});
        const ex = o.examples && o.examples[`${g}/${o.classes[ci][2]}`];
        if (ex && seg.addEventListener) exampleHover(seg, g, o.classes[ci][0], ex);
        if (v >= 6) add(s, "text", {x: (sx(left) + sx(left + v)) / 2, y: y + bh / 2 + 4.5, "text-anchor": "middle", "font-size": 12.5, fill: INK}, v + " %");
        left += v;
      });
    });
    const bot = top + rh * o.groups.length;
    add(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    [0, 25, 50, 75, 100].forEach(v => { add(s, "line", {x1: sx(v), x2: sx(v), y1: bot, y2: bot + 4, stroke: AX}); add(s, "text", {x: sx(v), y: bot + 18, "text-anchor": "middle", "font-size": 12, fill: SL}, v + " %"); });
    put(id, s);
    figLegend(id, o.classes.map(([n, c]) => [n, c[0], c[1], "box"]));
  }

  const tasks = ["Can", "Square", "Transport"], pct = v => v + " %", one = v => v.toFixed(1);

  stacked("fig-contact", {groups: tasks, sub: ["(19.6 % of training windows)", "(8.3 % of training windows)", "(6.5 % of training windows)"], shares: [[70, 8, 11, 8, 3], [83, 7, 8, 2, 1], [16, 2, 75, 2, 5]],
    classes: [["Free space", COL.grey, "free"], ["Touching, not grasping", COL.r1, "nonprehensile"], ["Holding throughout", COL.r3, "holding"], ["Picking up", COL.r2, "acquired"], ["Releasing", COL.r4, "release"]],

    examples: {"Can/free": {name: "contact_can_free", within: true, n: 80, L: 17, trained: true}, "Can/nonprehensile": {name: "contact_can_nonprehensile", within: true, n: 60, L: 22, trained: true}, "Can/holding": {name: "contact_can_holding", within: true, n: 61, L: 21, trained: false}, "Can/acquired": {name: "contact_can_acquired", within: true, n: 57, L: 21, trained: true}, "Can/release": {name: "contact_can_release", within: true, n: 176, L: 21, trained: false}, "Square/free": {name: "contact_square_free", within: true, n: 220, L: 9, trained: true}, "Square/nonprehensile": {name: "contact_square_nonprehensile", within: true, n: 116, L: 23, trained: true}, "Square/holding": {name: "contact_square_holding", within: true, n: 73, L: 23, trained: true}, "Square/acquired": {name: "contact_square_acquired", within: false, n: 265, L: 23, trained: false}, "Square/release": {name: "contact_square_release", within: false, n: 174, L: 23, trained: false}, "Transport/free": {name: "contact_transport_free", within: false, n: 2143, L: 8, trained: true}, "Transport/nonprehensile": {name: "contact_transport_nonprehensile", within: false, n: 25, L: 11, trained: false}, "Transport/holding": {name: "contact_transport_holding", within: true, n: 98, L: 23, trained: true}, "Transport/acquired": {name: "contact_transport_acquired", within: false, n: 44, L: 23, trained: false}}});

})();
(function () {
  const ns = "http://www.w3.org/2000/svg", INK = "#31353d", AX = "#5c616a", SL = "#5c616a";
  const C = {ours: ["#99accf", "#00528e"], pose: ["#dcdee1", "#7a7f87"], grasp: ["#7a7f87", "#31353d"], rej: ["#bbbec4", "#5c616a"], vf: ["#a78bbd", "#4a2468"]};
  const el = (p, t, a, x) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (x != null) e.textContent = x; p.appendChild(e); return e; };
  const mk = (W, H) => { const s = document.createElementNS(ns, "svg"); s.setAttribute("viewBox", `0 0 ${W} ${H}`); if (s.style) s.style.maxWidth = W + "px"; return s; };

  function bars(id, o) {
    const W = o.W || 760, H = 286, x0 = 56, x1 = W - 10, top = 30, bot = H - 40, sy = (v) => bot - v / o.ymax * (bot - top);
    const s = mk(W, H);
    el(s, "line", {x1: x0, x2: x0, y1: top - 6, y2: bot, stroke: AX});
    o.ticks.forEach((v) => { el(s, "line", {x1: x0 - 4, x2: x0, y1: sy(v), y2: sy(v), stroke: AX}); el(s, "text", {x: x0 - 8, y: sy(v) + 4, "text-anchor": "end", "font-size": 12, fill: SL}, v); });
    el(s, "text", {x: 0, y: 0, "text-anchor": "middle", "font-size": 13, fill: INK, transform: `translate(16,${(top + bot) / 2}) rotate(-90)`}, o.ylabel);
    const gw = (x1 - x0) / o.groups.length, bw = Math.min((gw * (W < 500 ? 0.9 : 0.68)) / o.series.length, 52), pad = (gw - bw * o.series.length) / 2;
    o.groups.forEach((g, gi) => {
      const labs = [];
      o.series.forEach(([, c, vals], bi) => {
        const val = vals[gi], x = x0 + gi * gw + pad + bi * bw + 3, w = bw - 6, cx = x + w / 2;
        if (val === null) return;
        const v = Array.isArray(val) ? val[0] : val, se = Array.isArray(val) ? val[1] : 0;
        const bar = el(s, "rect", {x, y: sy(v), width: w, height: bot - sy(v), fill: c[0], stroke: c[1], "stroke-width": 1.5});
        if (o.onClick && o.clickable(bi)) { bar.style.cursor = "pointer"; bar.setAttribute("role", "button"); bar.setAttribute("tabindex", "0"); bar.setAttribute("aria-label", `${g}: ${o.series[bi][0]}. View example.`); bar.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); o.onClick(gi, bi, bar); } }); bar.addEventListener("click", () => o.onClick(gi, bi, bar)); }
        if (se) { el(s, "line", {x1: cx, x2: cx, y1: sy(v - se), y2: sy(v + se), stroke: INK, "stroke-width": 1.2}); [v - se, v + se].forEach((e) => el(s, "line", {x1: cx - 4, x2: cx + 4, y1: sy(e), y2: sy(e), stroke: INK, "stroke-width": 1.2})); }
        labs.push(() => el(s, "text", {x: cx, y: sy(v + se) - 6, "text-anchor": "middle", "font-size": W < 500 ? 11 : 12.5, fill: INK, stroke: "#fff", "stroke-width": 4, "paint-order": "stroke"}, o.fmt(v)));
      });
      if (o.ref) { const ry = sy(o.ref[1][gi]), ra = x0 + gi * gw + pad - 6, rb = x0 + gi * gw + gw - pad + 6;
        el(s, "line", {x1: ra, x2: rb, y1: ry, y2: ry, stroke: "#fff", "stroke-width": 4});
        el(s, "line", {x1: ra, x2: rb, y1: ry, y2: ry, stroke: "#c9780f", "stroke-width": 2, "stroke-dasharray": "2 4", "stroke-linecap": "round"});
        el(s, "text", {x: ra - 4, y: ry + 4, "text-anchor": "end", "font-size": 12, fill: "#c9780f"}, o.ref[0]); }
      labs.forEach((f) => f());
      el(s, "text", {x: x0 + gi * gw + gw / 2, y: bot + 20, "text-anchor": "middle", "font-size": 14, fill: INK}, g);
    });
    el(s, "line", {x1: x0, x2: x1, y1: bot, y2: bot, stroke: AX});
    const host = document.getElementById(id); if (!host) return;
    host.appendChild(s);
    if (o.legend !== false) figLegend(id, o.series.map(([n, c]) => [n, c[0], c[1], "box"]));
  }
  const tasks = ["Can", "Square", "Transport"], one = (v) => v.toFixed(1), pct = (v) => v.toFixed(1) + " %";

  const TK = ["can", "square", "transport"], GROUPS = [["verifier", "Kept by verifier"], ["value", "Kept by value function"], ["rejected", "Rejected by verifier"]];
  let sel = null;
  function mark(bar) { if (sel) sel.setAttribute("stroke-width", sel.dataset.w); bar.dataset.w = bar.getAttribute("stroke-width"); bar.setAttribute("stroke-width", 3); sel = bar; }
  function vid(src, cap) { return `<figure><video src="${src}" controls muted loop playsinline autoplay preload="metadata"></video>${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`; }
  function open(id, title, html) {
    const box = document.getElementById(id); if (!box) return;
    box.querySelector("h4").textContent = title; box.querySelector(".s2-vids").innerHTML = html; box.hidden = false;
    box.querySelectorAll("video").forEach((v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); });
  }
  function showFilter(gi, type, bi, bar) {
    mark(bar);
    const [g, n] = GROUPS[bi];
    open("s2-viewer-filter", `${tasks[gi]} · ${n.toLowerCase()} · ${type === "grasp" ? "grasp error" : "pose error (gripper > 5 cm off)"}`, vid(`rebuttal/media/filter_${TK[gi]}_${type}_${g}.mp4`, ""));
  }
  function showComp(gi, k, seg) {
    mark(seg);
    const src = [`rebuttal/media/contact_${TK[gi]}_free_stitch_v3.mp4`, `rebuttal/media/filter_${TK[gi]}_pose_verifier.mp4`, `rebuttal/media/filter_${TK[gi]}_grasp_verifier.mp4`][k];
    open("s2-viewer-comp", `${tasks[gi]} · ${["within 5 cm, no grasp error", "pose error (> 5 cm)", "grasp error"][k]}`, vid(src, ""));
  }

  bars("fig-s2-swap", {W: 480, groups: ["Can", "Square", "Transport"], ymax: 100, ticks: [0, 25, 50, 75, 100], ylabel: "Success Rate (%)", fmt: one,
    series: [["Paper", C.ours, [[83.3, 2.9], [47.3, 1.8], [51.3, 2.4]]], ["Pose error", C.pose, [[71.3, 2.4], [38.0, 1.2], [48.0, 2.3]]],
             ["Grasp error", C.grasp, [[66.7, 1.8], [31.3, 1.8], [39.3, 3.5]]]], ref: ["DP", [72.0, 40.0, 47.3]]});

  bars("fig-s2-grasp", {W: 400, legend: false, clickable: (bi) => bi > 0, onClick: (gi, bi, bar) => showFilter(gi, "grasp", bi, bar), groups: tasks, ymax: 40, ticks: [0, 10, 20, 30, 40], ylabel: "Grasp errors (%)", fmt: one,
    series: [["Kept by verifier", C.ours, [8.0, 1.0, 4.7]], ["Kept by value function", C.vf, [19.3, 9.0, 18.7]], ["Rejected by verifier", C.rej, [27.3, 17.7, 31.7]]]});
  bars("fig-s2-pose", {W: 400, clickable: (bi) => bi > 0, onClick: (gi, bi, bar) => showFilter(gi, "pose", bi, bar), groups: tasks, ymax: 20, ticks: [0, 5, 10, 15, 20], ylabel: "Gripper landing error (cm)", fmt: one,
    series: [["Kept by verifier", C.ours, [2.85, 2.19, 3.46]], ["Kept by value function", C.vf, [4.29, 3.58, 10.05]], ["Rejected by verifier", C.rej, [6.38, 6.17, 17.16]]]});

  (function () {
    const rows = [["Can", 19.6, [81.0, 11.0, 8.0]], ["Square", 8.3, [93.3, 5.7, 1.0]], ["Transport", 6.5, [82.7, 12.7, 4.7]]];
    const cls = [["Within 5 cm, no grasp error", C.ours], ["Pose error (> 5 cm)", C.pose], ["Grasp error", C.grasp]];
    const W = 760, x0 = 100, x1 = 740, bh = 22, rowH = 112, H = 14 + rowH * rows.length, s = mk(W, H), sx = (v) => x0 + v / 100 * (x1 - x0);
    rows.forEach(([t, share, parts], i) => {
      const y = 14 + i * rowH;
      el(s, "text", {x: x0 - 12, y: y + 16, "text-anchor": "end", "font-size": 14, fill: INK}, t);
      el(s, "rect", {x: x0, y, width: x1 - x0, height: bh, fill: "#f6f7f8", stroke: "#bbbec4", "stroke-width": 1});
      el(s, "rect", {x: x0, y, width: sx(share) - x0, height: bh, fill: C.ours[1], stroke: C.ours[1], "stroke-width": 1});
      el(s, "text", {x: sx(share) + 8, y: y + 16, "font-size": 12.5, fill: INK}, `${share} % of training windows contain a bridge`);
      const y2 = y + bh + 30;
      el(s, "path", {d: `M${x0} ${y + bh}L${sx(share)} ${y + bh}L${x1} ${y2}L${x0} ${y2}Z`, fill: C.ours[0], opacity: 0.35});
      let acc = 0;
      parts.forEach((v, k) => {
        const [f, st] = cls[k][1], a = sx(acc), b = sx(acc + v);
        const segEl = el(s, "rect", {x: a, y: y2, width: b - a, height: bh, fill: f, stroke: st, "stroke-width": 1.2});
        segEl.style.cursor = "pointer"; segEl.setAttribute("role", "button"); segEl.setAttribute("tabindex", "0"); segEl.setAttribute("aria-label", `${t}: ${cls[k][0]}. View example.`); segEl.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showComp(i, k, segEl); } }); segEl.addEventListener("click", () => showComp(i, k, segEl));
        el(s, "text", {x: v < 6 ? b - 46 * parts.slice(k + 1).filter((u) => u < 6).length : (a + b) / 2, y: y2 + bh + 15, "text-anchor": v < 6 ? "end" : "middle", "font-size": 12, fill: INK}, v.toFixed(1) + " %");
        acc += v;
      });
    });
    const host = document.getElementById("fig-s2-comp"); if (!host) return;
    host.appendChild(s);
    figLegend("fig-s2-comp", [["Training windows with a bridge", C.ours[1], C.ours[1], "box"], ...cls.map(([n, c]) => [n, c[0], c[1], "box"])]);
  })();
})();
