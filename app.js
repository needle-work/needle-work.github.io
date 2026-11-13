const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));


function loadVideo(v) {
  if (v.dataset.loaded) return;
  v.src = v.dataset.src;
  v.dataset.loaded = '1';
  v.addEventListener('error', () => {
    const d = document.createElement('div');
    d.className = 'media-error';
    d.textContent = 'This video could not be loaded: ' + v.dataset.src;
    v.replaceWith(d);
  });
}
const simObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target;
    if (!v.dataset.src) return;
    if (e.isIntersecting) { loadVideo(v); v.play().catch(() => {}); } else { v.pause(); }
  });
}, { threshold: 0.35 });
function watchVideos() { $$('video.sim-video').forEach((v) => { if (!v.dataset.watched) { v.dataset.watched = '1'; simObserver.observe(v); } }); }

function setActive(button) {
  $$('button', button.parentElement).forEach((b) => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });
}


const C = { blue: '#356fb0', blueDk: '#00528e', blueLt: '#99accf', amber: '#eb993f', amberDk: '#c9780f', amberLt: '#ffead9', slate: '#7a7f87', slateLt: '#bbbec4', slateDk: '#5c616a', ink: '#31353d', magenta: '#c97db6', teal: '#2cb0c0', green: '#35864a' };
const mix = (hex, to, t) => { const a = hex.match(/\w\w/g).map((h) => parseInt(h, 16)), b = to.match(/\w\w/g).map((h) => parseInt(h, 16)); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const pair = (base) => [mix(base, '#ffffff', 0.44), mix(base, '#000000', 0.25)];

const METHOD_COLORS = { DP: [C.amberLt, C.amberDk], SBR: pair('#F5AEA2'), AWR: pair('#D65C74'), IDQL: pair('#A63D84'), SARM: pair('#62308A'), MBTS: pair('#26204A'), Ours: [C.blueLt, C.blueDk] };

const RR_COL = { DP: [C.amberLt, C.amberDk], AWR: [C.slateLt, C.slateDk], Ours: [C.blueLt, C.blueDk] };
const RAMP = ['#F5AEA2', '#D65C74', '#A63D84', '#62308A', '#26204A'].map(pair);
const NAME = (m) => (m === 'Ours' ? 'NEEDLE' : m);


const TASK_NAME = { sweater: 'Sweater folding', dish: 'Dish racking' };
const CLIPS = {
  'clips-success': [
    { task: 'dish', file: 'dish_baseline_vs_ours', panels: 2, text: 'The baseline hovers over the rim but never closes and lifts the plate; the trial ends with the plate still on the table. NEEDLE lifts it on the first grasp, hands it across, and seats it on the dish rack.' },
    { task: 'sweater', file: 'sweater_baseline_vs_ours', panels: 2, text: 'The baseline folds and unfolds the right sleeve over and over, five times in a row, without ever moving on. NEEDLE folds both sleeves and then the body directly.' },
  ],
  'clips-time': [
    { task: 'dish', file: 'dish_faster_all3', panels: 3, text: 'All three seat the plate on the dish rack. NEEDLE lifts the plate first and finishes in 38 s; AWR takes 45 s; DP holds its gripper at the rim for 27 s before lifting, then hovers above the rack, and takes 75 s.' },
    { task: 'sweater', file: 'sweater_faster_all3', panels: 3, text: 'All three complete the fold. NEEDLE finishes in 62 s. AWR reaches toward the second sleeve, pulls back, and only then folds it, finishing in 75 s. DP folds the second sleeve, opens it again, and folds it a second time, finishing in 78 s.' },
  ],
  'clips-loops': [
    { task: 'dish', file: 'dish_repeats_all3', panels: 3, text: 'DP hovers over the plate for 54 s before lifting it, hovers again above the rack, and finally sets the plate down beside it. AWR hovers over the rim but never closes and lifts the plate. NEEDLE lifts on the first grasp and racks the plate in 41 s.' },
    { task: 'sweater', file: 'sweater_repeats_all3', panels: 3, text: 'DP lifts the same sleeve and drops it four times; AWR folds it over and lets it fall open five times. Neither moves on. NEEDLE folds both sleeves and the body.' },
  ],
};
function renderClips() {
  Object.keys(CLIPS).forEach((rootId) => {
    const root = $('#' + rootId);
    CLIPS[rootId].forEach((c) => {
      const fig = document.createElement('figure');
      fig.className = 'clip';
      fig.innerHTML = `<div class="task-line"><b>${TASK_NAME[c.task]}</b><span class="speed">2× playback · each panel pauses briefly at marked moments</span></div>` +
        `<div class="frame" style="aspect-ratio:${c.panels}/1">` +
        `<video class="sim-video" controls muted loop playsinline preload="none" data-src="assets/media/real/${c.file}.mp4?v=9" aria-label="${TASK_NAME[c.task]} comparison"></video></div>` +
        `<figcaption>${c.text}</figcaption>`;
      root.appendChild(fig);
    });
  });
}
renderClips();


const RR = {
  sweater: { DP: { n: 36, t: 73.62, se: 3.42 }, AWR: { n: 29, t: 80.08, se: 2.77 }, Ours: { n: 48, t: 65.60, se: 0.80 } },
  dish: { DP: { n: 34, t: 53.09, se: 2.73 }, AWR: { n: 35, t: 38.64, se: 1.42 }, Ours: { n: 44, t: 41.17, se: 0.93 } },
};
const POLICIES = ['DP', 'AWR', 'Ours'];
function rrBars(task, key) {
  return [{ label: '', bars: POLICIES.map((m) => ({ name: m, task, label: NAME(m), value: key === 'succ' ? RR[task][m].n * 2 : RR[task][m].t, sem: key === 'time' ? RR[task][m].se : 0, inside: key === 'succ' ? `${RR[task][m].n}/50` : null, color: RR_COL[m][0], edge: RR_COL[m][1] })) }];
}
const BAR = { width: 520, height: 330, font: 1.5, barFrac: 0.72 };
['sweater', 'dish'].forEach((task) => {
  Charts.groupedBars($(`#rr-${task}-success`), rrBars(task, 'succ'), Object.assign({}, BAR, { title: TASK_NAME[task], ymin: 0, ymax: 100, ystep: 25, fmt: (v) => v + '%', onClick: (b) => { showGrid(b.task, b.name); $('#all-trials').scrollIntoView({ block: 'start' }); } }));
  Charts.groupedBars($(`#rr-${task}-time`), rrBars(task, 'time'), Object.assign({}, BAR, { title: TASK_NAME[task], ymin: 0, ymax: 100, ystep: 25, fmt: (v) => v.toFixed(1) + ' s' }));
});


fetch('assets/data/real_robot.json?v=2').then((r) => { if (!r.ok) throw new Error(`Real-robot data request failed: ${r.status}`); return r.json(); }).then((RD) => {
  ['dish', 'sweater'].forEach((task) => {

    const xmax = task === 'dish' ? 90 : 120;
    Charts.completionCurves($(`#rr-${task}-budget`), POLICIES.map((m) => { const c = RD.completion_fit.curves[`${task}/${m}`]; return { name: m, color: RR_COL[m][1], x: c.x, y: c.y, final: c.y[c.y.length - 1], width: m === 'Ours' ? 2.8 : 2.2 }; }), { width: 520, height: 340, font: 1.5, title: TASK_NAME[task], xmax, xstep: 30, rightPad: 52, xlabel: 'Time limit (s)', ylabel: 'Trials completed' });
  });
  Charts.legend($('#rr-budget-legend'), POLICIES.map((m) => ({ label: NAME(m), color: RR_COL[m][1], line: true })));


  const CHECK = { dish: ['Start', 'Lift', 'Hand Off', 'Rack'], sweater: ['Start', 'Sleeve 1', 'Sleeve 2', 'Bottom'] };

  const STEPS = { dish: [['pickup'], ['handoff'], ['rack_placement']], sweater: [['not_started', 'first_sleeve'], ['second_sleeve'], ['body_fold']] };
  ['dish', 'sweater'].forEach((task) => {
    const series = POLICIES.map((m) => {
      const alive = [50]; const drops = [null];
      STEPS[task].forEach((group, gi) => {
        const n = group.reduce((a, st) => a + (RD.stages[`${task}/${m}`][st] || 0), 0);
        const st = group[group.length - 1];
        alive.push(alive[alive.length - 1] - n);
        drops.push({ n, aria: `${NAME(m)}, ${TASK_NAME[task]}: ${n} trials failed at ${CHECK[task][gi + 1]}. Play an example.`,
                     data: { key: `${task}/${m}/${st}`, policy: m, task, stage: CHECK[task][gi + 1], n, ex: RD.examples[`${task}/${m}/${st}`] || RD.examples[`${task}/${m}/${group[0]}`] } });
      });
      return { name: m, color: RR_COL[m][1], alive, drops, emph: m === 'Ours' };
    });
    Charts.progressLines($(`#rr-stages-${task}`), { checkpoints: CHECK[task], series }, { width: 520, height: 280, font: 1.5, title: TASK_NAME[task], labelMin: 7, onSelect: selectStacked });
  });
  Charts.legend($('#rr-stages-legend'), POLICIES.map((m) => ({ label: NAME(m), color: RR_COL[m][1], line: true })));

  const pick = (task, m, st, stage) => selectFailure({ key: `${task}/${m}/${st}`, policy: m, task, stage, ex: RD.examples[`${task}/${m}/${st}`],
    n: st === 'first_sleeve' ? (RD.stages[`${task}/${m}`].not_started || 0) + RD.stages[`${task}/${m}`].first_sleeve : RD.stages[`${task}/${m}`][st] },
    $(`#rr-stages-${task} .seg[data-key="${task}/${m}/${st}"]`));
  pick('dish', 'DP', 'rack_placement', 'Rack');
  pick('sweater', 'AWR', 'first_sleeve', 'Sleeve 1');
  window.addEventListener('resize', () => ['dish', 'sweater'].forEach(drawFailureLink));
  if (document.fonts) document.fonts.ready.then(() => ['dish', 'sweater'].forEach(drawFailureLink));
}).catch((e) => { console.error(e); const d = document.createElement('p'); d.className = 'media-error'; d.textContent = 'Real-robot trial data could not be loaded.'; $('#real-robot .wrap').appendChild(d); });


const failSel = { dish: null, sweater: null };

function selectStacked(d, c) {
  const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'), r = +c.getAttribute('r');
  const stack = [...c.ownerSVGElement.querySelectorAll('circle.seg')].filter((o) => +o.getAttribute('cx') === cx && Math.abs(+o.getAttribute('cy') - cy) < 1.6 * r).reverse();
  const cur = failSel[d.task];
  if (stack.length > 1 && stack.includes(cur)) { const nxt = stack[(stack.indexOf(cur) + 1) % stack.length]; selectFailure(nxt.__data, nxt); return; }
  selectFailure(d, c);
}
function selectFailure(d, rect) {
  if (!d.ex) return;
  failSel[d.task] = rect;
  $$(`#rr-stages-${d.task} .seg`).forEach((r) => r.classList.toggle('selected', r === rect));
  const box = $(`#fail-viewer-${d.task}`);
  box.querySelector('h4').textContent = `${NAME(d.policy)} · Failed at ${d.stage}`;
  box.querySelector('.fv-count').textContent = `${d.n} of 50 trials failed here · example: ${d.ex.duration_s} s · 2× speed`;
  const v = box.querySelector('video');
  const clip = `${d.ex.clip}?v=2`;
  if (v.dataset.src !== clip) { v.pause(); v.dataset.src = clip; delete v.dataset.loaded; loadVideo(v); v.load(); }
  v.play().catch(() => {});
  drawFailureLink(d.task);
}
function drawFailureLink(task) {
  const box = $(`#fail-viewer-${task}`), sel = failSel[task];
  if (!box || !sel) return;
  const col = box.closest('.chart'), svg = col.querySelector('svg.fv-link');
  const A = col.getBoundingClientRect(), s = sel.getBoundingClientRect(), v = box.getBoundingClientRect();
  if (!s.width) { svg.innerHTML = ''; return; }
  svg.setAttribute('width', A.width); svg.setAttribute('height', A.height);

  const x1 = s.left + s.width / 2 - A.left, y1 = s.bottom - A.top + 2;
  const x2 = Math.min(Math.max(x1, v.left - A.left + 40), v.right - A.left - 40), y2 = v.top - A.top - 2;
  const my = (y1 + y2) / 2;
  svg.innerHTML = `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="#8a9099" stroke-width="1.3" stroke-dasharray="4 4" opacity=".75"/>` +
    `<circle cx="${x1}" cy="${y1}" r="3" fill="#8a9099"/><path d="M${x2 - 5},${y2 - 7} L${x2},${y2} L${x2 + 5},${y2 - 7}" fill="none" stroke="#8a9099" stroke-width="1.3"/>`;
}


const gridState = { task: 'dish', policy: 'Ours' };
function showGrid(task, policy) {
  gridState.task = task; gridState.policy = policy;
  $$('[data-grid-task]').forEach((b) => { const on = b.dataset.gridTask === task; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  $$('[data-grid-policy]').forEach((b) => { const on = b.dataset.gridPolicy === policy; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  const root = $('#all-trials');
  const v = root.querySelector('.grid-video');
  const file = `assets/media/real/grid_${task}_${policy.toLowerCase()}.mp4?v=2`;
  if (v.dataset.src !== file) { v.pause(); v.dataset.src = file; delete v.dataset.loaded; loadVideo(v); v.load(); }
  v.play().catch(() => {});
  root.querySelector('.grid-title').textContent = `${NAME(policy)} · ${TASK_NAME[task].toLowerCase()} · ${RR[task][policy].n}/50 succeed`;
}
$$('[data-grid-task]').forEach((b) => b.addEventListener('click', () => showGrid(b.dataset.gridTask, gridState.policy)));
$$('[data-grid-policy]').forEach((b) => b.addEventListener('click', () => showGrid(gridState.task, b.dataset.gridPolicy)));
showGrid('dish', 'Ours');


const whyCaptions = {
  within: 'The demonstration reaches the target state again after a detour from the source state. A bridge from source to target skips the detour, and the recorded actions from the target complete the task. The robot views are rendered in the Square simulator to illustrate the idea.',
  across: 'Demonstration A still has a long way to go from the source state; demonstration B is direct from a similar target state. A bridge from source to target borrows B\'s ending.',
  failure: 'Demonstration A drops the nut after the source state and the trajectory ends in failure. A bridge from the source to a target state on a successful demonstration gives the policy a way out.',
};
$$('[data-why]').forEach((button) => button.addEventListener('click', () => {
  setActive(button);
  const video = $('#why-video');
  const name = `why_${button.dataset.why}`;
  video.pause();
  video.poster = `assets/media/${name}.jpg?v=17`;
  video.dataset.src = `assets/media/${name}.mp4?v=17`;
  delete video.dataset.loaded;
  loadVideo(video);
  video.load();
  video.play().catch(() => {});
  // the tab's name leads the caption in bold, so the caption visibly changes with the tab
  $('#why-caption').replaceChildren(Object.assign(document.createElement('b'), { textContent: `${button.textContent}.` }), ` ${whyCaptions[button.dataset.why]}`);
}));


const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
fetch('assets/data/results.json?v=9').then((r) => { if (!r.ok) throw new Error(`Result data request failed: ${r.status}`); return r.json(); }).then((D) => {
  const rm = D.robomimic;
  const oursIdx = rm.methods.indexOf('Ours'), dpIdx = rm.methods.indexOf('DP');
  const meanGain = (reference) => (rm.tasks.reduce((sum, task) => sum + rm.success[task][oursIdx][0] - reference(rm.success[task]), 0) / rm.tasks.length).toFixed(1);
  $('#sim-gain-dp').textContent = meanGain((values) => values[dpIdx][0]);
  $('#sim-gain-best').textContent = meanGain((values) => Math.max(...values.filter((_, i) => i !== oursIdx).map((v) => v[0])));
  const panel = (rootId, key, task, opts) => {
    const box = document.createElement('div');
    box.className = 'chart';
    $(rootId).appendChild(box);
    const bars = [{ label: '', bars: rm.methods.map((m, mi) => ({ name: m, value: rm[key][task][mi][0], sem: rm[key][task][mi][1], color: METHOD_COLORS[m][0], edge: METHOD_COLORS[m][1] })) }];
    Charts.groupedBars(box, bars, Object.assign({ width: 340, height: 260, title: task, refLine: [rm[key][task][oursIdx][0]], values: true, font: 1.15 }, opts));
  };

  rm.tasks.forEach((task) => { const top = Math.max(...rm.success[task].map((v) => v[0] + v[1])); const ymax = top > 60 ? 100 : 60; panel('#sim-success', 'success', task, { ymin: 0, ymax, ystep: ymax / 4 }); });
  rm.tasks.forEach((task) => {
    const lo = Math.min(...rm.steps[task].map((v) => v[0] - v[1])), hi = Math.max(...rm.steps[task].map((v) => v[0] + v[1]));
    const span = hi - lo, step = span > 60 ? 30 : 20, ymin = Math.floor((lo - 0.3 * span) / step) * step, ymax = ymin + step * 4 >= hi + 0.15 * span ? ymin + step * 4 : ymin + step * 5;
    panel('#sim-steps', 'steps', task, { ymin, ymax, ystep: step, axisBreak: true });
  });
  Charts.legend($('#sim-legend'), rm.methods.map((m) => ({ label: NAME(m), color: METHOD_COLORS[m][0], edge: METHOD_COLORS[m][1] })));


  const A = D.ablations;
  const ablPanels = (rootId, rows, labelW, glyphs, rampOffset = 0) => {
    const box = document.createElement('div');
    box.className = 'chart wide';
    $(rootId).appendChild(box);
    const STAGE_LABEL = { s1: 'NEEDLE (S1)', s2: 'NEEDLE (S2)', s3: 'NEEDLE (S3)', s1s2: 'NEEDLE (S1+S2)' };
    const labels = rows.map((r) => ({ label: STAGE_LABEL[r.key] || r.label, glyph: glyphs ? r.key : null }))
      .concat([{ label: glyphs ? 'NEEDLE' : 'NEEDLE (S1+S2+S3)', emph: true, separatorAfter: true, glyph: glyphs ? 'default' : null }, { label: 'DP', emph: true }]);
    const panels = ['can', 'square', 'transport'].map((t) => {
      const T = cap(t);
      const full = rm.success[T][oursIdx];
      const [xmax, xstep] = t === 'can' ? [100, 25] : [60, 15];  // matches the main Robomimic figure's success axes
      return { title: T, xmax, xstep, rows: rows.map((r, i) => ({ value: r.values[t] ? r.values[t][0] : 0, sem: r.values[t] ? r.values[t][1] : 0, missing: !r.values[t], color: RAMP[i + rampOffset][0], edge: RAMP[i + rampOffset][1] })).concat([
        { value: full[0], sem: full[1], color: METHOD_COLORS.Ours[0], edge: METHOD_COLORS.Ours[1] },
        { value: rm.success[T][dpIdx][0], sem: rm.success[T][dpIdx][1], color: METHOD_COLORS.DP[0], edge: METHOD_COLORS.DP[1] },
      ]) };
    });
    Charts.hbarPanels(box, { labels, panels }, { width: glyphs ? 1100 : 1040, labelW, rowH: glyphs ? 50 : 28, glyphW: glyphs ? 300 : 0 });
  };
  ablPanels('#abl-stage-charts', A.rows.stage, 190, false);
  ablPanels('#abl-sampling-charts', A.rows.sampling, 300, false);
  ablPanels('#abl-bridge-charts', A.rows.bridge, 190, false, 4);  // same dark shade as the paper's bridge-ablation row


  const V = D.verifier;
  const tasks = ['can', 'square', 'transport'];
  Charts.groupedBars($('#ver-ablation'), tasks.map((t) => ({ label: cap(t), bars: [{ name: 'on', value: V.ablation[t].on, sem: V.ablation[t].on_sem, color: C.blueLt, edge: C.blueDk }, { name: 'off', value: V.ablation[t].off, sem: V.ablation[t].off_sem, color: C.slateLt, edge: C.slateDk }] })), { width: 520, height: 300, title: 'With and without verification', ymax: 100, ystep: 25, font: 1.2, fmt: (v) => v.toFixed(1), refLine: tasks.map((t) => V.ablation[t].dp), refColor: C.amberDk });
  Charts.legend($('#ver-ablation'), [{ label: 'With Verification (NEEDLE)', color: C.blueLt, edge: C.blueDk }, { label: 'Without Verification', color: C.slateLt, edge: C.slateDk }, { label: 'DP', color: C.amberDk, line: true }]);
  const alts = [['same_ep_later', 'Same Episode, Later Actions'], ['other_ep_random', 'Another Episode, Random Moment'], ['other_ep_phase', 'Another Episode, Same Task Stage'], ['other_ep_nearest', 'Another Episode, Closest Arm Pose']];
  let html = '<table class="results-table"><thead><tr><th scope="col">Substitute Actions</th><th scope="col">Can</th><th scope="col">Square</th><th scope="col">Transport</th></tr></thead><tbody>';
  alts.forEach(([k, label]) => { html += `<tr><th scope="row">${label}</th>` + tasks.map((t) => `<td>${V.auroc_raw[t].per_alt[k].auroc_gt_vs_alt.toFixed(2)}</td>`).join('') + '</tr>'; });
  html += '</tbody></table><p class="small-note" style="margin:8px 0 0 4px">1,500 held-out source–target pairs per task; substitutes get harder from top to bottom.</p>';
  $('#ver-auroc').innerHTML = html;
  const cdfRoot = $('#ver-cdf');
  tasks.forEach((t) => {
    const box = document.createElement('div');
    box.className = 'chart';
    cdfRoot.appendChild(box);
    Charts.lines(box, [{ name: 'accepted', color: C.blue, x: V.grid_cm, y: V.cdf[t].accepted, width: 2.6 }, { name: 'rejected', color: C.slateDk, x: V.grid_cm, y: V.cdf[t].rejected, width: 1.8 }], { width: 340, height: 270, title: cap(t), font: 1.15, xlabel: 'Distance to target after the bridge (cm)', ylabel: 'Fraction of bridges', ymax: 1.0, xmax: 15 });
  });
  Charts.legend($('#cdf-legend'), [{ label: 'Accepted by the Verifier', color: C.blue, line: true }, { label: 'Rejected by the Verifier', color: C.slateDk, line: true }]);
}).catch((e) => { console.error(e); const d = document.createElement('p'); d.className = 'media-error'; d.textContent = 'Result data could not be loaded.'; $('#simulation .wrap').appendChild(d); });

watchVideos();

$$('details.ablation').forEach((d) => d.addEventListener('toggle', () => {
  if (!d.open) return;
  $$('video.sim-video', d).forEach((v) => { loadVideo(v); v.play().catch(() => {}); });
}));
