// Routes on the map with RD coordinates. A piece of map of 3 by 2 km with its kilometre lines.
// - coordinaten: plot each coordinate of the route with a kaarthoekmeter, and the route appears. "Huisje in": tap
//   the km-square the point lies in; the map zooms in on it. "Trapje op": lay the card so the km-line west of the
//   point crosses the top scale at the hundredths of the first number, and the line south of it crosses the right
//   scale at those of the second. The corner of the card is then the point.
// - kruispeiling: two variants, as the blad gives them. Four coordinates w, x, y, z: the lines w–x and y–z cross
//   at the post. Or two coordinates w and y with a course each: from each point turn a line to its course on the
//   gradenring, and the two lines cross at the post. Tap the crossing.
// - passer: three points, each with a distance; draw their circles with the compasses and tap where they meet.
// A coordinate like 113.52 – 398.64 is km line 113, then 52 hundredths (520 m) to the east; km line 398, then 64
// hundredths to the north. The card moves in steps of 10 m: a hundredth.
import { h } from '../../dom.js';
import { HOEK, kaartje } from '../../plaatjes/kaarthoekmeter.js';
import { norm, pol, s, verschil } from '../kompasdelen.js';
import { actie, acties, keuze, zetActie } from '../knoppen.js';
import '../vorm.css';
import './coordinaten.css';

const X0 = 112; const Y0 = 398;               // the south-west corner, in km
const KM = 110; const L = 34; const T = 12;   // pixels per km, left and top margin
const B = L + 3 * KM + 12; const H = T + 2 * KM + 26;
const U = KM / 40;                            // the card at the scale of the map: 1:25.000, 40 mm a km
const TOL = 0.02;                             // 20 m: a tick of the card either way
const GRADEN = 2;                             // how far a course line may be off
const ZOOM = 1.4;                             // km shown when zoomed in on a square
const r1 = (n) => Math.round(n * 10) / 10;
const px = ([x, y]) => [r1(L + (x - X0) * KM), r1(T + (Y0 + 2 - y) * KM)];
const km = ([a, b]) => [X0 + (a - L) / KM, Y0 + 2 - (b - T) / KM];
const fmt = ([x, y]) => `${x.toFixed(2)} – ${y.toFixed(2)}`;
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rond = (v) => Math.round(v * 100) / 100;
const binnen = (n, min, max) => Math.min(Math.max(n, min), max);
/** A point on the map on whole hundredths, not right on a km-line (that would make its square unclear). */
function willekeurig(rand = 0.15) {
  for (;;) {
    const p = [rond(X0 + rand + Math.random() * (3 - 2 * rand)), rond(Y0 + rand + Math.random() * (2 - 2 * rand))];
    if (p.every((v) => { const f = Math.round((v % 1) * 100); return f >= 3 && f <= 97; })) return p;
  }
}
/** The course from a to b, in degrees from grid north: up along the km-lines. */
const koersVan = (a, b) => norm((Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI);
const richting = (g) => [Math.sin((g * Math.PI) / 180), Math.cos((g * Math.PI) / 180)];
/** Where a line from p in course g leaves the map. */
function rand(p, g) {
  const [dx, dy] = richting(g);
  const t = Math.min(dx > 0 ? (X0 + 3 - p[0]) / dx : dx < 0 ? (X0 - p[0]) / dx : Infinity, dy > 0 ? (Y0 + 2 - p[1]) / dy : dy < 0 ? (Y0 - p[1]) / dy : Infinity);
  return [p[0] + t * dx, p[1] + t * dy];
}

function snijpunt([p1, p2], [p3, p4], open = false) {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
  const u = -((p1[0] - p2[0]) * (p1[1] - p3[1]) - (p1[1] - p2[1]) * (p1[0] - p3[0])) / d;
  const ok = open ? t > 0 && u > 0 : t > 0.15 && t < 0.85 && u > 0.15 && u < 0.85;
  return ok ? [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])] : null;
}

