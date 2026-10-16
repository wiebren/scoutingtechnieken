// A frietbuil in 3D: the flat sheet of 3 × 3 m (the plan in the drawing kamp-frietbuil) folds up into the shelter.
// A slider (or "Speel af") goes from flat, via B hung up and the three A's pegged, to the flaps folded in as the
// groundsheet. Drag the picture (or use the arrow keys) to look at it from another side. A small hand-made
// projection, no 3D library. Facts: Scoutwiki Frietbuil and Scouting Leonardus (B about 1 m high, foot end into
// the wind); see notities/technieken/kamperen-uitwerking.md.
import { h } from '../../dom.js';
import { stappenBalk } from '../stappen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';
import './frietbuil.css';

const W = 400; const H = 280;
const HOOG = 1;                         // B hangs about 1 m above the ground
const DOEL = [1.6, 0, 0.3]; const RAND = 3.6;            // the point the view turns around
const SCHAAL = 54; const AFSTAND = 11;  // px per metre, and the eye's distance (for a little perspective)
const PAAL = [-0.75, 0, 0]; const PAAL_HOOG = 1.55; const LIJN_HAAK = [-1.7, 0, 0];

// The phases of the slider (0..1): B goes up, then the pegs, then the flaps go in.
const OP = 0.5; const HARING = 0.6;
const STAPPEN = [
  { t: 0, naam: 'Plat' },
  { t: OP, naam: 'Ophangen' },
  { t: HARING, naam: 'Vastzetten' },
  { t: 1, naam: 'Flappen in' },
];
/** From the place on the stappenbalk (0 = the first step, 1.5 = half way from the second to the third) to t, and back. */
const tVan = (w) => { const i = Math.min(STAPPEN.length - 2, Math.floor(w)); return STAPPEN[i].t + (w - i) * (STAPPEN[i + 1].t - STAPPEN[i].t); };
const plekVan = (t) => { let i = 0; while (i < STAPPEN.length - 2 && t > STAPPEN[i + 1].t) i++; return i + (t - STAPPEN[i].t) / (STAPPEN[i + 1].t - STAPPEN[i].t); };

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const zacht = (x) => x * x * (3 - 2 * x);
const plus = (a, b) => a.map((v, i) => v + b[i]);
const min = (a, b) => a.map((v, i) => v - b[i]);
const keer = (a, k) => a.map((v) => v * k);
const lengte = (a) => Math.hypot(...a);
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Where everything is at slider position t. x runs from the top B to the foot end, y to the side, z up (metres).
 * The two roof triangles (B, A, side A) hinge on the ridge B–A; their sides keep their length (2 m and √10 m), so
 * lifting B to height hb brings the foot A and the side A's a little closer.
 */
function vorm(t) {
  const hb = HOOG * zacht(klem(t / OP));
  const d = Math.sqrt(18 - hb * hb);                       // the ridge is the diagonal, 3√2 m
  const x2 = (d * d - hb * hb - 6) / (2 * d);
  const y2 = Math.sqrt(Math.max(0, 4 - hb * hb - x2 * x2));
  const B = [0, 0, hb]; const A = [d, 0, 0]; const AL = [x2, y2, 0]; const AR = [x2, -y2, 0];
  const nok = (f) => plus(B, keer(min(A, B), f));          // a point on the ridge, f from B to A
  // A flap hangs on the line side-A – foot-A: its corner is 1 m from the side A and 3 m from the foot A. Outside it
  // lies flat on the ground; folded in, it lies on the ground under the roof (a little lift on the way).
  const vin = zacht(klem((t - HARING) / (1 - HARING)));
  const flap = (Z, kant, laag) => {
    const e = min(A, Z); const L = lengte(e); const eh = keer(e, 1 / L);
    const a = (1 - 9 + L * L) / (2 * L); const q = Math.sqrt(Math.max(0, 1 - a * a));
    const uit = [-eh[1] * kant, eh[0] * kant, 0];          // along the ground, away from the middle
    const voet = plus(Z, keer(eh, a));
    const k = plus(voet, keer(uit, q * (1 - 2 * vin)));
    k[2] = laag + 0.12 * Math.sin(Math.PI * vin);
    return [Z, k, A];
  };
  return { t, hb, B, A, AL, AR, C: nok(1 / 3), vin,
    flapL: flap(AL, 1, 0.004), flapR: flap(AR, -1, 0.008) };
}

