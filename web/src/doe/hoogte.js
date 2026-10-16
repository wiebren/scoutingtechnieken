// Hoogtelijnen to a profile: a small made-up map with a hill that is steep on one side and gentle on the other, a
// lower hill beyond a saddle, and a valley with a beek. Drag the two ends of a line across it (or move them with
// the arrow keys) and the height along the line is drawn underneath, steep and flat named. The contours are drawn
// from the same ground the profile is measured on, so the two always agree.
import { h } from '../dom.js';
import './hoogte.css';

const NS = 'http://www.w3.org/2000/svg';
const B = 360; const H = 240;                   // the map, in units
const M = 3.2;                                  // metres per unit: the map is about 1150 by 770 m
const STAP = 2.5;                               // the equidistantie, as on the topografische kaart
const RUIM = 4;                                 // the grid the contours are traced on, in units
const STEIL = 0.1; const VLAK = 0.02;           // 10 m up per 100 m is steep, under 2 m flat

const p = (n) => Math.round(n * 10) / 10;
const getal = (n, d = 0) => n.toLocaleString('nl-NL', { maximumFractionDigits: d });
const bel = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2) / 2);

// the valley: a beek from the bottom edge up into the flank of the big hill
const DAL = [[300, 240], [258, 194], [206, 150]];
function naarDal(x, y) {
  let best = { d: Infinity, t: 0 };
  for (let i = 0; i < DAL.length - 1; i++) {
    const [[x1, y1], [x2, y2]] = [DAL[i], DAL[i + 1]];
    const lx = x2 - x1; const ly = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * lx + (y - y1) * ly) / (lx * lx + ly * ly)));
    const d = Math.hypot(x - x1 - t * lx, y - y1 - t * ly);
    if (d < best.d) best = { d, t: (i + t) / (DAL.length - 1) };
  }
  return best;
}

/** The height in metres above NAP at a point of the map. */
function hoogte(x, y) {
  const heuvels = 31 * bel(x, y, 118, 104, x < 118 ? 40 : 105, 62)     // steep to the west, gentle to the east
    + 15 * bel(x, y, 284, 66, 42, 38);
  // the valley cuts into the hills, not into the flat land around them: there the beek runs on the level
  const { d, t } = naarDal(x, y);
  return 4 + x * 0.012 + heuvels * (1 - 0.55 * (1 - 0.3 * t) * Math.exp(-((d / 13) ** 2) / 2));
}

