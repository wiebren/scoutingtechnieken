// Routes on the map with RD coordinates. A piece of map of 3 by 2 km with its kilometre lines.
// - coordinaten: find each coordinate of the route ("huisje in, trapje op") and set a marker; the route appears.
// - kruispeiling: find four coordinates w, x, y, z; the lines w–x and y–z cross at the post. Tap the crossing.
// - passer: three points, each with a distance; draw their circles with the compasses and tap where they meet.
// A coordinate like 113.52 – 398.64 is km line 113, then 52 hundredths (520 m) to the east; km line 398, then 64
// hundredths to the north. The marker can be nudged by 10 m: a hundredth.
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './coordinaten.css';

const X0 = 112; const Y0 = 398;               // the south-west corner, in km
const KM = 110; const L = 34; const T = 12;   // pixels per km, left and top margin
const B = L + 3 * KM + 12; const H = T + 2 * KM + 26;
const TOL = 0.03;                             // 30 m
const r1 = (n) => Math.round(n * 10) / 10;
const px = ([x, y]) => [r1(L + (x - X0) * KM), r1(T + (Y0 + 2 - y) * KM)];
const km = ([a, b]) => [X0 + (a - L) / KM, Y0 + 2 - (b - T) / KM];
const fmt = ([x, y]) => `${x.toFixed(2)} – ${y.toFixed(2)}`;
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rond = (v) => Math.round(v * 100) / 100;
const willekeurig = (rand = 0.15) => [rond(X0 + rand + Math.random() * (3 - 2 * rand)), rond(Y0 + rand + Math.random() * (2 - 2 * rand))];

function snijpunt([p1, p2], [p3, p4]) {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  const u = -((p1[0] - p2[0]) * (p1[1] - p3[1]) - (p1[1] - p2[1]) * (p1[0] - p3[0])) / d;
  return t > 0.15 && t < 0.85 && u > 0.15 && u < 0.85 ? [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])] : null;
}

/** What to find, per kind. */
function opgave(soort) {
  if (soort === 'kruispeiling') {
    for (;;) {
      const [w, x, y, z] = [willekeurig(), willekeurig(), willekeurig(), willekeurig()];
      const p = snijpunt([w, x], [y, z]);
      if (p && afstand(w, x) > 1.2 && afstand(y, z) > 1.2) return { punten: [['w', w], ['x', x], ['y', y], ['z', z]], doel: p };
    }
  }
  if (soort === 'passer') {
    for (;;) {
      const doel = willekeurig(0.4); const punten = [willekeurig(0.1), willekeurig(0.1), willekeurig(0.1)];
      const ok = punten.every((p, i) => afstand(p, doel) > 0.6 && punten.every((q, j) => i === j || afstand(p, q) > 0.9));
      if (ok) return { punten: punten.map((p, i) => ['ABC'[i], p, Math.round(afstand(p, doel) * 100) * 10]), doel };
    }
  }
  for (;;) {
    const punten = Array.from({ length: 4 }, willekeurig);
    if (punten.every((p, i) => i === 0 || afstand(p, punten[i - 1]) > 0.6)) return { punten: punten.map((p, i) => ['ABCD'[i], p]) };
  }
}

