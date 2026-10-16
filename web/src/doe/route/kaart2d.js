// The network from above, in SVG: the overview at the end (the route you walked over the route you should have
// walked, north up), and the walker without WebGL: the same interaction as the 3D world (tap a road, walk), seen
// from above with the way you walk pointing up.
import { s } from './svg.js';
import { SOORTEN, SMAL_BREED, punt } from './netwerk.js';
import { bakenTeken } from './tekeningen.js';
import { animeerPad } from './loop.js';

const p = (n) => Math.round(n * 10) / 10;
const pad = (punten) => punten.map((q, i) => `${i ? 'L' : 'M'}${p(q.x)} ${p(-q.y)}`).join('');

/** The roads, narrow paths and landmarks of a network, in world coordinates with y flipped (north up). */
function wegenLaag(net, { bakens = true } = {}) {
  const g = s('g', { class: 'rk-wegen' });
  for (const pd of net.paadjes) {
    const k = net.knopen[pd.knoop];
    g.append(s('path', { d: pad([k, pd]), class: 'rk-smal', 'stroke-width': SMAL_BREED }));
  }
  for (const soort of ['bospad', 'zandpad', 'fietspad', 'verhard']) {
    for (const w of net.wegenLijst) {
      if (w.soort !== soort) continue;
      g.append(s('path', { d: pad([net.knopen[w.a], net.knopen[w.b]]), class: `rk-weg ${soort}`, 'stroke-width': SOORTEN[soort].breed }));
    }
  }
  if (bakens) for (const b of net.bakens) g.append(s('g', { transform: `translate(${p(b.x)} ${p(-b.y)}) scale(0.7)`, class: 'rk-baken' }, bakenTeken(b.soort)));
  return g;
}

function routePunten(net, route) {
  return [route.start, ...route.stappen.map((st) => net.knopen[st.knoop]), route.eind];
}

function vlag(x, y) {
  return s('g', { transform: `translate(${p(x)} ${p(-y)})` }, s('path', { d: 'M0 0V-14', class: 'rk-vlagstok' }), s('path', { d: 'M0 -14l10 4l-10 4z', class: 'rk-vlag' }));
}

/** The overview at the end: the network, the route to walk (wide, green) and the route walked (blue). */
export function overzicht(net, route, gelopen) {
  const alle = [...routePunten(net, route), ...gelopen];
  const xs = alle.map((q) => q.x); const ys = alle.map((q) => q.y);
  const rand = 22;
  const x0 = Math.min(...xs) - rand; const x1 = Math.max(...xs) + rand;
  const y0 = Math.min(...ys) - rand; const y1 = Math.max(...ys) + rand;
  const svg = s('svg', { viewBox: `${p(x0)} ${p(-y1)} ${p(x1 - x0)} ${p(y1 - y0)}`, class: 'rk-overzicht', role: 'img',
    'aria-label': 'De route van bovenaf: groen de route die je moest lopen, blauw de route die je liep.' });
  svg.append(wegenLaag(net, { bakens: false }));
  svg.append(s('path', { d: pad(routePunten(net, route)), class: 'rk-bedoeld' }));
  svg.append(s('path', { d: pad(gelopen), class: 'rk-gelopen' }));
  route.stappen.forEach((st, i) => {
    const k = net.knopen[st.knoop];
    svg.append(s('g', { transform: `translate(${p(k.x)} ${p(-k.y)})` }, s('circle', { r: 6.5, class: 'rk-nr-rond' }), s('text', { y: 3.2, class: 'rk-nr', 'text-anchor': 'middle' }, String(i + 1))));
  });
  svg.append(s('circle', { cx: p(route.start.x), cy: p(-route.start.y), r: 4.5, class: 'rk-start' }), vlag(route.eind.x, route.eind.y));
  // a north arrow in the corner
  svg.append(s('g', { transform: `translate(${p(x1 - 12)} ${p(-y1 + 16)})` }, s('path', { d: 'M0 -10L5 4L0 1L-5 4z', class: 'rk-noord' }), s('text', { y: 14, class: 'rk-nr', 'text-anchor': 'middle' }, 'N')));
  return svg;
}


/**
 * The walker without WebGL. Same shape as wereld3d.js: zet(), loop(), markeer(), dispose(); taps call opKeuze(i).
 */
export function maakKaart2d(plek, net, route, { opKeuze, beweging }) {
  const W = 120; const H = 120; const cx = 60; const cy = 74;
  const wereld = s('g');
  wereld.append(wegenLaag(net));
  wereld.append(s('circle', { cx: p(route.start.x), cy: p(-route.start.y), r: 2.5, class: 'rk-start' }), vlag(route.eind.x, route.eind.y));
  const keuzeLaag = s('g'); const badgeLaag = s('g');
  const loper = s('g', { transform: `translate(${cx} ${cy}) scale(0.7)` }, s('path', { d: 'M0 -5L4 4L0 2L-4 4z', class: 'rk-loper' }));
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rk-loopkaart', 'aria-hidden': 'true' },
    // the grass reaches past the viewBox: the box is wider than it is high, and shows more than 0..W
    s('rect', { x: -W, y: -H, width: 3 * W, height: 3 * H, class: 'rk-gras' }), s('g', { class: 'rk-draai' }, wereld, keuzeLaag), badgeLaag, loper);
  plek.append(svg);

  let stand = { pos: { x: route.start.x, y: route.start.y }, koers: route.start.koers };
  let keuzes = []; let knoop = null; let markering = { focus: -1, hint: -1 };

  const naarBeeld = (q) => {
    const dx = q.x - stand.pos.x; const dy = q.y - stand.pos.y; const k = (stand.koers * Math.PI) / 180;
    return { x: cx + dx * Math.cos(k) - dy * Math.sin(k), y: cy - (dx * Math.sin(k) + dy * Math.cos(k)) };
  };
  function teken() {
    wereld.parentNode.setAttribute('transform', `translate(${cx} ${cy}) rotate(${p(-stand.koers)}) translate(${p(-stand.pos.x)} ${p(stand.pos.y)})`);
    keuzeLaag.replaceChildren(); badgeLaag.replaceChildren();
    if (!knoop) return;
    keuzes.forEach((w, i) => {
      const eind = punt(knoop, 30, w.peiling);
      const klas = i === markering.hint ? ' hint' : i === markering.focus ? ' focus' : '';
      const raak = s('path', { d: pad([punt(knoop, 3, w.peiling), eind]), class: `rk-raak${klas}` });
      raak.addEventListener('click', () => opKeuze(i));
      keuzeLaag.append(raak);
      const b = naarBeeld(punt(knoop, 24, w.peiling));
      const badge = s('g', { transform: `translate(${p(b.x)} ${p(b.y)})`, class: `rk-badge${klas}` }, s('circle', { r: 5.5 }), s('text', { y: 2.6, 'text-anchor': 'middle' }, String(i + 1)));
      badge.addEventListener('click', () => opKeuze(i));
      badgeLaag.append(badge);
    });
  }

  return {
    zet({ pos, koers, keuzes: k = [], knoop: kn = null }) {
      stand = { pos: { ...pos }, koers }; keuzes = k; knoop = kn; markering = { focus: -1, hint: -1 }; teken();
    },
    markeer(i, soort = 'focus') { markering[soort] = i; teken(); },
    loop(punten, eindKoers) {
      keuzes = []; knoop = null;
      return animeerPad(punten, stand.koers, eindKoers, { beweging, levend: () => svg.isConnected,
        opFrame: (st) => { stand = { pos: st.pos, koers: st.koers }; teken(); } });
    },
    dispose() { svg.remove(); },
  };
}
