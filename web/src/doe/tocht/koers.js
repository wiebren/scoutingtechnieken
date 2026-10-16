// Walk a route that is given as directions and distances: a helikopterroute, a vectorroute (with a fixed or a
// turning north arrow), a blinde lijn, a vliegkoers or a kompasroute. Left the route as you get it; right the
// terrain, seen from above, where you walk it.
//
// For the drawn notations you first measure each piece: a protractor and a ruler lie on the piece you are at, turned
// to the north arrow that counts for it. You type what you read (or aim on the terrain with a finger), and walk.
// For a vliegkoers and a kompasroute the numbers are given; there you aim on the terrain. Each piece is walked as
// you set it, so mistakes add up, as they do outside. The post is hidden until the end.
import { h } from '../../dom.js';
import { norm, pol, s } from '../kompasdelen.js';
import '../vorm.css';
import './koers.css';

const M = 0.4;                      // terrain: pixels per metre (1000 × 700 m in 400 × 280)
const B = 400; const H = 280;
const VANGST = 40;                  // within this many metres of the post you find it
const r1 = (n) => Math.round(n * 10) / 10;
const verschil = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

const SOORTEN = {
  helikopter: { meten: true, naam: 'helikopterroute' },
  vector: { meten: true, naam: 'vectorroute met een vaste noordpijl' },
  'vector-draai': { meten: true, naam: 'vectorroute met een draaiende noordpijl' },
  blind: { meten: true, naam: 'blinde lijn' },
  vliegkoers: { meten: false, naam: 'vliegkoers' },
  kompasroute: { meten: false, naam: 'kompasroute' },
};

/** A route of 3 or 4 pieces that stays on the terrain and never doubles back on itself. */
function maakRoute() {
  for (;;) {
    const n = 3 + Math.floor(Math.random() * 2);
    let x = 300 + Math.random() * 400; let y = 220 + Math.random() * 260;
    const start = [x, y]; const benen = []; let ok = true;
    for (let i = 0; i < n && ok; i++) {
      const g = Math.floor(Math.random() * 72) * 5; const m = 120 + Math.floor(Math.random() * 21) * 10;
      if (benen.length && verschil(g, benen.at(-1).g) > 130) { ok = false; break; }
      const [nx, ny] = pol(x, y, m, g);
      if (nx < 50 || nx > 950 || ny < 50 || ny > 650) { ok = false; break; }
      benen.push({ g, m, draai: Math.floor(Math.random() * 72) * 5 }); x = nx; y = ny;
    }
    if (ok) return { start, benen, eind: [x, y] };
  }
}

/** A thick north arrow from (x, y) out at `hoek`, double-shafted if asked. */
function noord(x, y, hoek, lengte, dubbel) {
  return s('g', { transform: `translate(${r1(x)} ${r1(y)}) rotate(${hoek})`, class: 'ko-noord' },
    dubbel ? s('path', { d: `M-2.5 0V${-lengte + 9}M2.5 0V${-lengte + 9}` }) : s('path', { d: `M0 0V${-lengte + 9}`, class: 'ko-dik' }),
    s('path', { d: `M-7 ${-lengte + 11}L0 ${-lengte - 1}L7 ${-lengte + 11}Z`, class: 'ko-noord-punt' }),
    s('text', { x: 0, y: -lengte - 5, 'text-anchor': 'middle', transform: `rotate(${-hoek} 0 ${-lengte - 9})`, class: 'ko-n' }, 'N'));
}
function pijl(x1, y1, x2, y2, klasse) {
  const a = Math.atan2(y2 - y1, x2 - x1); const p = 8;
  const punt = (d) => `${r1(x2 - p * Math.cos(a + d))} ${r1(y2 - p * Math.sin(a + d))}`;
  return s('g', { class: klasse }, s('path', { d: `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}` }), s('path', { d: `M${punt(0.5)}L${r1(x2)} ${r1(y2)}L${punt(-0.5)}Z`, class: 'ko-punt' }));
}
const tekst = (x, y, t, klasse = 'ko-label') => s('text', { x: r1(x), y: r1(y), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: klasse }, String(t));

