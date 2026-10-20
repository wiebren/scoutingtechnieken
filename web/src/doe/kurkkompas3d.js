// A compass of cork and a needle, in 3D: the needle stroked with a magnet, laid on a slice of cork, the cork put in
// a bowl of water, and there the needle turns north-south. A stappenbalk (or "Speel af") goes through it; drag the
// picture (or use the arrow keys) to look from another side. A small hand-made projection as in
// kamperen/frietbuil3d.js, no 3D library; everything in cm, z up, north is +y.
import { h } from '../dom.js';
import { stappenBalk } from './stappen.js';
import { s } from './kompasdelen.js';
import './vorm.css';
import './kurkkompas.css';

const W = 400; const H = 280;
const DOEL = [-2, 0, 2];                 // the point the view turns around
const SCHAAL = 8; const AFSTAND = 120;   // px per cm, and the eye's distance

const TAFEL = [-25, 23, -18, 16];        // x from, x to, y from, y to
const BAK = [6, 0]; const BAK_R = 9; const BAK_ONDER = 8; const BAK_HOOG = 5; const WATER = 4;
const KURK_R = 2.3; const KURK_DIK = 0.9; const ZINK = 0.45;   // a slice of cork, half of it under water
const NAALD = 7;                          // cm, from the eye to the point
const NAALD_OP_TAFEL = [-12, -4];
const KURK_OP_TAFEL = [-12, 6];
const MAGNEET = { lang: 6, dik: 1.4 };
const MAGNEET_RUST = { c: [-17, -13, MAGNEET.dik / 2], a: [1, 0, 0] };
const STREKEN = 4;                        // strokes shown (the text says about 25)