/** The projection for a view (yaw, pitch in radians): world point → [x, y, depth] on the screen. */
function kijker(draai, hoek) {
  const [cd, sd, ch, sh] = [Math.cos(draai), Math.sin(draai), Math.cos(hoek), Math.sin(hoek)];
  return ([x, y, z]) => {
    const [px, py, pz] = [x - DOEL[0], y - DOEL[1], z - DOEL[2]];
    const X = px * cd + py * sd; const Y = -px * sd + py * cd;
    const op = pz * ch + Y * sh; const diep = Y * ch - pz * sh;
    const k = AFSTAND / (AFSTAND + diep);
    return [W / 2 + X * SCHAAL * k, H * 0.56 - op * SCHAAL * k, diep];
  };
}

const r = (n) => Math.round(n * 10) / 10;
const pad = (pts) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`;

/** Which side you look from, in words. */
function kant(draai, hoek) {
  const [cx, cy] = [Math.sin(draai), -Math.cos(draai)];  // where the eye is, seen from above
  let w;
  if (Math.abs(cx) > 0.8) w = cx < 0 ? 'van de kant van de ingang (hoog en open)' : 'van het voeteneinde (laag, in de wind)';
  else if (Math.abs(cx) < 0.4) w = 'van opzij';
  else w = cx < 0 ? 'schuin van de ingang' : 'schuin van het voeteneinde';
  return hoek > 1.15 ? `bijna van bovenaf, ${w}` : w;
}

function stapTekst(v) {
  if (v.t <= 0.001) return 'Stap 1: het plastic ligt plat. Plak de dikke lijnen af met plakband, en B extra stevig.';
  if (v.t < OP + 0.001) return 'Stap 2: trek B aan een touw omhoog naar een paal of tak, tot ongeveer 1 meter. De lijn van B naar de verste A wordt de nok.';
  if (v.t < HARING + 0.001) return 'Stap 3: zet de drie punten A vast met haringen. De verste A is het voeteneinde: dat wijst naar de wind.';
  if (v.t < 0.999) return 'Stap 4: vouw de twee losse flappen naar binnen. Ze gaan onder het dak liggen.';
  return 'Klaar: de flappen zijn je grondzeil. Je ligt met je hoofd bij de hoge, open kant en je voeten in de lage punt.';
}

export default function frietbuil3d() {
  let t = 0;
  let draai = -0.55; let hoek = 0.3;
  let speel = 0; let sleep = null;
  let gezegd = '';

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kd-svg fb-svg', role: 'img', tabindex: '0',
    'aria-roledescription': '3D-beeld' });
  const stap = h('p.kd-vraag', { 'aria-live': 'polite' });
  const zicht = h('p.doe-stil.fb-zicht', { 'aria-live': 'polite' });
  const balk = stappenBalk({ stappen: STAPPEN.map((st) => st.naam), vloeiend: true, label: 'Van plat plastic naar staande frietbuil',
    zet: (w) => { stop(); zet(tVan(w)); } });
  const speelKnop = h('button.knop.klein.hoofd', { type: 'button', onclick: () => (speel ? stop() : speelAf()) }, 'Speel af');
  const zichtKnop = (tekst, d, a) => h('button.chip', { type: 'button', onclick: () => { draai = d; hoek = a; teken(); zeg(); } }, tekst);

  const verminder = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function teken() {
    const v = vorm(t);
    const P = kijker(draai, hoek);
    const vlak = [];                    // [depth, element] of the things that stand up, drawn back to front
    const g = s('g');

    // the ground: a disc of grass with a few lines, so you see how it lies
    const rand = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI; rand.push(P([DOEL[0] + RAND * Math.cos(a), RAND * Math.sin(a), 0])); }
    g.append(s('path', { d: `${pad(rand)}Z`, class: 'fb-grond' }));
    for (let k = -3; k <= 3; k++) {
      const half = Math.sqrt(RAND * RAND - k * k);
      g.append(s('path', { d: pad([P([DOEL[0] + k, -half, 0]), P([DOEL[0] + k, half, 0])]), class: 'fb-raster' }),
        s('path', { d: pad([P([DOEL[0] - half, k, 0]), P([DOEL[0] + half, k, 0])]), class: 'fb-raster' }));
    }
    // wind from the foot end
    const w0 = P([5.05, 0, 0.02]); const w1 = P([4.35, 0, 0.02]);
    const wl = P([4.35, 0.2, 0.02]); const wr = P([4.35, -0.2, 0.02]); const wp = P([4.1, 0, 0.02]);
    g.append(s('path', { d: `${pad([w0, w1])}M${r(wl[0])} ${r(wl[1])}L${r(wp[0])} ${r(wp[1])}L${r(wr[0])} ${r(wr[1])}Z`, class: 'fb-wind' }));
    const wt = P([4.7, 0, 0.3]);
    g.append(s('text', { x: r(wt[0]), y: r(wt[1]), class: 'fb-label blauw', 'text-anchor': 'middle' }, 'wind'));

    // on the ground: the two flaps (the groundsheet) and, when it is done, a sleeping bag
    for (const [Z, K, A] of [v.flapL, v.flapR]) {
      g.append(s('path', { d: `${pad([P(Z), P(K), P(A)])}Z`, class: 'fb-flap' }));
      g.append(s('path', { d: pad([P(Z), P(K), P(A)]), class: 'fb-rand' }));
      if (v.vin < 0.4) {
        const [x, y] = P([(Z[0] + A[0] + 4 * K[0]) / 6, (Z[1] + A[1] + 4 * K[1]) / 6, 0]);
        g.append(s('text', { x: r(x), y: r(y + 4), class: 'fb-flap-tekst', 'text-anchor': 'middle' }, 'grondzeil'));
      }
    }
    if (v.vin > 0.85) {
      const zak = [[0.95, 0.32], [3.2, 0.2], [3.35, 0], [3.2, -0.2], [0.95, -0.32], [0.8, 0]].map(([x, y]) => P([x, y, 0.02]));
      g.append(s('path', { d: `${pad(zak)}Z`, class: 'fb-zak', style: `opacity:${r((v.vin - 0.85) / 0.15)}` }));
      const hoofd = P([0.95, 0, 0.12]);
      g.append(s('circle', { cx: r(hoofd[0]), cy: r(hoofd[1]), r: r(5.5 * AFSTAND / (AFSTAND + hoofd[2])), class: 'fb-hoofd', style: `opacity:${r((v.vin - 0.85) / 0.15)}` }));
    }

    // the two roof triangles, with their tape and the dotted guide line, shaded by how they face the light
    const licht = [-0.45, 0.35, 0.82];
    const dak = (Z, kantJ) => {
      const n = kruis(min(v.A, v.B), min(Z, v.B)); const nl = lengte(n) || 1;
      const f = Math.abs((n[0] * licht[0] + n[1] * licht[1] + n[2] * licht[2]) / nl / lengte(licht));
      const el = s('g');
      el.append(s('path', { d: `${pad([P(v.B), P(v.A), P(Z)])}Z`, class: 'fb-dak',
        style: `fill: color-mix(in srgb, var(--fb-licht) ${Math.round(12 + 38 * f)}%, var(--fb-plastic))` }));
      el.append(s('path', { d: pad([P(Z), P(v.C)]), class: 'fb-stip' }));
      el.append(s('path', { d: `${pad([P(v.B), P(Z), P(v.A)])}`, class: 'fb-tape' }), s('path', { d: pad([P(v.B), P(v.A)]), class: 'fb-tape' }));
      const mid = P([(v.B[0] + v.A[0] + Z[0]) / 3, (v.B[1] + v.A[1] + Z[1]) / 3, (v.B[2] + v.A[2] + Z[2]) / 3]);
      vlak.push([mid[2] + kantJ * 1e-6, el]);
    };
    dak(v.AL, 1); dak(v.AR, -1);

    // the pole with its guy line, and the line up to B
    const top = [PAAL[0], 0, PAAL_HOOG];
    const paal = s('g');
    paal.append(s('path', { d: pad([P(LIJN_HAAK), P(top)]), class: 'fb-touw' }), s('path', { d: pad([P(PAAL), P(top)]), class: 'fb-paal' }));
    vlak.push([P([PAAL[0], 0, 0.8])[2], paal]);
    if (v.hb > 0.01) {
      const touw = s('path', { d: pad([P(top), P(v.B)]), class: 'fb-touw' });
      vlak.push([P([(top[0] + v.B[0]) / 2, 0, (top[2] + v.B[2]) / 2])[2] - 0.01, touw]);
    }
    vlak.sort((a, b) => b[0] - a[0]).forEach(([, el]) => g.append(el));

    // pegs (once B is up), then the letters on top of everything; what lies behind the roof is drawn faint
    const daken = [[v.B, v.A, v.AL], [v.B, v.A, v.AR]].map((d) => d.map(P));
    const achter = (Z) => {
      const [qx, qy, qd] = P(Z);
      return daken.some(([a, b, c]) => {
        const det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
        if (Math.abs(det) < 1) return false;
        const l1 = ((b[1] - c[1]) * (qx - c[0]) + (c[0] - b[0]) * (qy - c[1])) / det;
        const l2 = ((c[1] - a[1]) * (qx - c[0]) + (a[0] - c[0]) * (qy - c[1])) / det;
        const l3 = 1 - l1 - l2;
        return l1 > 0.02 && l2 > 0.02 && l3 > 0.02 && qd > l1 * a[2] + l2 * b[2] + l3 * c[2] + 0.05;
      });
    };
    if (t > OP + 0.001) {
      for (const [Z, uit] of [[v.A, [1, 0]], [v.AL, [0.4, 1]], [v.AR, [0.4, -1]], [LIJN_HAAK, [-1, 0]]]) {
        const kop = P([Z[0] + uit[0] * 0.12, Z[1] + uit[1] * 0.12, 0.22]); const voet = P(Z);
        g.append(s('path', { d: pad([voet, kop]), class: `fb-haring${achter(Z) ? ' achter' : ''}` }));
      }
    } else {
      const [hx, hy] = P(LIJN_HAAK);
      g.append(s('circle', { cx: r(hx), cy: r(hy), r: 2.5, class: 'fb-punt' }));
    }
    const ptop = P(top); g.append(s('text', { x: r(ptop[0]), y: r(ptop[1] - 7), class: 'fb-label', 'text-anchor': 'middle' }, 'paal of tak'));
    for (const [Z, letter] of [[v.B, 'B'], [v.A, 'A'], [v.AL, 'A'], [v.AR, 'A'], [v.C, 'C']]) {
      const [x, y] = P(Z);
      g.append(s('g', achter(Z) ? { class: 'achter' } : {},
        s('circle', { cx: r(x), cy: r(y), r: 10, class: 'fb-letter' }),
        s('text', { x: r(x), y: r(y + 4.5), class: 'fb-letter-tekst', 'text-anchor': 'middle' }, letter)));
    }
    svg.replaceChildren(g);
    svg.setAttribute('aria-label', `Frietbuil in 3D, ${Math.round(t * 100)} procent opgezet, je kijkt ${kant(draai, hoek)}.`);
  }

  /** Says the step (when it changed) and the side you look from. */
  function zeg() {
    const tekst = stapTekst(vorm(t));
    if (tekst !== gezegd) { stap.textContent = tekst; gezegd = tekst; }
    zicht.textContent = `Je kijkt ${kant(draai, hoek)}.`;
  }

  function zet(nt) {
    t = klem(nt);
    balk.zet(plekVan(t));
    teken(); zeg();
  }

  function stop() {
    if (speel) cancelAnimationFrame(speel);
    speel = 0; speelKnop.textContent = 'Speel af';
  }

  function speelAf() {
    if (verminder()) {                // no movement: jump to the next step
      const volgende = STAPPEN.find((st) => st.t > t + 0.001);
      zet(volgende ? volgende.t : 0);
      return;
    }
    if (t >= 0.999) t = 0;
    let vorige = null;
    speelKnop.textContent = 'Stop';
    const tik = (nu) => {
      if (!svg.isConnected) { speel = 0; return; }
      if (vorige != null) zet(t + (nu - vorige) / 6000);
      vorige = nu;
      if (t < 1) speel = requestAnimationFrame(tik); else stop();
    };
    speel = requestAnimationFrame(tik);
  }

  // turn the view: drag (pointer capture, so no listeners on window) or arrow keys
  svg.addEventListener('pointerdown', (e) => {
    sleep = { x: e.clientX, y: e.clientY, d: draai, a: hoek };
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('sleept');
  });
  svg.addEventListener('pointermove', (e) => {
    if (!sleep) return;
    const breed = svg.getBoundingClientRect().width || W;
    draai = sleep.d - ((e.clientX - sleep.x) / breed) * Math.PI * 1.4;
    hoek = klem(sleep.a + ((e.clientY - sleep.y) / breed) * 2.2, 0.12, 1.4);
    teken();
  });
  const los = () => { if (sleep) { sleep = null; svg.classList.remove('sleept'); zeg(); } };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const stap15 = Math.PI / 12;
    if (e.key === 'ArrowLeft') draai += stap15;
    else if (e.key === 'ArrowRight') draai -= stap15;
    else if (e.key === 'ArrowUp') hoek = klem(hoek + stap15 / 1.5, 0.12, 1.4);
    else if (e.key === 'ArrowDown') hoek = klem(hoek - stap15 / 1.5, 0.12, 1.4);
    else return;
    e.preventDefault();
    teken(); zeg();
  });

  zet(0);
  return h('div.kd.naast.doe-frietbuil',
    h('div.fb-beeld', svg, h('p.doe-stil.fb-hint', 'Sleep het beeld om rond te kijken (of gebruik de pijltjestoetsen).')),
    h('div.kd-tekst',
      stap,
      h('div.doe-label', h('span', 'Van plat naar staand'), balk.el),
      h('div.knop-rij', speelKnop),
      h('div.knop-rij.fb-zichten', zichtKnop('Ingang', -1.25, 0.14), zichtKnop('Opzij', 0, 0.3), zichtKnop('Voeteneinde', 1.45, 0.4), zichtKnop('Bovenaf', -0.3, 1.38)),
      zicht));
}