/** The notation as you get it, and per piece where it starts, which way its north points and its scale. */
function notatie(soort, route) {
  const g = s('g'); const plek = [];
  const { benen } = route;
  if (soort === 'helikopter') {
    const c = [120, 130]; const px = 0.32;    // the longest piece (320 m) and its number stay inside
    g.append(noord(c[0], c[1], 0, 96, false));
    benen.forEach((b, i) => {
      const [x, y] = pol(c[0], c[1], b.m * px, b.g); const [tx, ty] = pol(c[0], c[1], b.m * px + 12, b.g);
      g.append(pijl(c[0], c[1], x, y, 'ko-been'), tekst(tx, ty, i + 1, 'ko-nr'));
      plek.push({ x: c[0], y: c[1], noord: 0, px, eind: [x, y] });
    });
    g.append(s('circle', { cx: c[0], cy: c[1], r: 3.5, class: 'ko-stip' }));
    return { g, plek, schaal: px };
  }
  if (soort === 'vector') {
    const px = 0.24; const x = 120; const boven = 46; const stap = (220 - boven) / benen.length;
    g.append(noord(x, boven - 4, 0, 34, true), s('path', { d: `M${x} ${boven}V${boven + stap * benen.length + 6}`, class: 'ko-ruggengraat' }));
    benen.forEach((b, i) => {
      const y = boven + 14 + i * stap; const [ex, ey] = pol(x, y, b.m * px, b.g);
      g.append(pijl(x, y, ex, ey, 'ko-been'), s('circle', { cx: x, cy: y, r: 3, class: 'ko-stip' }), tekst(x + (b.g > 180 ? 12 : -12), y - 8, i + 1, 'ko-nr'));
      plek.push({ x, y, noord: 0, px, eind: [ex, ey] });
    });
    return { g, plek, schaal: px };
  }
  if (soort === 'vector-draai') {
    const px = 0.15;
    benen.forEach((b, i) => {
      const cx = 62 + (i % 2) * 116; const cy = 66 + Math.floor(i / 2) * 120;
      const [ex, ey] = pol(cx, cy, b.m * px, b.draai + b.g);
      g.append(noord(cx, cy, b.draai, 40, true), pijl(cx, cy, ex, ey, 'ko-been'), s('circle', { cx, cy, r: 3.5, class: 'ko-stip' }), tekst(cx - 44, cy - 44, i + 1, 'ko-nr'));
      plek.push({ x: cx, y: cy, noord: b.draai, px, eind: [ex, ey] });
    });
    return { g, plek, schaal: px };
  }
  // blind: the line itself, to scale, with a north arrow
  let x = 0; let y = 0; let punten = [[0, 0]];
  for (const b of benen) { [x, y] = pol(x, y, b.m, b.g); punten.push([x, y]); }
  const span = Math.max(...punten.map((p) => p[0])) - Math.min(...punten.map((p) => p[0]));
  const hoog = Math.max(...punten.map((p) => p[1])) - Math.min(...punten.map((p) => p[1]));
  const px = Math.min(0.3, 190 / span, 180 / hoog);
  punten = punten.map(([a, b]) => [a * px, b * px]);
  const xs = punten.map((p) => p[0]); const ys = punten.map((p) => p[1]);
  const dx = 120 - (Math.min(...xs) + Math.max(...xs)) / 2; const dy = 124 - (Math.min(...ys) + Math.max(...ys)) / 2;
  const pt = punten.map(([a, b]) => [a + dx, b + dy]);
  g.append(s('path', { d: `M${pt.map((p) => p.map(r1).join(' ')).join('L')}`, class: 'ko-lijn' }), s('circle', { cx: r1(pt[0][0]), cy: r1(pt[0][1]), r: 4.5, class: 'ko-stip' }));
  benen.forEach((b, i) => {
    const [mx, my] = [(pt[i][0] + pt[i + 1][0]) / 2, (pt[i][1] + pt[i + 1][1]) / 2];
    const [tx, ty] = pol(mx, my, 11, b.g - 90);
    g.append(tekst(tx, ty, i + 1, 'ko-nr'));
    plek.push({ x: pt[i][0], y: pt[i][1], noord: 0, px, eind: pt[i + 1] });
  });
  g.append(noord(222, 230, 0, 30, false));
  return { g, plek, schaal: px };
}