const STAPPEN = ['Klaarleggen', 'Strijken', 'Op de kurk', 'In het water', 'Noord-zuid'];
const TEKST = [
  'Je hebt nodig: een naald, een magneet, een plakje kurk en een bakje water.',
  'Stap 1: strijk de naald zo’n 25 keer met de magneet. Van het oog naar de punt, steeds dezelfde kant op. Til de magneet op als je teruggaat.',
  'Stap 2: plak de naald op het plakje kurk.',
  'Stap 3: leg de kurk in het bakje water, uit de buurt van de magneet.',
  'Stap 4: de naald draait zich noord-zuid. Welke kant noord is, kijk je na met een echt kompas of met de zon. Zet daar een merkje.',
];

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const zacht = (x) => x * x * (3 - 2 * x);
const tussen = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const plus = (a, b) => a.map((v, i) => v + b[i]);
const keer = (a, k) => a.map((v) => v * k);
const eenheid = (a) => keer(a, 1 / (Math.hypot(...a) || 1));
const r = (n) => Math.round(n * 10) / 10;
const pad = (pts) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`;
const richting = (g) => [Math.sin((g * Math.PI) / 180), Math.cos((g * Math.PI) / 180)];   // degrees from north

/** The projection for a view (yaw, pitch in radians): world point → [x, y, depth] on the screen. */
function kijker(draai, hoek) {
  const [cd, sd, ch, sh] = [Math.cos(draai), Math.sin(draai), Math.cos(hoek), Math.sin(hoek)];
  return ([x, y, z]) => {
    const [px, py, pz] = [x - DOEL[0], y - DOEL[1], z - DOEL[2]];
    const X = px * cd + py * sd; const Y = -px * sd + py * cd;
    const op = pz * ch + Y * sh; const diep = Y * ch - pz * sh;
    const k = AFSTAND / (AFSTAND + diep);
    return [W / 2 + X * SCHAAL * k, H * 0.55 - op * SCHAAL * k, diep];
  };
}

/** The convex hull of points on the screen (monotone chain), for the outline of a round thing. */
function omtrek(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const kr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const helft = (lijst) => {
    const uit = [];
    for (const q of lijst) { while (uit.length >= 2 && kr(uit.at(-2), uit.at(-1), q) <= 0) uit.pop(); uit.push(q); }
    uit.pop(); return uit;
  };
  return [...helft(p), ...helft(p.toReversed())];
}

const ring = (cx, cy, z, straal, n = 40) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * 2 * Math.PI; return [cx + straal * Math.cos(a), cy + straal * Math.sin(a), z];
});

/** Where everything is at place w on the stappenbalk (0 = laid out ... 4 = north-south). */
function stand(w) {
  // the magnet: strokes along the needle while w goes from 0 to 1, then back to its place
  const oog = [NAALD_OP_TAFEL[0] - NAALD / 2, NAALD_OP_TAFEL[1], 0.15];
  const punt = [NAALD_OP_TAFEL[0] + NAALD / 2, NAALD_OP_TAFEL[1], 0.15];
  const schuin = eenheid([-0.45, -0.2, 0.87]);
  const opNaald = (raak) => ({ c: plus(raak, keer(schuin, MAGNEET.lang / 2)), a: schuin });
  let magneet = MAGNEET_RUST;
  const m = klem(w);
  if (m > 0 && m < 1) {
    if (m < 0.1) magneet = mengMagneet(MAGNEET_RUST, opNaald(plus(oog, [0, 0, 3])), zacht(m / 0.1));
    else if (m > 0.9) magneet = mengMagneet(opNaald(oog), MAGNEET_RUST, zacht((m - 0.9) / 0.1));
    else {
      const k = ((m - 0.1) / 0.8) * STREKEN; const f = k - Math.floor(k);
      if (f < 0.6) magneet = opNaald(tussen(oog, punt, zacht(f / 0.6)));
      else { const g = (f - 0.6) / 0.4; magneet = opNaald(plus(tussen(punt, oog, zacht(g)), [0, 0, 3.5 * Math.sin(Math.PI * g)])); }
    }
  }

  // the cork and the needle on it
  const op = zacht(klem(w - 1));            // the needle onto the cork
  const naar = zacht(klem(w - 2));          // the cork into the water
  const draait = klem(w - 3);               // turning north-south: past it and back, then still
  const kurkXY = tussen(KURK_OP_TAFEL, BAK, naar);
  const kurkZ = (WATER - ZINK) * naar + 6 * Math.sin(Math.PI * naar);
  const koers = 90 * (1 - draait) ** 2 * Math.cos(2.2 * Math.PI * draait);   // the eye's heading: east, then north
  let naald;
  if (op < 1) {
    const xy = tussen(NAALD_OP_TAFEL, KURK_OP_TAFEL, op);
    naald = { c: [xy[0], xy[1], 0.15 + (KURK_DIK + 0.15 - 0.15) * op + 3 * Math.sin(Math.PI * op)], koers: 90 };
  } else naald = { c: [kurkXY[0], kurkXY[1], kurkZ + KURK_DIK + 0.15], koers };
  return { magneet, kurk: { c: [kurkXY[0], kurkXY[1], kurkZ] }, naald, opKurk: op >= 1, merk: klem((w - 3.75) / 0.25) };
}

function mengMagneet(a, b, f) { return { c: tussen(a.c, b.c, f), a: eenheid(tussen(a.a, b.a, f)) }; }

export default function kurkkompas3d() {
  let w = 0;
  let draai = -0.3; let hoek = 0.62;
  let speel = 0; let sleep = null; let gezegd = '';

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kd-svg kc-svg', role: 'img', tabindex: '0', 'aria-roledescription': '3D-beeld' });
  const stap = h('p.kd-vraag', { 'aria-live': 'polite' });
  const balk = stappenBalk({ stappen: STAPPEN, vloeiend: true, label: 'Een kompas van kurk en naald maken', zet: (v) => { stop(); zet(v); } });
  const speelKnop = h('button.knop.klein.hoofd', { type: 'button', onclick: () => (speel ? stop() : speelAf()) }, 'Speel af');
  const verminder = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function teken() {
    const v = stand(w);
    const P = kijker(draai, hoek);
    const g = s('g');
    const dingen = [];                       // [depth, element], drawn back to front

    // the table, and an arrow to the north on it
    const [x0, x1, y0, y1] = TAFEL;
    g.append(s('path', { d: `${pad([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]].map(P))}Z`, class: 'kc-tafel' }));
    for (let x = x0 + 6; x < x1; x += 6) g.append(s('path', { d: pad([P([x, y0, 0]), P([x, y1, 0])]), class: 'kc-nerf' }));
    const nx = 19.5; const [pa, pb] = [P([nx, -10, 0]), P([nx, 9, 0])];
    const kop = [P([nx - 1.3, 6.5, 0]), pb, P([nx + 1.3, 6.5, 0])];
    g.append(s('path', { d: `${pad([pa, pb])}${pad(kop)}`, class: 'kc-noord' }));
    const nt = P([nx, 11.5, 0]);
    g.append(s('text', { x: r(nt[0]), y: r(nt[1]), class: 'kc-label kc-n', 'text-anchor': 'middle' }, 'N'));

    // the magnet: a bar, the end that strokes red
    const mg = s('g');
    const zij = eenheid(Math.abs(v.magneet.a[2]) > 0.9 ? [1, 0, 0] : [-v.magneet.a[1], v.magneet.a[0], 0]);
    const op = eenheid([v.magneet.a[1] * zij[2] - v.magneet.a[2] * zij[1], v.magneet.a[2] * zij[0] - v.magneet.a[0] * zij[2], v.magneet.a[0] * zij[1] - v.magneet.a[1] * zij[0]]);
    const blok = (van, tot, klasse) => {
      const hoek8 = [];
      for (const l of [van, tot]) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        hoek8.push(plus(plus(plus(v.magneet.c, keer(v.magneet.a, l)), keer(zij, (a * MAGNEET.dik) / 2)), keer(op, (b * MAGNEET.dik) / 2)));
      }
      const vlakken = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
      return vlakken.map((f, i) => {
        const pts = f.map((k) => P(hoek8[k]));
        return [pts.reduce((som, p) => som + p[2], 0) / 4, s('path', { d: `${pad(pts)}Z`, class: `${klasse}${i > 1 && i % 2 ? ' donker' : ''}` })];
      });
    };
    const L = MAGNEET.lang / 2;
    [...blok(-L, 0, 'kc-magneet-rood'), ...blok(0, L, 'kc-magneet')].sort((a, b) => b[0] - a[0]).forEach(([, el]) => mg.append(el));
    dingen.push([P(v.magneet.c)[2], mg]);

    // the needle: a thin line with its eye; and the cork it lies on
    const tekenNaald = (bij) => {
      const [dx, dy] = richting(v.naald.koers);
      const half = [(dx * NAALD) / 2, (dy * NAALD) / 2, 0];
      const oog = P(plus(v.naald.c, keer(half, -1))); const punt = P(plus(v.naald.c, half));
      bij.append(s('path', { d: pad([oog, punt]), class: 'kc-naald' }));
      const k = AFSTAND / (AFSTAND + oog[2]);
      bij.append(s('circle', { cx: r(oog[0]), cy: r(oog[1]), r: r(2.6 * k), class: 'kc-oog' }));
    };
    const tekenKurk = (bij) => {
      const [cx, cy, cz] = v.kurk.c;
      const boven = ring(cx, cy, cz + KURK_DIK, KURK_R).map(P); const onder = ring(cx, cy, cz, KURK_R).map(P);
      bij.append(s('path', { d: `${pad(omtrek([...boven, ...onder]))}Z`, class: 'kc-kurk-zij' }), s('path', { d: `${pad(boven)}Z`, class: 'kc-kurk' }));
      if (v.opKurk) tekenNaald(bij);
      if (v.merk > 0) {   // the mark at the north end, once it has settled
        const m = P([cx, cy + KURK_R * 0.75, cz + KURK_DIK + 0.05]);
        bij.append(s('circle', { cx: r(m[0]), cy: r(m[1]), r: 3.2, class: 'kc-merk', style: `opacity:${r(v.merk)}` }));
      }
    };
    if (!v.opKurk) { const n = s('g'); tekenNaald(n); dingen.push([P(v.naald.c)[2], n]); }

    // the bowl, with the cork in it once it is close: the opening and the water, then the wall in front
    const inBak = Math.hypot(v.kurk.c[0] - BAK[0], v.kurk.c[1] - BAK[1]) < BAK_R - 2 && v.kurk.c[2] < BAK_HOOG + 1;
    const bak = s('g');
    const rand = ring(BAK[0], BAK[1], BAK_HOOG, BAK_R, 64).map(P); const bodem = ring(BAK[0], BAK[1], 0, BAK_ONDER, 64).map(P);
    bak.append(s('path', { d: `${pad(omtrek([...rand, ...bodem]))}Z`, class: 'kc-bak' }));
    bak.append(s('path', { d: `${pad(rand)}Z`, class: 'kc-bak-binnen' }));
    const water = ring(BAK[0], BAK[1], WATER, BAK_ONDER + ((BAK_R - BAK_ONDER) * WATER) / BAK_HOOG, 64).map(P);
    bak.append(s('path', { d: `${pad(water)}Z`, class: 'kc-water' }));
    if (inBak) tekenKurk(bak);
    // the wall in front: the near half of the rim, down to the near half of the bottom
    const midden = P([BAK[0], BAK[1], 0])[2];
    const voorRand = []; const voorBodem = [];
    for (let i = 0; i < 64; i++) { if (rand[i][2] < P([BAK[0], BAK[1], BAK_HOOG])[2]) voorRand.push(i); if (bodem[i][2] < midden) voorBodem.push(i); }
    const opVolgorde = (idx) => { const k = idx.findIndex((i, j) => j > 0 && i !== idx[j - 1] + 1); return k > 0 ? [...idx.slice(k), ...idx.slice(0, k)] : idx; };
    const vr = opVolgorde(voorRand).map((i) => rand[i]); const vb = opVolgorde(voorBodem).map((i) => bodem[i]);
    if (vr.length && vb.length) bak.append(s('path', { d: `${pad([...vr, ...vb.toReversed()])}Z`, class: 'kc-bak-voor' }));
    bak.append(s('path', { d: pad(vr), class: 'kc-bak-lip' }));
    dingen.push([midden, bak]);
    if (!inBak) { const k = s('g'); tekenKurk(k); dingen.push([P(v.kurk.c)[2] - 0.01, k]); }

    dingen.sort((a, b) => b[0] - a[0]).forEach(([, el]) => g.append(el));

    // the names, on top
    const label = (p, tekst, dy = -10) => { const [x, y] = P(p); g.append(s('text', { x: r(x), y: r(y + dy), class: 'kc-label', 'text-anchor': 'middle' }, tekst)); };
    label(plus(v.magneet.c, keer(v.magneet.a, MAGNEET.lang / 2)), 'magneet', -8);
    if (!v.opKurk) {   // past the point of the needle, whichever way it lies on the screen
      const [dx, dy] = richting(v.naald.koers);
      const a = P(v.naald.c); const b = P(plus(v.naald.c, [(dx * NAALD) / 2, (dy * NAALD) / 2, 0]));
      const [ux, uy] = eenheid([b[0] - a[0], b[1] - a[1]]);
      g.append(s('text', { x: r(b[0] + ux * 8), y: r(b[1] + uy * 8 + 4), class: 'kc-label',
        'text-anchor': ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle' }, 'naald'));
    }
    if (!v.opKurk) label(plus(v.kurk.c, [0, 0, KURK_DIK]), 'kurk', -12);
    else if (!inBak) label(plus(v.kurk.c, [0, 0, KURK_DIK]), 'naald op kurk', -12);
    else {   // beside the bowl, with a line to the cork, so the needle stays in sight
      const [kx, ky] = P(plus(v.kurk.c, [0, 0, KURK_DIK]));
      const [bx, by] = P([BAK[0] - BAK_R - 1.5, BAK[1], BAK_HOOG]);
      g.append(s('path', { d: pad([[bx + 4, by], [kx - 9, ky]]), class: 'kc-wijs' }),
        s('text', { x: r(bx), y: r(by + 4), class: 'kc-label', 'text-anchor': 'end' }, 'naald op kurk'));
    }
    label([BAK[0], BAK[1] - BAK_R, 0], 'bakje water', 18);
    svg.replaceChildren(g);
  }

  function zet(nw) {
    w = klem(nw, 0, STAPPEN.length - 1);
    balk.zet(w);
    teken();
    const tekst = TEKST[Math.min(STAPPEN.length - 1, Math.ceil(w - 0.001))];
    if (tekst !== gezegd) { stap.textContent = tekst; svg.setAttribute('aria-label', `Kompas van kurk en naald in 3D. ${tekst}`); gezegd = tekst; }
  }

  function stop() {
    if (speel) cancelAnimationFrame(speel);
    speel = 0; speelKnop.textContent = 'Speel af';
  }

  function speelAf() {
    const eind = STAPPEN.length - 1;
    if (verminder()) { zet(w >= eind ? 0 : Math.floor(w + 0.001) + 1); return; }   // no movement: the next step
    if (w >= eind) w = 0;
    let vorige = null;
    speelKnop.textContent = 'Stop';
    const tik = (nu) => {
      if (!svg.isConnected) { speel = 0; return; }
      if (vorige != null) zet(w + (nu - vorige) / 3600);
      vorige = nu;
      if (w < eind) speel = requestAnimationFrame(tik); else stop();
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
    hoek = klem(sleep.a + ((e.clientY - sleep.y) / breed) * 2.2, 0.15, 1.45);
    teken();
  });
  const los = () => { if (sleep) { sleep = null; svg.classList.remove('sleept'); } };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    const d = Math.PI / 12;
    if (e.key === 'ArrowLeft') draai += d;
    else if (e.key === 'ArrowRight') draai -= d;
    else if (e.key === 'ArrowUp') hoek = klem(hoek + d / 1.5, 0.15, 1.45);
    else if (e.key === 'ArrowDown') hoek = klem(hoek - d / 1.5, 0.15, 1.45);
    else return;
    e.preventDefault();
    teken();
  });

  zet(0);
  return h('div.kd.naast.doe-kurkkompas',
    h('div.kc-beeld', svg, h('p.doe-stil.kc-hint', 'Sleep het beeld om rond te kijken (of gebruik de pijltjestoetsen).')),
    h('div.kd-tekst', stap, h('div.doe-label', h('span', 'Stap voor stap'), balk.el), h('div.knop-rij', speelKnop)));
}