/** What to find, per kind. A point is [naam, p] or, with a course, [naam, p, koers]. */
function opgave(soort, variant) {
  if (soort === 'kruispeiling' && variant === 'koersen') {
    for (;;) {
      const post = willekeurig(0.45); const w = willekeurig(0.12); const y = willekeurig(0.12);
      if (afstand(w, post) < 0.8 || afstand(y, post) < 0.8) continue;
      const kw = koersVan(w, post); const ky = koersVan(y, post);
      if (verschil(kw, ky) < 40 || verschil(kw, ky) > 140) continue;
      const p = snijpunt([w, w.map((v, i) => v + richting(kw)[i])], [y, y.map((v, i) => v + richting(ky)[i])], true);
      if (p && p[0] > X0 + 0.15 && p[0] < X0 + 2.85 && p[1] > Y0 + 0.15 && p[1] < Y0 + 1.85) return { punten: [['w', w, kw], ['y', y, ky]], doel: p };
    }
  }
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
    const punten = Array.from({ length: 4 }, () => willekeurig());
    if (punten.every((p, i) => i === 0 || afstand(p, punten[i - 1]) > 0.6)) return { punten: punten.map((p, i) => ['ABCD'[i], p]) };
  }
}

export default function coordinaten({ soort = 'coordinaten' } = {}) {
  let variant = 'vier';
  let og; let stap; let fase; let marker; let gevonden; let lijnen; let cirkels;
  let vak = null;               // the km-square [x, y] of its south-west corner, once chosen
  let vakKeus = null;           // the square the keyboard points at, or the one tapped wrong
  let vakFout = false;
  let hoek = null;              // the corner of the card's 1:25.000 scale, in km
  let draai = 0;                // the course line being turned
  let zoom = 1;
  let passers = [];             // passer: a button per point, made once per opgave

  const kaart = s('g'); const vakG = s('g'); const lagen = s('g'); const kaartjeG = s('g', { class: 'co-kaartje' });
  const ringG = s('g', { class: 'co-ring' }); const markerG = s('g'); const randen = s('g', { class: 'co-randen' });
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'co-svg', tabindex: '0', role: 'application' }, kaart, vakG, lagen, kaartjeG, ringG, markerG, randen);
  const kaartjeVorm = s('g');
  kaartjeVorm.innerHTML = kaartje(U, 0, 0, { fijn: true, doorzicht: 0.4 });
  kaartjeG.append(kaartjeVorm);

  const opdracht = h('p.co-opdracht');
  const lijst = h(soort === 'passer' ? 'ul.co-lijst.co-passers' : 'ol.co-lijst');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const schuif = (dx, dy) => () => { if (fase === 'kaart') { zetHoek([hoek[0] + dx, hoek[1] + dy]); meldHoek(); } };
  const pijlen = h('div.co-pijlen', { role: 'group', 'aria-label': 'Schuif de kaarthoekmeter 10 meter' },
    h('button.knop.klein', { type: 'button', 'aria-label': 'Naar links', onclick: schuif(-0.01, 0) }, '◀'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Omhoog', onclick: schuif(0, 0.01) }, '▲'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Omlaag', onclick: schuif(0, -0.01) }, '▼'),
    h('button.knop.klein', { type: 'button', 'aria-label': 'Naar rechts', onclick: schuif(0.01, 0) }, '▶'));
  const draaiKnop = (d, tekst, label) => h('button.knop.klein', { type: 'button', 'aria-label': label, onclick: () => { if (fase === 'koers') { zetDraai(draai + d); meldDraai(); } } }, tekst);
  const draaiers = h('div.co-pijlen', { role: 'group', 'aria-label': 'Draai de lijn' },
    draaiKnop(-10, '↺ 10', '10 graden linksom'), draaiKnop(-1, '↺ 1', '1 graad linksom'), draaiKnop(1, '↻ 1', '1 graad rechtsom'), draaiKnop(10, '↻ 10', '10 graden rechtsom'));
  const controleer = actie('Hier is het', 'vink', () => check(), { hoofd: true });
  const opnieuw = actie('Nieuwe opgave', 'opnieuw', () => begin());
  const varianten = soort === 'kruispeiling'
    && h('div.chips', keuze([['vier', 'Vier coördinaten'], ['koersen', 'Twee coördinaten en twee koersen']], variant, (v) => { variant = v; begin(); }));

  const el = h('div.doe-coordinaten',
    varianten,
    h('div.co-boven', lijst, opdracht),
    h('div.co-kaart', svg),
    h('div.co-bediening', pijlen, draaiers),
    acties(controleer, opnieuw), melding, stand);

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

  // -- the view: the whole map, or zoomed in on a square (to lay the card) or on a point (to turn a line)
  function bekijk(midden, opKaart = false, breed = ZOOM) {
    let vb = [0, 0, B, H];
    if (midden) {
      const [cx, cy] = px(midden); const w = breed * KM;
      vb = [r1(cx - w / 2), r1(cy - w / 2), r1(w), r1(w)];
      // a square at the edge: keep the view on the map, with a little of the margin
      if (opKaart) vb = [r1(binnen(vb[0], L - 14, L + 3 * KM + 14 - w)), r1(binnen(vb[1], T - 14, T + 2 * KM + 14 - w)), vb[2], vb[3]];
    }
    zoom = B / vb[2];
    svg.setAttribute('viewBox', vb.join(' '));
    svg.style.setProperty('--z', String(r1(zoom * 100) / 100));
    svg.classList.toggle('zoom', !!midden);
    randen.replaceChildren();
    if (!midden) return;
    // the numbers of the km-lines in view, at its edge, as at the edge of a real map
    const [x0, y0, w] = vb;
    const [linksKm, bovenKm] = km([x0, y0]); const [rechtsKm, onderKm] = km([x0 + w, y0 + w]);
    const maat = r1(12 / zoom);
    // the km-lines once more over the card: it is clear plastic, you read where they cross its scales
    for (let i = X0 + 1; i < X0 + 3; i++) randen.append(s('path', { d: `M${px([i, 0])[0]} ${T}v${2 * KM}`, class: 'co-lijn boven' }));
    for (let j = Y0 + 1; j < Y0 + 2; j++) randen.append(s('path', { d: `M${L} ${px([0, j])[1]}h${3 * KM}`, class: 'co-lijn boven' }));
    for (let i = Math.ceil(linksKm); i <= rechtsKm; i++) if (i >= X0 && i <= X0 + 3) randen.append(s('text', { x: px([i, 0])[0] + 2 / zoom, y: y0 + maat * 1.1, 'font-size': maat }, String(i)));
    for (let j = Math.ceil(onderKm); j <= bovenKm; j++) if (j >= Y0 && j <= Y0 + 2) randen.append(s('text', { x: x0 + 3 / zoom, y: px([0, j])[1] - 3 / zoom, 'font-size': maat }, String(j)));
  }
  const vakMidden = ([x, y]) => [x + 0.55, y + 0.5];

  function tekenVak() {
    vakG.replaceChildren();
    if (fase !== 'vak' || !vakKeus) return;
    const [x, y] = px([vakKeus[0], vakKeus[1] + 1]);
    vakG.append(s('rect', { x, y, width: KM, height: KM, class: `co-vak${vakFout ? ' fout' : ''}` }));
  }

  function tekenKaartje() {
    kaartjeG.setAttribute('visibility', fase === 'kaart' ? 'visible' : 'hidden');
    if (fase !== 'kaart') return;
    const [x, y] = px(hoek);
    kaartjeVorm.setAttribute('transform', `translate(${r1(x - HOEK[25].x * U)} ${r1(y - HOEK[25].y * U)})`);
  }

  function tekenRing() {
    ringG.replaceChildren();
    if (fase !== 'koers') return;
    const p = og.punten[stap][1];
    const [cx, cy] = px(p); const R = 0.42 * KM;
    ringG.append(s('circle', { cx, cy, r: R, class: 'co-ring-vlak' }));
    for (let g = 0; g < 360; g++) {
      const lang = g % 10 ? (g % 5 ? 1.6 : 3) : 5;
      const [x1, y1] = pol(cx, cy, R, g); const [x2, y2] = pol(cx, cy, R - lang, g);
      ringG.append(s('path', { d: `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`, class: g % 10 ? 'co-ring-streep dun' : 'co-ring-streep' }));
    }
    for (let g = 0; g < 360; g += 30) {
      const [x, y] = pol(cx, cy, R - 9.5, g);
      ringG.append(s('text', { x: r1(x), y: r1(y), class: 'co-ring-getal', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g ? String(g) : 'N'));
    }
    const [ex, ey] = px(rand(p, draai)); const [ax, ay] = pol(cx, cy, R + 7, draai);
    ringG.append(s('path', { d: `M${cx} ${cy}L${ex} ${ey}`, class: 'co-draailijn' }),
      s('circle', { cx: r1(ax), cy: r1(ay), r: 3.2, class: 'co-draaigreep' }),
      s('circle', { cx, cy, r: 1.6, class: 'co-punt' }));
  }

  function tekenMarker() {
    markerG.replaceChildren();
    if (!marker || fase !== 'snij') return;
    const [x, y] = px(marker);
    markerG.append(s('path', { d: `M${x - 9} ${y}h6M${x + 3} ${y}h6M${x} ${y - 9}v6M${x} ${y + 3}v6`, class: 'co-kruis' }), s('circle', { cx: x, cy: y, r: 1.6, class: 'co-kruis-punt' }));
  }

  function tekenLagen() {
    lagen.replaceChildren();
    const r = (n) => r1(n / zoom);
    if (soort === 'coordinaten' && gevonden.length > 1) lagen.append(s('path', { d: `M${gevonden.map(([, p]) => px(p).join(' ')).join('L')}`, class: 'co-route' }));
    if (soort === 'kruispeiling') {
      const p = Object.fromEntries(gevonden);
      if (variant === 'vier') {
        if (p.w && p.x) lagen.append(s('path', { d: `M${px(p.w).join(' ')}L${px(p.x).join(' ')}`, class: 'co-peil' }));
        if (p.y && p.z) lagen.append(s('path', { d: `M${px(p.y).join(' ')}L${px(p.z).join(' ')}`, class: 'co-peil' }));
      }
      for (const [q, g] of lijnen) lagen.append(s('path', { d: `M${px(q).join(' ')}L${px(rand(q, g)).join(' ')}`, class: 'co-peil' }));
    }
    if (soort === 'passer') {
      for (const [n, p, m] of og.punten) {
        const [x, y] = px(p);
        if (cirkels.has(n)) lagen.append(s('circle', { cx: x, cy: y, r: r1((m / 1000) * KM), class: 'co-cirkel' }));
        lagen.append(s('circle', { cx: x, cy: y, r: 4, class: 'co-punt' }), s('text', { x: x > B - 80 ? x - 7 : x + 7, y: y - 6, class: 'co-naam', 'text-anchor': x > B - 80 ? 'end' : 'start' }, `${n} ${m} m`));
      }
    }
    for (const [n, p] of gevonden) { const [x, y] = px(p); lagen.append(s('circle', { cx: x, cy: y, r: r(4), class: 'co-punt' }), s('text', { x: x + r(7), y: y - r(6), class: 'co-naam' }, n)); }
    if (fase === 'klaar' && og.doel) { const [x, y] = px(og.doel); lagen.append(s('path', { d: `M${x} ${y}v-18l13 5l-13 5`, class: 'co-vlag' })); }
  }

  function tekenLijst() {
    if (soort === 'passer') {
      // kept between redraws, so a button keeps the focus
      if (!passers.length) {
        passers = og.punten.map(([n, , m]) => h('button.chip', { type: 'button', 'aria-label': `Cirkel van ${m} m om ${n}`, onclick: () => passer(n) }, h('span', h('strong', n), `: ${m} m`)));
        lijst.replaceChildren(...passers.map((k) => h('li', k)));
      }
      passers.forEach((k, i) => k.setAttribute('aria-pressed', String(cirkels.has(og.punten[i][0]))));
      return;
    }
    lijst.replaceChildren(...og.punten.map(([n, p, g], i) => h('li', { class: i === stap ? 'nu' : i < stap ? 'gedaan' : null },
      h('strong', n), ` ${fmt(p)}`, g == null ? null : `, koers ${g}°`)));
  }

  function zetOpdracht() {
    const focus = document.activeElement;
    pijlen.hidden = fase !== 'kaart';
    draaiers.hidden = fase !== 'koers';
    controleer.hidden = fase === 'vak' || fase === 'klaar';
    // a button that hides itself under a keyboard user: keep the focus in the piece, not lost on the page
    if (focus?.closest('.co-bediening [hidden], .acties [hidden]')) (fase === 'klaar' ? opnieuw : svg).focus({ preventScroll: true });
    zetActie(controleer, fase === 'koers' ? 'Trek de lijn' : 'Hier is het', 'vink');
    const [n, p, g] = og.punten[stap] ?? [];
    if (fase === 'klaar') opdracht.textContent = '';
    else if (soort === 'passer') {
      opdracht.textContent = cirkels.size < 3 ? 'Tik op A, B en C: de passer zet een cirkel met die afstand. Tik daarna waar de drie cirkels elkaar snijden.' : 'Tik waar de drie cirkels elkaar snijden.';
    } else if (fase === 'vak') {
      opdracht.replaceChildren('Zoek ', h('strong', `${n}: ${fmt(p)}`), '. Tik eerst het vak waar het punt in ligt: het eerste getal zegt de staande km-lijn links ervan, het tweede de liggende lijn eronder.');
    } else if (fase === 'kaart') {
      const [bx, by] = [Math.round((p[0] - vak[0]) * 100), Math.round((p[1] - vak[1]) * 100)];
      opdracht.replaceChildren(...(stap === 0
        ? ['Leg de kaarthoekmeter op de kaart: sleep hem, of schuif met de pijltjes. Lijn ', h('strong', String(vak[0])), ' moet de bovenste schaal kruisen bij ',
          h('strong', String(bx)), ', en lijn ', h('strong', String(vak[1])), ' de rechter schaal bij ', h('strong', String(by)), `. Het hoekpunt is dan ${n}.`]
        : ['Leg het hoekpunt van de kaarthoekmeter op ', h('strong', `${n}: ${fmt(p)}`), '. Lees af bij lijn ', String(vak[0]), ' en lijn ', String(vak[1]), '.']));
    } else if (fase === 'koers') {
      opdracht.replaceChildren('Trek vanaf ', h('strong', n), ' een lijn op ', h('strong', `${g}°`), '. Draai de lijn met je vinger of de knoppen, en lees af op de gradenring. 0° is noord: langs de staande km-lijnen omhoog.');
    } else {
      opdracht.textContent = variant === 'koersen' ? 'De lijnen vanaf w en y kruisen elkaar. Tik op het kruispunt: daar is de post.'
        : 'De lijnen w–x en y–z kruisen elkaar. Tik op het kruispunt: daar is de post.';
    }
  }

  function tekenAlles() { tekenVak(); tekenLagen(); tekenKaartje(); tekenRing(); tekenMarker(); tekenLijst(); zetOpdracht(); }

  /** Go to the next thing to do: a square to find, a line to turn, or the crossing. */
  function verder() {
    vak = null; vakKeus = null; vakFout = false; hoek = null; marker = null;
    if (stap < og.punten.length) { fase = 'vak'; bekijk(null); }
    else if (soort === 'kruispeiling') { fase = 'snij'; bekijk(null); }
    else { fase = 'klaar'; bekijk(null); melding.classList.remove('fout'); melding.textContent = 'Alle punten staan. De lijn ertussen is je route.'; }
    zetLabel();
    tekenAlles();
  }

  function zetLabel() {
    const w = { vak: 'Pijltjes kiezen een vak, Enter neemt het.', kaart: 'Pijltjes schuiven de kaarthoekmeter 10 meter, met Shift 100 meter. Enter kijkt na.',
      koers: 'Pijltjes draaien de lijn 1 graad, met Shift 10 graden. Enter kijkt na.', snij: 'Pijltjes zetten de marker, Enter kijkt na.' }[fase] ?? '';
    svg.setAttribute('aria-label', `Een stuk kaart van 3 bij 2 kilometer met de kilometerlijnen 112 tot 115 en 398 tot 400. ${w}`);
  }

  function begin() {
    og = opgave(soort, variant); stap = 0; gevonden = []; lijnen = []; cirkels = new Set(); passers = [];
    melding.textContent = ''; melding.classList.remove('fout');
    tekenKaart();
    if (soort === 'passer') { fase = 'snij'; marker = null; bekijk(null); zetLabel(); tekenAlles(); } else verder();
  }

  // -- the steps
  function kiesVak(v) {
    if (fase !== 'vak') return;
    const [n, p] = og.punten[stap];
    const echt = [Math.floor(p[0]), Math.floor(p[1])];
    if (v[0] === echt[0] && v[1] === echt[1]) {
      vak = v; fase = 'kaart'; vakFout = false;
      // the card starts high on the right of the square, not on the point
      do hoek = [rond(v[0] + 0.55 + Math.random() * 0.4), rond(v[1] + 0.55 + Math.random() * 0.4)]; while (afstand(hoek, p) < 0.15);
      bekijk(vakMidden(v), true);
      melding.classList.remove('fout'); melding.textContent = `Goed vak: tussen lijn ${v[0]} en ${v[0] + 1}, en tussen ${v[1]} en ${v[1] + 1}. Leg nu de kaarthoekmeter erop.`;
      zetLabel();
    } else {
      vakKeus = v; vakFout = true;
      melding.classList.add('fout');
      melding.textContent = v[0] !== echt[0]
        ? `Kijk naar het eerste getal van ${n}: ${p[0].toFixed(2)}. Het punt ligt rechts van de staande lijn ${echt[0]}, in het vak tot lijn ${echt[0] + 1}.`
        : `Het eerste getal klopt. Kijk naar het tweede: ${p[1].toFixed(2)}. Het punt ligt boven de liggende lijn ${echt[1]}, in het vak tot lijn ${echt[1] + 1}.`;
    }
    tekenAlles();
  }

  function zetHoek(q) {
    hoek = [rond(binnen(q[0], vak[0], vak[0] + 1)), rond(binnen(q[1], vak[1], vak[1] + 1))];
    tekenKaartje();
  }
  const lezing = () => [Math.round((hoek[0] - vak[0]) * 100), Math.round((hoek[1] - vak[1]) * 100)];
  function meldHoek() {
    const [a, b] = lezing();
    stand.textContent = `Lijn ${vak[0]} kruist de bovenste schaal bij ${a}, lijn ${vak[1]} de rechter schaal bij ${b}.`;
  }
  function zetDraai(g) { draai = norm(g); tekenRing(); }
  const meldDraai = () => { stand.textContent = `De lijn staat op ${draai} graden.`; };

  function check() {
    if (fase === 'kaart') {
      const [n, doel] = og.punten[stap];
      const [a, b] = lezing(); const [da, db] = [Math.round((doel[0] - vak[0]) * 100), Math.round((doel[1] - vak[1]) * 100)];
      if (Math.abs(hoek[0] - doel[0]) <= TOL + 1e-9 && Math.abs(hoek[1] - doel[1]) <= TOL + 1e-9) {
        gevonden.push([n, doel]);
        melding.classList.remove('fout'); melding.textContent = `${n} staat goed: ${fmt(doel)}.`;
        if (og.punten[stap][2] != null) { fase = 'koers'; draai = 0; bekijk(doel, false, 1.05); zetLabel(); tekenAlles(); return; }
        stap++; verder(); return;
      }
      const fout = [];
      const raak = (x, y) => Math.abs(x - y) <= TOL * 100;
      if (raak(a, db) && raak(b, da) && !raak(da, db)) {
        fout.push(`Je hebt de getallen omgewisseld. De ${da} van het eerste getal hoort op de bovenste schaal, de ${db} van het tweede op de rechter: eerst naar rechts, dan omhoog.`);
      } else {
        if (!raak(a, da)) fout.push(`Lijn ${vak[0]} kruist de bovenste schaal nu bij ${a}; je zoekt ${da}. Schuif ${Math.abs(a - da) * 10} m naar ${a < da ? 'rechts' : 'links'}.`);
        if (!raak(b, db)) fout.push(`Lijn ${vak[1]} kruist de rechter schaal nu bij ${b}; je zoekt ${db}. Schuif ${Math.abs(b - db) * 10} m ${b < db ? 'omhoog' : 'omlaag'}.`);
      }
      melding.classList.add('fout'); melding.textContent = fout.join(' ');
      return;
    }
    if (fase === 'koers') {
      const [n, p, g] = og.punten[stap];
      if (verschil(draai, g) <= GRADEN) {
        lijnen.push([p, g]);
        melding.classList.remove('fout'); melding.textContent = `De lijn vanaf ${n} staat op ${g}°.`;
        stap++; verder(); return;
      }
      const d = ((g - draai + 540) % 360) - 180;
      melding.classList.add('fout');
      if (verschil(draai, g) >= 180 - GRADEN) { melding.textContent = `Je lijn wijst de andere kant op: ${draai}° is de koers terug naar ${n}. Draai hem een halve slag, naar ${g}°.`; return; }
      melding.textContent = `Je lijn staat op ${draai}°, je zoekt ${g}°. Draai hem ${Math.abs(d)}° ${d > 0 ? 'rechtsom' : 'linksom'}. Tel de streepjes vanaf het getal ervoor: een streepje is 1°, een lange streep 10°.`;
      return;
    }
    if (fase !== 'snij') return;
    if (!marker) { melding.classList.add('fout'); melding.textContent = 'Tik eerst op de kaart om de marker te zetten.'; return; }
    if (soort === 'passer' && cirkels.size < 3) { melding.classList.add('fout'); melding.textContent = 'Zet eerst alle drie de cirkels: tik op A, B en C.'; return; }
    const a = Math.round(afstand(marker, og.doel) * 1000);
    if (a <= 60) {
      fase = 'klaar'; marker = null;
      melding.classList.remove('fout'); melding.textContent = `Gevonden! De post staat op ${fmt(og.doel.map(rond))}. Jij zat er ${a} m naast.`;
    } else { melding.classList.add('fout'); melding.textContent = `Nog niet: dat is ${a} m van het punt waar ${soort === 'passer' ? 'de cirkels' : 'de lijnen'} elkaar snijden.`; }
    tekenAlles();
  }

  function passer(n) {
    if (fase !== 'snij') return;
    cirkels.add(n); stand.textContent = `Cirkel om ${n} getekend.`; tekenAlles();
  }

  // -- pointer: tap a square; pull the card along from where you took it; turn the line; set the marker
  let greep = null;
  const plek = (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return km([q.x, q.y]);
  };
  const opKaart = (p) => p[0] >= X0 && p[0] <= X0 + 3 && p[1] >= Y0 && p[1] <= Y0 + 2;
  const hoekNaar = (p) => { const q = og.punten[stap][1]; return norm((Math.atan2(p[0] - q[0], p[1] - q[1]) * 180) / Math.PI); };
  svg.addEventListener('pointerdown', (e) => {
    if (fase === 'klaar' || e.button > 0) return;
    const p = plek(e);
    if (fase === 'vak') { if (opKaart(p)) kiesVak([Math.min(X0 + 2, Math.floor(p[0])), Math.min(Y0 + 1, Math.floor(p[1]))]); return; }
    if (fase === 'snij' && soort === 'passer') {
      const raak = og.punten.find(([, q]) => afstand(p, q) < 0.15);
      if (raak) { passer(raak[0]); return; }
    }
    if (fase === 'snij' && !opKaart(p)) return;
    greep = { p, hoek };
    svg.setPointerCapture(e.pointerId); svg.classList.add('sleept'); e.preventDefault();
    if (fase === 'koers') zetDraai(hoekNaar(p));
    if (fase === 'snij') { marker = [rond(p[0]), rond(p[1])]; tekenMarker(); }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!greep) return;
    const p = plek(e);
    if (fase === 'kaart') zetHoek([greep.hoek[0] + p[0] - greep.p[0], greep.hoek[1] + p[1] - greep.p[1]]);
    else if (fase === 'koers') zetDraai(hoekNaar(p));
    else if (fase === 'snij') { marker = [rond(binnen(p[0], X0, X0 + 3)), rond(binnen(p[1], Y0, Y0 + 2))]; tekenMarker(); }
  });
  const los = () => {
    if (!greep) return;
    greep = null; svg.classList.remove('sleept');
    if (fase === 'kaart') meldHoek(); else if (fase === 'koers') meldDraai();
  };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (e.key === 'Enter' || (e.key === ' ' && fase === 'vak')) {
      e.preventDefault();
      if (fase === 'vak') { if (vakKeus) kiesVak(vakKeus); } else check();
      return;
    }
    if (!r || fase === 'klaar') return;
    e.preventDefault();
    const n = e.shiftKey ? 10 : 1;
    if (fase === 'vak') {
      vakKeus = vakKeus ? [binnen(vakKeus[0] + r[0], X0, X0 + 2), binnen(vakKeus[1] + r[1], Y0, Y0 + 1)] : [X0, Y0 + 1];
      vakFout = false; tekenVak();
      stand.textContent = `Vak tussen lijn ${vakKeus[0]} en ${vakKeus[0] + 1}, en tussen ${vakKeus[1]} en ${vakKeus[1] + 1}.`;
    } else if (fase === 'kaart') { zetHoek([hoek[0] + r[0] * 0.01 * n, hoek[1] + r[1] * 0.01 * n]); meldHoek(); }
    else if (fase === 'koers') { zetDraai(draai + (r[0] || r[1]) * n); meldDraai(); }
    else if (fase === 'snij') {
      marker = marker ?? [X0 + 1.5, Y0 + 1];
      marker = [rond(binnen(marker[0] + r[0] * 0.01 * n, X0, X0 + 3)), rond(binnen(marker[1] + r[1] * 0.01 * n, Y0, Y0 + 2))];
      tekenMarker();
      stand.textContent = `Marker op ${fmt(marker)}.`;
    }
  });

  begin();
  return el;
}