/** A scale bar for the notation: 100 m at `px` pixels per metre. */
function schaalstok(px, x, y) {
  return s('g', { class: 'ko-schaal' }, s('path', { d: `M${x} ${y}h${r1(100 * px)}M${x} ${y - 4}v8M${r1(x + 100 * px)} ${y - 4}v8` }), tekst(x + 50 * px, y + 11, '100 m', 'ko-klein'));
}

/** The protractor and the ruler on a piece: centred on its start, 0° on its north. */
function meetlat({ x, y, noord: n, px }, m) {
  const g = s('g', { class: 'ko-meet', 'aria-hidden': 'true' });
  const R = 48;
  g.append(s('circle', { cx: r1(x), cy: r1(y), r: R, class: 'ko-gradenboog' }));
  for (let d = 0; d < 360; d += 5) {
    const lang = d % 30 === 0 ? 9 : d % 10 === 0 ? 6 : 3;
    const [x1, y1] = pol(x, y, R, n + d); const [x2, y2] = pol(x, y, R - lang, n + d);
    g.append(s('path', { d: `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`, class: d % 30 ? 'ko-streepje' : 'ko-streepje vet' }));
    if (d % 30 === 0) { const [tx, ty] = pol(x, y, R + 9, n + d); g.append(tekst(tx, ty, d, 'ko-graad')); }
  }
  return { g, lengte: Math.ceil((m + 60) / 50) * 50 };
}