/** The contour lines, traced once with marching squares: for each level a list of polylines. */
function hoogtelijnen() {
  const nx = B / RUIM; const ny = H / RUIM;
  const z = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) z[j * (nx + 1) + i] = hoogte(i * RUIM, j * RUIM);
  const zv = (i, j) => z[j * (nx + 1) + i];
  const max = Math.max(...z);
  const uit = [];
  for (let n = 1; n * STAP < max; n++) {
    const L = n * STAP;
    // a crossing on an edge has one name, so the pieces of two cells meet exactly: h for along, v for down
    const punt = (soort, i, j) => {
      const [a, b] = soort === 'h' ? [zv(i, j), zv(i + 1, j)] : [zv(i, j), zv(i, j + 1)];
      const t = (L - a) / (b - a);
      return { sleutel: `${soort}${i},${j}`, x: (i + (soort === 'h' ? t : 0)) * RUIM, y: (j + (soort === 'v' ? t : 0)) * RUIM };
    };
    const stukken = [];
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const k = (zv(i, j) > L) * 8 + (zv(i + 1, j) > L) * 4 + (zv(i + 1, j + 1) > L) * 2 + (zv(i, j + 1) > L);
        if (k === 0 || k === 15) continue;
        const e = { b: () => punt('h', i, j), r: () => punt('v', i + 1, j), o: () => punt('h', i, j + 1), l: () => punt('v', i, j) };
        const midden = (zv(i, j) + zv(i + 1, j) + zv(i + 1, j + 1) + zv(i, j + 1)) / 4 > L;
        const paren = {
          1: ['lo'], 2: ['or'], 3: ['lr'], 4: ['br'], 5: midden ? ['lb', 'or'] : ['lo', 'br'], 6: ['bo'], 7: ['lb'],
          8: ['lb'], 9: ['bo'], 10: midden ? ['br', 'lo'] : ['lb', 'or'], 11: ['br'], 12: ['lr'], 13: ['or'], 14: ['lo'],
        }[k];
        for (const [a, b] of paren) stukken.push([e[a](), e[b]()]);
      }
    }
    // join the pieces into lines: start at the open ends, then what is left are rings
    const bij = new Map();
    stukken.forEach((s, i) => { for (const q of s) bij.set(q.sleutel, [...(bij.get(q.sleutel) ?? []), i]); });
    const gedaan = new Set();
    const lijnen = [];
    const volg = (start, van) => {
      const lijn = [van];
      let i = start; let hier = van;
      while (i != null && !gedaan.has(i)) {
        gedaan.add(i);
        const volgende = stukken[i][0].sleutel === hier.sleutel ? stukken[i][1] : stukken[i][0];
        lijn.push(volgende);
        hier = volgende;
        i = bij.get(hier.sleutel).find((x) => !gedaan.has(x));
      }
      return lijn;
    };
    for (const [sleutel, lijst] of bij) if (lijst.length === 1 && !gedaan.has(lijst[0])) lijnen.push(volg(lijst[0], stukken[lijst[0]].find((q) => q.sleutel === sleutel)));
    stukken.forEach((s, i) => { if (!gedaan.has(i)) lijnen.push(volg(i, s[0])); });
    uit.push({ hoogte: L, lijnen });
  }
  return uit;
}

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function hoogteprofiel() {
  const punten = { A: [40, 150], B: [330, 52] };
  let actief = 'A';

  // -- the map: drawn once
  const kaart = s('g', { class: 'hp-kaart' });
  kaart.append(s('rect', { width: B, height: H, class: 'hp-grond' }));
  kaart.append(s('path', { d: `M${DAL.map(([x, y]) => `${x} ${y}`).join('L')}`, class: 'hp-beek' }));
  const labels = [];
  for (const { hoogte: L, lijnen } of hoogtelijnen()) {
    const soort = L % 10 === 0 ? 'tien' : L % 5 === 0 ? 'vijf' : 'half';
    const d = lijnen.map((l) => `M${l.map((q) => `${p(q.x)} ${p(q.y)}`).join('L')}`).join('');
    kaart.append(s('path', { d, class: `hp-lijn ${soort}` }));
    // the 10 m lines carry their height, halfway along their longest piece
    if (soort === 'tien') {
      const lang = lijnen.reduce((a, b) => (b.length > a.length ? b : a));
      const q = lang[Math.floor(lang.length / 2)];
      labels.push(s('text', { x: p(q.x), y: p(q.y), class: 'hp-hoogtegetal', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, String(L)));
    }
  }
  kaart.append(...labels);
  const schaal = 200 / M;
  kaart.append(s('path', { d: `M12 ${H - 12}h${p(schaal)}`, class: 'hp-schaal' }),
    s('text', { x: p(12 + schaal / 2), y: H - 18, class: 'hp-klein hp-halo', 'text-anchor': 'middle' }, '200 m'));

  const lijn = s('path', { class: 'hp-meetlijn' });
  const kruisingen = s('g', { class: 'hp-kruisingen' });
  const greep = (naam) => s('g', { class: 'hp-greep' }, s('circle', { r: 11, class: 'hp-greep-rond' }),
    s('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'hp-greep-letter' }, naam));
  const grepen = { A: greep('A'), B: greep('B') };

  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'hp-svg', role: 'img', tabindex: '0',
    'aria-label': 'Een verzonnen kaart met hoogtelijnen en een lijn van A naar B. Pijltjes verschuiven het gekozen punt; A en B kiezen het punt.' },
    kaart, lijn, kruisingen, grepen.A, grepen.B);

  // -- the profile underneath
  const PL = 34; const PR = 352; const PB = 10; const PO = 118;
  const raster = s('g', { class: 'hp-raster' });
  const vlak = s('path', { class: 'hp-profiel' });
  const profielStippen = s('g', { class: 'hp-stippen' });
  const band = s('g', { class: 'hp-band' });
  const woorden = s('g');
  const afstand = s('text', { x: PR, y: 146, class: 'hp-klein', 'text-anchor': 'end' });
  const overdreven = s('text', { x: PL, y: 146, class: 'hp-klein' });
  const profiel = s('svg', { viewBox: '0 0 360 152', class: 'hp-profielsvg', role: 'img', 'aria-label': 'Het hoogteprofiel van A naar B' },
    raster, vlak, profielStippen, band, woorden, afstand, overdreven,
    s('text', { x: PL, y: PO + 12, class: 'hp-klein', 'text-anchor': 'middle' }, 'A'),
    s('text', { x: PR, y: PO + 12, class: 'hp-klein', 'text-anchor': 'middle' }, 'B'));

  // -- the words
  const chips = ['A', 'B'].map((n) => h('button.chip', { type: 'button', 'aria-pressed': String(n === actief),
    onclick: () => { actief = n; teken(); } }, `Punt ${n}`));
  const stand = h('p.hp-stand', { 'aria-live': 'polite' });
  const el = h('div.doe-hoogte',
    h('div.hp-beeld', svg, profiel),
    h('div.hp-tekst',
      h('p.hp-uitleg', 'Sleep A en B over de kaart. Onder de kaart zie je hoe hoog het is langs de lijn.'),
      h('div.chips', { role: 'group', 'aria-label': 'Welk punt verschuiven de pijltjes?' }, chips),
      stand,
      h('p.hp-noot', 'Om de 2,5 m hoogte een lijn, de lijn van elke 10 m het dikst, zoals op de topografische kaart. Liggen ze dicht bij elkaar, dan is het steil.')));

  // -- drawing
  function teken(vertel = true) {
    const [[ax, ay], [bx, by]] = [punten.A, punten.B];
    for (const [n, g] of Object.entries(grepen)) {
      g.setAttribute('transform', `translate(${p(punten[n][0])} ${p(punten[n][1])})`);
      g.classList.toggle('actief', n === actief);
    }
    chips.forEach((c, i) => c.setAttribute('aria-pressed', String('AB'[i] === actief)));
    lijn.setAttribute('d', `M${p(ax)} ${p(ay)}L${p(bx)} ${p(by)}`);

    // the heights along the line, and where it crosses a contour
    const N = 160;
    const lengte = Math.hypot(bx - ax, by - ay) * M;
    const z = Array.from({ length: N + 1 }, (_, i) => hoogte(ax + ((bx - ax) * i) / N, ay + ((by - ay) * i) / N));
    const kruis = [];
    for (let i = 0; i < N; i++) {
      const [a, b] = [z[i], z[i + 1]];
      for (let n = Math.ceil(Math.min(a, b) / STAP); n * STAP <= Math.max(a, b) && a !== b; n++) {
        if (n * STAP === Math.min(a, b) && i > 0) continue;
        kruis.push((i + (n * STAP - a) / (b - a)) / N);
      }
    }
    kruisingen.replaceChildren(...kruis.map((t) => s('circle', { cx: p(ax + (bx - ax) * t), cy: p(ay + (by - ay) * t), r: 2.2 })));

    const laag = Math.floor(Math.min(...z) / 10) * 10;
    const hoog = Math.max(laag + 20, Math.ceil(Math.max(...z) / 10) * 10);
    const px = (t) => PL + t * (PR - PL);
    const py = (m) => PO - ((m - laag) / (hoog - laag)) * (PO - PB);
    raster.replaceChildren();
    for (let m = laag; m <= hoog; m += 5) {
      raster.append(s('path', { d: `M${PL} ${p(py(m))}H${PR}`, class: m % 10 ? 'dun' : '' }));
      if (m % 10 === 0) raster.append(s('text', { x: PL - 5, y: p(py(m)), 'text-anchor': 'end', 'dominant-baseline': 'central' }, `${m} m`));
    }
    const lijnPunten = z.map((m, i) => `${p(px(i / N))} ${p(py(m))}`);
    vlak.setAttribute('d', `M${PL} ${PO}L${lijnPunten.join('L')}L${PR} ${PO}Z`);
    profielStippen.replaceChildren(...kruis.map((t) => s('circle', { cx: p(px(t)), cy: p(py(Math.round(hoogteOp(z, t) / STAP) * STAP)), r: 2 })));

    // steep, sloping or flat, piece by piece, and the longest stretch of steep and of flat named
    const stuk = lengte / N;
    const soort = z.slice(1).map((m, i) => {
      const helling = stuk ? Math.abs(m - z[i]) / stuk : 0;
      return helling >= STEIL ? 'steil' : helling < VLAK ? 'vlak' : 'glooiend';
    });
    const stukken = [];
    soort.forEach((x, i) => { if (stukken.at(-1)?.soort === x) stukken.at(-1).tot = i + 1; else stukken.push({ soort: x, van: i, tot: i + 1 }); });
    band.replaceChildren(...stukken.map((x) => s('rect', { x: p(px(x.van / N)), y: PO + 3, width: p(((x.tot - x.van) / N) * (PR - PL)), height: 6, class: x.soort })));
    woorden.replaceChildren();
    for (const naam of ['steil', 'vlak']) {
      const langste = stukken.filter((x) => x.soort === naam).reduce((a, b) => (!a || b.tot - b.van > a.tot - a.van ? b : a), null);
      if (langste && langste.tot - langste.van >= 8) {
        woorden.append(s('text', { x: p(px((langste.van + langste.tot) / 2 / N)), y: PO + 20, class: `hp-woord ${naam}`, 'text-anchor': 'middle' }, naam));
      }
    }
    afstand.textContent = `${getal(Math.round(lengte / 10) * 10)} m`;
    const keer = (PO - PB) / (hoog - laag) / ((PR - PL) / Math.max(lengte, 1));
    overdreven.textContent = lengte > 0 ? `hoogte ${getal(Math.round(keer))} × overdreven` : '';

    if (!vertel) return;
    let steilste = 0;
    for (let i = 4; i <= N; i += 4) steilste = Math.max(steilste, Math.abs(z[i] - z[i - 4]) / (stuk * 4 || 1));
    stand.replaceChildren(
      `Van A naar B is ${getal(Math.round(lengte / 10) * 10)} m. A ligt op ${getal(z[0], 1)} m, B op ${getal(z[N], 1)} m; `,
      `onderweg is het hoogste punt ${getal(Math.max(...z), 1)} m en het laagste ${getal(Math.min(...z), 1)} m. `,
      `Je kruist ${kruis.length} hoogtelijn${kruis.length === 1 ? '' : 'en'}. `,
      steilste >= STEIL ? `Op het steilste stuk gaat het ${getal(Math.round(steilste * 100))} m omhoog of omlaag per 100 m.`
        : steilste < VLAK ? 'Het is overal vlak.' : `Het is nergens steil: hoogstens ${getal(Math.round(steilste * 100))} m per 100 m.`);
  }
  const hoogteOp = (z, t) => { const i = Math.min(z.length - 2, Math.floor(t * (z.length - 1))); const f = t * (z.length - 1) - i; return z[i] + (z[i + 1] - z[i]) * f; };

  function zet(naam, x, y) {
    punten[naam] = [Math.max(0, Math.min(B, x)), Math.max(0, Math.min(H, y))];
  }

  // -- dragging: the nearest end follows the finger
  let sleep = false;
  const plek = (e) => {
    const r = svg.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * B, ((e.clientY - r.top) / r.height) * H];
  };
  svg.addEventListener('pointerdown', (e) => {
    const [x, y] = plek(e);
    actief = Math.hypot(x - punten.A[0], y - punten.A[1]) <= Math.hypot(x - punten.B[0], y - punten.B[1]) ? 'A' : 'B';
    sleep = true;
    stand.setAttribute('aria-live', 'off');
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
    zet(actief, x, y);
    teken(false);
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    zet(actief, ...plek(e));
    teken(false);
  });
  const los = () => {
    if (!sleep) return;
    sleep = false;
    svg.classList.remove('sleept');
    stand.setAttribute('aria-live', 'polite');
    teken();
  };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'b' || e.key === 'A' || e.key === 'B') { actief = e.key.toUpperCase(); teken(); return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    const stap = e.shiftKey ? 10 : 2;
    zet(actief, punten[actief][0] + d[0] * stap, punten[actief][1] + d[1] * stap);
    teken();
  });

  teken();
  return el;
}
