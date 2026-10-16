// The baseplate compass as SVG, shared by the compass to turn (kompas.js) and the compass on the map
// (kaartkompas.js). Drawn around 0,0 - the middle of the housing - so a caller places and turns it with a transform:
// the plate with translate() rotate(), the housing inside it with rotate(-koers), the needle on its own.
import { STREKEN } from '../plaatjes.js';

const NS = 'http://www.w3.org/2000/svg';
export const R = 64;                                    // the housing

export const norm = (g) => ((Math.round(g) % 360) + 360) % 360;
export const verschil = (a, b) => Math.abs(((a - b + 540) % 360) - 180);      // 0..180
export const streek16 = (g) => STREKEN[(Math.round(norm(g) / 22.5) % 16) * 2];
export const p = (n) => Math.round(n * 10) / 10;
/** A point at a distance and a direction (degrees from north, clockwise) from cx, cy. */
export const pol = (cx, cy, r, g) => [cx + r * Math.sin((g * Math.PI) / 180), cy - r * Math.cos((g * Math.PI) / 180)];

export function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

/** The plate (with the housing in it) and the needle. `liniaal` adds the ruler and the scale at the bottom. */
export function kompasDelen({ liniaal = true } = {}) {
  const plaat = s('g', { class: 'kk-plaat' },
    s('rect', { x: -66, y: -146, width: 132, height: 296, rx: 18, class: 'kk-plaat-vlak' }),
    s('path', { d: 'M0 -138 l13 30 h-7 v34 h-12 v-34 h-7z', class: 'kk-richting' }),
    s('path', { d: 'M0 -72 v-12', class: 'kk-index' }));
  if (liniaal) {
    for (let i = 0; i <= 10; i++) plaat.append(s('path', { d: `M-66 ${84 + i * 6}h${i % 5 ? 6 : 11}`, class: 'kk-liniaal' }));
    plaat.append(s('text', { x: 8, y: 136, class: 'kk-klein', 'text-anchor': 'middle' }, '1:25.000'));
  }

  const huis = s('g', { class: 'kk-huis' },
    s('circle', { cx: 0, cy: 0, r: R + 6, class: 'kk-ring' }), s('circle', { cx: 0, cy: 0, r: R - 12, class: 'kk-binnen' }));
  for (let g = 0; g < 360; g += 2) {
    const lang = g % 10 ? 4 : g % 30 ? 7 : 10;
    const [x1, y1] = pol(0, 0, R + 6, g); const [x2, y2] = pol(0, 0, R + 6 - lang, g);
    huis.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: g % 10 ? 'kk-streep dun' : 'kk-streep' }));
  }
  for (let g = 0; g < 360; g += 30) {
    const [x, y] = pol(0, 0, R - 9, g);
    const t = { 0: 'N', 90: 'O', 180: 'Z', 270: 'W' }[g] ?? String(g);
    huis.append(s('text', { x: p(x), y: p(y), class: t.length === 1 ? 'kk-letter' : 'kk-getal', 'text-anchor': 'middle', 'dominant-baseline': 'central', transform: `rotate(${g} ${p(x)} ${p(y)})` }, t));
  }
  for (const dx of [-30, -15, 15, 30]) huis.append(s('path', { d: `M${dx} -40V40`, class: 'kk-noordlijn' }));
  huis.append(s('path', { d: 'M-9 -20L0 -44L9 -20M-9 -20V30M9 -20V30', class: 'kk-huisje' }));
  plaat.append(huis);

  const naald = s('g', { class: 'kk-naald' },
    s('path', { d: 'M0 -50L6 0L-6 0z', class: 'kk-naald-noord' }),
    s('path', { d: 'M0 50L6 0L-6 0z', class: 'kk-naald-zuid' }),
    s('circle', { cx: 0, cy: 0, r: 3.5, class: 'kk-as' }));

  return { plaat, huis, naald };
}