export default function coordinaten({ soort = 'coordinaten' } = {}) {
  let og; let stap; let marker; let gevonden; let cirkels; let klaar;

  const kaart = s('g'); const hulp = s('g'); const lagen = s('g'); const markerG = s('g');
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'co-svg', tabindex: '0', role: 'application' }, kaart, lagen, hulp, markerG);
  const opdracht = h('p.co-opdracht');
  const lijst = h('ol.co-lijst');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const schuif = (dx, dy) => () => { if (marker) { marker = [rond(marker[0] + dx), rond(marker[1] + dy)]; tekenMarker(); stand.textContent = 'Een stapje van 10 meter.'; } };
  const pijlen = h('div.co-pijlen', { role: 'group', 'aria-label': 'Schuif de marker 10 meter' },
    h('button.knop.klein', { type: 'button', 'aria-label': 'Naar links', onclick: schuif(-0.01, 0) }, '◀'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Omhoog', onclick: schuif(0, 0.01) }, '▲'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Omlaag', onclick: schuif(0, -0.01) }, '▼'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Naar rechts', onclick: schuif(0.01, 0) }, '▶'));
  const controleer = h('button.knop.hoofd', { type: 'button', onclick: () => check() }, 'Hier is het');
  const opnieuw = h('button.knop', { type: 'button', onclick: () => begin() }, 'Nieuwe opgave');

  const el = h('div.doe-coordinaten',
    h('div.co-boven', lijst, opdracht),
    svg,
    h('div.co-bediening', pijlen, controleer),
    melding, stand, h('div.knop-rij', opnieuw));

  function tekenKaart() {
    kaart.replaceChildren(s('rect', { x: L, y: T, width: 3 * KM, height: 2 * KM, class: 'co-grond' }),
      s('path', { d: `M${L + 30} ${T + 20}q60 -10 90 30t-20 70q-50 10 -70 -30z`, class: 'co-bos' }),
      s('path', { d: `M${L + 230} ${T + 140}q40 -20 70 10t-10 50q-50 10 -60 -20z`, class: 'co-bos' }),
      s('path', { d: `M${L + 180} ${T + 30}q24 -14 44 6t-6 34q-30 6 -40 -12z`, class: 'co-water' }),
      s('path', { d: `M${L} ${T + 160}C${L + 90} ${T + 150} ${L + 140} ${T + 90} ${L + 3 * KM} ${T + 60}`, class: 'co-weg' }),
      s('path', { d: `M${L + 150} ${T}C${L + 140} ${T + 80} ${L + 170} ${T + 150} ${L + 160} ${T + 2 * KM}`, class: 'co-weg smal' }));
    for (let i = 0; i <= 3; i++) kaart.append(s('path', { d: `M${L + i * KM} ${T}v${2 * KM}`, class: 'co-lijn' }), s('text', { x: L + i * KM, y: T + 2 * KM + 16, class: 'co-getal', 'text-anchor': 'middle' }, String(X0 + i)));
    for (let j = 0; j <= 2; j++) kaart.append(s('path', { d: `M${L} ${T + j * KM}h${3 * KM}`, class: 'co-lijn' }), s('text', { x: L - 5, y: T + j * KM + 4, class: 'co-getal', 'text-anchor': 'end' }, String(Y0 + 2 - j)));
  }

  /** "Huisje in, trapje op": from the corner of the square along the bottom line, then up, with a tick each 100 m. */
  function tekenHulp() {
    hulp.replaceChildren();
    if (!marker || soort === 'passer' || klaar) return;
    const hoek = [Math.floor(marker[0]), Math.floor(marker[1])];
    const [hx, hy] = px(hoek); const [mx, my] = px(marker);
    const g = s('g', { class: 'co-hulp' }, s('path', { d: `M${hx} ${hy}H${mx}V${my}` }));
    for (let d = 0.1; d < marker[0] - hoek[0] - 0.001; d += 0.1) { const [x] = px([hoek[0] + d, 0]); g.append(s('path', { d: `M${x} ${hy - 3}v6` })); }
    for (let d = 0.1; d < marker[1] - hoek[1] - 0.001; d += 0.1) { const [, y] = px([0, hoek[1] + d]); g.append(s('path', { d: `M${mx - 3} ${y}h6` })); }
    hulp.append(g);
  }

  function tekenMarker() {
    markerG.replaceChildren();
    tekenHulp();
    if (!marker) return;
    const [x, y] = px(marker);
    markerG.append(s('path', { d: `M${x - 9} ${y}h6M${x + 3} ${y}h6M${x} ${y - 9}v6M${x} ${y + 3}v6`, class: 'co-kruis' }), s('circle', { cx: x, cy: y, r: 1.6, class: 'co-kruis-punt' }));
  }

  function tekenLagen() {
    lagen.replaceChildren();
    const gev = gevonden.map(([n, p]) => [n, p]);
    if (soort === 'coordinaten' && gev.length > 1) lagen.append(s('path', { d: `M${gev.map(([, p]) => px(p).join(' ')).join('L')}`, class: 'co-route' }));
    if (soort === 'kruispeiling') {
      const p = Object.fromEntries(gev);
      if (p.w && p.x) lagen.append(s('path', { d: `M${px(p.w).join(' ')}L${px(p.x).join(' ')}`, class: 'co-peil' }));
      if (p.y && p.z) lagen.append(s('path', { d: `M${px(p.y).join(' ')}L${px(p.z).join(' ')}`, class: 'co-peil' }));
    }
    if (soort === 'passer') {
      for (const [n, p, m] of og.punten) {
        const [x, y] = px(p);
        if (cirkels.has(n)) lagen.append(s('circle', { cx: x, cy: y, r: r1((m / 1000) * KM), class: 'co-cirkel' }));
        lagen.append(s('circle', { cx: x, cy: y, r: 4, class: 'co-punt' }), s('text', { x: x + 7, y: y - 6, class: 'co-naam' }, `${n} ${m} m`));
      }
    }
    for (const [n, p] of gev) { const [x, y] = px(p); lagen.append(s('circle', { cx: x, cy: y, r: 4, class: 'co-punt' }), s('text', { x: x + 7, y: y - 6, class: 'co-naam' }, n)); }
    if (klaar && og.doel) { const [x, y] = px(og.doel); lagen.append(s('path', { d: `M${x} ${y}v-18l13 5l-13 5`, class: 'co-vlag' })); }
  }

  function tekenLijst() {
    if (soort === 'passer') {
      lijst.replaceChildren(...og.punten.map(([n, , m]) => h('li', { class: cirkels.has(n) ? 'gedaan' : null }, h('strong', n), `: cirkel van ${m} m`)));
      return;
    }
    lijst.replaceChildren(...og.punten.map(([n, p], i) => h('li', { class: i === stap ? 'nu' : i < stap ? 'gedaan' : null }, h('strong', n), ` ${fmt(p)}`)));
  }

  function zetOpdracht() {
    if (klaar) { opdracht.textContent = ''; return; }
    if (soort === 'passer') {
      opdracht.textContent = cirkels.size < 3 ? 'Tik op A, B en C: de passer zet een cirkel met die afstand. Tik daarna waar de drie cirkels elkaar snijden.' : 'Tik waar de drie cirkels elkaar snijden.';
    } else if (stap < og.punten.length) {
      const [n, p] = og.punten[stap];
      opdracht.replaceChildren('Zoek ', h('strong', `${n}: ${fmt(p)}`), '. Tik op de kaart, schuif bij, en kies „Hier is het”.');
    } else opdracht.textContent = 'De lijnen w–x en y–z kruisen elkaar. Tik op het kruispunt: daar is de post.';
    controleer.disabled = false;
    pijlen.hidden = soort === 'passer' || stap >= og.punten.length;
  }

  function begin() {
    og = opgave(soort); stap = 0; marker = null; gevonden = []; cirkels = new Set(); klaar = false;
    melding.textContent = ''; melding.classList.remove('fout');
    svg.setAttribute('aria-label', 'Een stuk kaart van 3 bij 2 kilometer met de kilometerlijnen 112 tot 115 en 398 tot 400. Zet de marker met de pijltjes, Enter bevestigt.');
    tekenKaart(); tekenLagen(); tekenMarker(); tekenLijst(); zetOpdracht();
  }

  function check() {
    if (klaar) return;
    if (!marker) { melding.classList.add('fout'); melding.textContent = 'Tik eerst op de kaart om de marker te zetten.'; return; }
    const zoekt = soort === 'passer' || stap >= og.punten.length;
    if (zoekt) {
      if (soort === 'passer' && cirkels.size < 3) { melding.classList.add('fout'); melding.textContent = 'Zet eerst alle drie de cirkels: tik op A, B en C.'; return; }
      const a = Math.round(afstand(marker, og.doel) * 1000);
      if (a <= 60) {
        klaar = true; controleer.disabled = true; marker = null;
        melding.classList.remove('fout'); melding.textContent = `Gevonden! De post staat op ${fmt(og.doel.map(rond))}. Jij zat er ${a} m naast.`;
      } else { melding.classList.add('fout'); melding.textContent = `Nog niet: dat is ${a} m van het punt waar ${soort === 'passer' ? 'de cirkels' : 'de lijnen'} elkaar snijden.`; }
    } else {
      const [n, doel] = og.punten[stap];
      const fout = Math.max(Math.abs(marker[0] - doel[0]), Math.abs(marker[1] - doel[1]));
      if (fout <= TOL + 1e-9) {
        gevonden.push([n, doel]); stap++; marker = null;
        melding.classList.remove('fout'); melding.textContent = `${n} staat goed.`;
        if (soort === 'coordinaten' && stap === og.punten.length) { klaar = true; controleer.disabled = true; melding.textContent = 'Alle punten staan. De lijn ertussen is je route.'; }
      } else {
        melding.classList.add('fout');
        melding.textContent = `Jouw marker staat op ${fmt(marker)}, je zoekt ${fmt(doel)}. ${Math.abs(marker[0] - doel[0]) > TOL ? 'Kijk nog eens naar het eerste getal: hoe ver naar rechts?' : 'Het eerste getal klopt; hoe ver omhoog?'}`;
      }
    }
    tekenLagen(); tekenMarker(); tekenLijst(); zetOpdracht();
  }

  // tapping: the passer points first, then the marker; dragging moves the marker
  let sleept = false;
  const plek = (e) => {
    const r = svg.getBoundingClientRect();
    return km([((e.clientX - r.left) / r.width) * B, ((e.clientY - r.top) / r.height) * H]);
  };
  svg.addEventListener('pointerdown', (e) => {
    if (klaar) return;
    const p = plek(e);
    if (soort === 'passer') {
      const raak = og.punten.find(([, q]) => afstand(p, q) < 0.09);
      if (raak) { cirkels.add(raak[0]); stand.textContent = `Cirkel om ${raak[0]} getekend.`; tekenLagen(); tekenLijst(); zetOpdracht(); return; }
    }
    if (p[0] < X0 || p[0] > X0 + 3 || p[1] < Y0 || p[1] > Y0 + 2) return;
    sleept = true; svg.setPointerCapture(e.pointerId); e.preventDefault();
    marker = [rond(p[0]), rond(p[1])]; tekenMarker();
  });
  svg.addEventListener('pointermove', (e) => { if (sleept) { const p = plek(e); marker = [rond(Math.min(X0 + 3, Math.max(X0, p[0]))), rond(Math.min(Y0 + 2, Math.max(Y0, p[1])))]; tekenMarker(); } });
  svg.addEventListener('pointerup', () => { sleept = false; });
  svg.addEventListener('pointercancel', () => { sleept = false; });
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); check(); return; }
    const d = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, 0.01], ArrowDown: [0, -0.01] }[e.key];
    if (!d || klaar) return;
    e.preventDefault();
    const stapje = e.shiftKey ? 10 : 1;
    marker = marker ?? [X0 + 1.5, Y0 + 1];
    marker = [rond(marker[0] + d[0] * stapje), rond(marker[1] + d[1] * stapje)];
    tekenMarker();
    stand.textContent = `Marker op ${fmt(marker)}.`;
  });

  begin();
  return el;
}