export default function koers({ soort = 'helikopter' } = {}) {
  const SOORT = SOORTEN[soort];
  let route; let stuk; let pos; let pad; let mik; let klaar; let goedGemeten;

  // -- the elements
  const notatieSvg = s('svg', { viewBox: '0 0 240 266', class: 'ko-notatie', role: 'img' });
  const lijst = h('ol.ko-lijst');
  const terrein = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'ko-terrein', role: 'application', tabindex: '0' });
  const veldG = h('input.doe-veld.ko-getal', { type: 'number', inputmode: 'numeric', min: 0, max: 359, step: 1, 'aria-label': 'Koers in graden' });
  const veldM = h('input.doe-veld.ko-getal', { type: 'number', inputmode: 'numeric', min: 10, max: 900, step: 10, 'aria-label': 'Afstand in meters' });
  const loop = h('button.knop.hoofd', { type: 'button', onclick: () => loopStuk() }, 'Loop dit stuk');
  const opnieuw = h('button.knop', { type: 'button', onclick: () => begin() }, 'Nieuwe route');
  const opdracht = h('p.ko-opdracht');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });

  const el = h('div.doe-koers',
    h('div.ko-links', h('p.doe-stil', SOORT.meten ? 'Zo krijg je de route:' : 'De route:'), SOORT.meten || soort === 'vliegkoers' ? notatieSvg : lijst),
    h('div.ko-rechts',
      h('p.doe-stil', 'Het terrein, noord is boven. Tik of sleep vanaf je plek om te mikken, of typ de koers.'),
      terrein,
      opdracht,
      h('div.ko-velden', h('label.doe-label', h('span', 'Koers (°)'), veldG), h('label.doe-label', h('span', 'Afstand (m)'), veldM), loop),
      melding, stand, h('div.knop-rij', opnieuw)));

  // -- the terrain: a grid of 100 m, a few woods and a fen, a scale bar
  function tekenTerrein() {
    terrein.replaceChildren();
    terrein.append(s('rect', { x: 0, y: 0, width: B, height: H, class: 'ko-grond' }));
    for (let i = 1; i < 10; i++) terrein.append(s('path', { d: `M${i * 40} 0V${H}`, class: 'ko-raster' }));
    for (let j = 1; j < 7; j++) terrein.append(s('path', { d: `M0 ${j * 40}H${B}`, class: 'ko-raster' }));
    terrein.append(
      s('path', { d: 'M20 30q40 -20 80 4t40 50q-30 30 -80 14t-40 -68z', class: 'ko-bos' }),
      s('path', { d: 'M270 190q50 -24 100 0t10 60q-40 20 -90 0t-20 -60z', class: 'ko-bos' }),
      s('path', { d: 'M300 40q30 -14 56 6t-6 40q-30 10 -48 -10t-2 -36z', class: 'ko-water' }),
      s('g', { class: 'ko-schaal' }, s('path', { d: `M12 ${H - 12}h${100 * M}M12 ${H - 16}v8M${12 + 100 * M} ${H - 16}v8` }), tekst(12 + 50 * M, H - 22, '100 m', 'ko-klein')),
      noord(B - 16, 40, 0, 26, false));
    terrein.append(padG, mikG, s('circle', { cx: r1(route.start[0] * M), cy: r1(route.start[1] * M), r: 5, class: 'ko-startpunt' }), postG, ikG);
  }
  const padG = s('g'); const mikG = s('g'); const postG = s('g'); const ikG = s('g');

  function tekenNotatie() {
    if (!SOORT.meten) {
      lijst.replaceChildren(...route.benen.map((b, i) => h('li', { class: i === stuk ? 'nu' : i < stuk ? 'gedaan' : null }, h('strong', `${b.g}°`), ` · ${b.m} m`)));
      if (soort === 'vliegkoers') {
        // a strip, read from the bottom up: course left of each dash, distance right of it
        const n = route.benen.length; const hoog = 60 + n * 46; const x = 120;
        const g = s('g', { class: 'ko-vlieg' }, s('path', { d: `M${x} ${hoog - 18}V22` }), s('circle', { cx: x, cy: hoog - 18, r: 5, class: 'ko-stip' }), s('path', { d: `M${x - 34} 22H${x + 34}` }));
        route.benen.forEach((b, i) => {
          const y = hoog - 18 - (i + 1) * 46 + 10;
          const k = i === stuk ? ' nu' : i < stuk ? ' gedaan' : '';
          g.append(s('path', { d: `M${x - 18} ${y}H${x + 18}`, class: k.trim() }),
            tekst(x - 26, y, `${b.g}°`, `ko-vlieg-t links${k}`), tekst(x + 26, y, `${b.m} m`, `ko-vlieg-t rechts${k}`));
        });
        notatieSvg.setAttribute('viewBox', `0 0 240 ${hoog}`);
        notatieSvg.setAttribute('aria-label', `Vliegkoers, van onder naar boven: ${route.benen.map((b) => `${b.g} graden, ${b.m} meter`).join('; ')}.`);
        notatieSvg.replaceChildren(g);
      }
      return;
    }
    const { g, plek, schaal } = notatie(soort, route);
    notatieSvg.replaceChildren(g, schaalstok(schaal, 14, 252));
    notatieSvg.setAttribute('aria-label', `De ${SOORT.naam} met ${route.benen.length} genummerde stukken. Je bent bij stuk ${Math.min(stuk + 1, route.benen.length)}.`);
    [...g.querySelectorAll('.ko-been')].forEach((b, i) => b.classList.toggle('nu', i === stuk));
    if (soort === 'blind') {
      // the piece you are at in blue on top of the line
      const p = plek[stuk];
      if (p) notatieSvg.append(s('path', { d: `M${r1(p.x)} ${r1(p.y)}L${r1(p.eind[0])} ${r1(p.eind[1])}`, class: 'ko-lijn nu' }));
    }
    const p = plek[stuk];
    if (p && !klaar) {
      const b = route.benen[stuk];
      const { g: meet, lengte } = meetlat(p, b.m);
      // the ruler along the piece, ticks every 50 m
      const dir = (p.noord + b.g);
      const lat = s('g', { class: 'ko-lat' });
      const [ex, ey] = pol(p.x, p.y, lengte * p.px, dir);
      lat.append(s('path', { d: `M${r1(p.x)} ${r1(p.y)}L${r1(ex)} ${r1(ey)}` }));
      for (let m = 50; m <= lengte; m += 50) {
        const [tx, ty] = pol(p.x, p.y, m * p.px, dir);
        const [ax, ay] = pol(tx, ty, m % 100 ? 3 : 6, dir + 90); const [bx, by] = pol(tx, ty, m % 100 ? 3 : 6, dir - 90);
        lat.append(s('path', { d: `M${r1(ax)} ${r1(ay)}L${r1(bx)} ${r1(by)}` }));
        if (m % 100 === 0 && m * p.px > 70) { const [lx, ly] = pol(tx, ty, 10, dir - 90); lat.append(tekst(lx, ly, m, 'ko-graad')); }
      }
      notatieSvg.append(meet, lat);
    }
  }

  function tekenPad() {
    padG.replaceChildren();
    if (pad.length > 1) padG.append(s('path', { d: `M${pad.map(([x, y]) => `${r1(x * M)} ${r1(y * M)}`).join('L')}`, class: 'ko-gelopen' }));
    ikG.replaceChildren(s('circle', { cx: r1(pos[0] * M), cy: r1(pos[1] * M), r: 6, class: 'ko-ik' }));
  }

  function tekenMik() {
    mikG.replaceChildren();
    if (klaar || mik == null) return;
    const [x, y] = [pos[0] * M, pos[1] * M];
    const ring = s('g', { class: 'ko-ring' }, s('circle', { cx: r1(x), cy: r1(y), r: 34 }));
    for (let d = 0; d < 360; d += 10) {
      const [x1, y1] = pol(x, y, 34, d); const [x2, y2] = pol(x, y, d % 90 ? 30 : 26, d);
      ring.append(s('path', { d: `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}` }));
    }
    const [nx, ny] = pol(x, y, 44, 0); ring.append(tekst(nx, ny, 'N', 'ko-n'));
    const [ex, ey] = pol(x, y, Math.max(mik.m * M, 6), mik.g);
    mikG.append(ring, pijl(x, y, ex, ey, 'ko-mik'));
  }

  function zetMik(g, m, { velden = true } = {}) {
    mik = { g: norm(g), m: Math.max(10, Math.min(900, Math.round(m / 5) * 5)) };
    if (velden) { veldG.value = mik.g; veldM.value = mik.m; }
    tekenMik();
  }

  function opdrachtTekst() {
    const n = route.benen.length;
    if (klaar) return '';
    if (SOORT.meten) return `Stuk ${stuk + 1} van ${n}: meet de koers met de gradenboog en de afstand met de liniaal, vul ze in en loop.`;
    const b = route.benen[stuk];
    return `Stuk ${stuk + 1} van ${n}: loop ${b.g}° en ${b.m} m. Mik vanaf je plek.`;
  }

  function begin() {
    route = maakRoute(); stuk = 0; pos = [...route.start]; pad = [[...route.start]]; mik = null; klaar = false; goedGemeten = 0;
    postG.replaceChildren();
    veldG.value = ''; veldM.value = ''; loop.disabled = false; veldG.disabled = false; veldM.disabled = false;
    melding.textContent = ''; melding.classList.remove('fout');
    tekenTerrein(); tekenNotatie(); tekenPad(); tekenMik();
    opdracht.textContent = opdrachtTekst();
    terrein.setAttribute('aria-label', 'Het terrein, noord is boven. Met de pijltjes links en rechts draai je de koers, omhoog en omlaag maakt het stuk langer of korter, Enter loopt het.');
  }

  function loopStuk() {
    if (klaar) return;
    const g = Number(veldG.value); const m = Number(veldM.value);
    if (veldG.value === '' || veldM.value === '' || !Number.isFinite(g) || !Number.isFinite(m) || m <= 0) {
      melding.classList.add('fout'); melding.textContent = 'Vul eerst een koers en een afstand in, of mik op het terrein.'; return;
    }
    const b = route.benen[stuk];
    const dg = verschil(g, b.g); const dm = Math.abs(m - b.m);
    const goedG = dg <= 5; const goedM = dm <= Math.max(20, b.m * 0.1);
    if (goedG && goedM) goedGemeten++;
    pos = pol(pos[0], pos[1], m, g); pad.push([...pos]);
    const wat = SOORT.meten ? 'Goed gemeten is het' : 'Gevraagd was';
    melding.classList.toggle('fout', !(goedG && goedM));
    melding.textContent = goedG && goedM ? `Stuk ${stuk + 1}: ${norm(g)}° en ${m} m, goed!`
      : `Stuk ${stuk + 1}: je liep ${norm(g)}° en ${m} m. ${wat} ${b.g}° en ${b.m} m${goedG ? '' : ` (${Math.round(dg)}° ernaast)`}.`;
    stuk++; mik = null; veldG.value = ''; veldM.value = '';
    if (stuk === route.benen.length) einde();
    tekenNotatie(); tekenPad(); tekenMik();
    opdracht.textContent = opdrachtTekst();
    if (!klaar) (SOORT.meten ? veldG : terrein).focus({ preventScroll: true });
  }

  function einde() {
    klaar = true; loop.disabled = true; veldG.disabled = true; veldM.disabled = true;
    const afstand = Math.round(Math.hypot(pos[0] - route.eind[0], pos[1] - route.eind[1]));
    const echt = [route.start]; let [x, y] = route.start;
    for (const b of route.benen) { [x, y] = pol(x, y, b.m, b.g); echt.push([x, y]); }
    postG.replaceChildren(
      s('path', { d: `M${echt.map(([a, c]) => `${r1(a * M)} ${r1(c * M)}`).join('L')}`, class: 'ko-echt' }),
      s('circle', { cx: r1(route.eind[0] * M), cy: r1(route.eind[1] * M), r: VANGST * M, class: 'ko-vangst' }),
      s('path', { d: `M${r1(route.eind[0] * M)} ${r1(route.eind[1] * M)}v-16l12 5l-12 5`, class: 'ko-post' }));
    const gevonden = afstand <= VANGST;
    const extra = ` ${goedGemeten} van de ${route.benen.length} stukken waren goed.`;
    melding.classList.toggle('fout', !gevonden);
    melding.textContent = gevonden ? `Je staat bij de post (${afstand} m ernaast). Gevonden!${extra}`
      : `De post staat ${afstand} m verderop: de gestippelde lijn is de echte route.${extra}`;
    opnieuw.focus({ preventScroll: true });
  }

  // -- aiming on the terrain: from where you stand to the finger
  let sleept = false;
  const naar = (e) => {
    const r = terrein.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * B / M; const y = ((e.clientY - r.top) / r.height) * H / M;
    const dx = x - pos[0]; const dy = y - pos[1];
    return { g: (Math.atan2(dx, -dy) * 180) / Math.PI, m: Math.hypot(dx, dy) };
  };
  terrein.addEventListener('pointerdown', (e) => {
    if (klaar) return;
    sleept = true; terrein.setPointerCapture(e.pointerId); e.preventDefault();
    const { g, m } = naar(e); zetMik(g, m);
  });
  terrein.addEventListener('pointermove', (e) => { if (sleept) { const { g, m } = naar(e); zetMik(g, m); } });
  terrein.addEventListener('pointerup', () => { if (sleept) { sleept = false; stand.textContent = `Gemikt: ${mik.g}° en ${mik.m} m.`; } });
  terrein.addEventListener('pointercancel', () => { sleept = false; });
  terrein.addEventListener('keydown', (e) => {
    if (klaar) return;
    if (e.key === 'Enter') { e.preventDefault(); loopStuk(); return; }
    const stap = e.shiftKey ? 10 : 1;
    const d = { ArrowLeft: [-stap, 0], ArrowRight: [stap, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
    if (!d) return;
    e.preventDefault();
    const nu = mik ?? { g: 0, m: 100 };
    zetMik(nu.g + d[0], nu.m + d[1]);
    stand.textContent = `Koers ${mik.g}°, afstand ${mik.m} m.`;
  });
  const uitVelden = () => {
    const g = Number(veldG.value); const m = Number(veldM.value);
    if (veldG.value !== '' && veldM.value !== '' && Number.isFinite(g) && m > 0) { mik = { g: norm(g), m }; tekenMik(); }
  };
  veldG.addEventListener('input', uitVelden); veldM.addEventListener('input', uitVelden);
  for (const v of [veldG, veldM]) v.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); loopStuk(); } });

  begin();
  return el;
}
