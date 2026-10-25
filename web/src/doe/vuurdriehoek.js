// The fire triangle: a fire with its three sides. Take one away - water, sand, or no more wood - and the fire goes
// out; light it again and try another.
import { h } from '../dom.js';
import { actie, acties } from './knoppen.js';
import { s } from './kompasdelen.js';
import './vuurdriehoek.css';

const KANTEN = [
  { id: 'brandstof', naam: 'brandstof', weg: 'Leg geen hout meer bij', uitleg: 'Zonder brandstof brandt het vuur op en gaat het vanzelf uit.' },
  { id: 'zuurstof', naam: 'zuurstof', weg: 'Strooi zand erop', uitleg: 'Zand sluit de lucht af: zonder zuurstof stikt het vuur.' },
  { id: 'warmte', naam: 'warmte', weg: 'Giet water erop', uitleg: 'Water koelt het vuur af. Het wordt te koud om te branden, en het vuur gaat uit.' },
];

export default function vuurdriehoek() {
  let weg = null;
  // a triangle point up, its sides: left = brandstof, right = zuurstof, bottom = warmte
  const [A, B, C] = [[150, 24], [270, 228], [30, 228]];
  const zijde = { brandstof: [C, A], zuurstof: [A, B], warmte: [B, C] };
  const lijnen = {}; const labels = [];
  for (const k of KANTEN) {
    const [[x1, y1], [x2, y2]] = zijde[k.id];
    lijnen[k.id] = s('path', { d: `M${x1} ${y1}L${x2} ${y2}`, class: 'vd-kant' });
    const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
    const [ox, oy] = { brandstof: [-34, -6], zuurstof: [34, -6], warmte: [0, 22] }[k.id];
    labels.push(s('text', { x: mx + ox, y: my + oy, class: 'vd-label', 'text-anchor': 'middle' }, k.naam));
  }
  const vlam = s('g', { class: 'vd-vlam' },
    s('path', { d: 'M150 92 C124 128 116 152 124 172 C130 188 170 188 176 172 C184 152 176 128 150 92Z', class: 'vd-buiten' }),
    s('path', { d: 'M150 128 C138 148 136 162 140 172 C144 180 156 180 160 172 C164 162 162 148 150 128Z', class: 'vd-binnen' }));
  const rook = s('g', { class: 'vd-rook' },
    s('path', { d: 'M146 160 c-10 -14 10 -22 0 -38 c-8 -12 8 -20 2 -32' }), s('path', { d: 'M158 162 c8 -14 -8 -24 2 -40' }));
  const hout = s('g', { class: 'vd-hout' },
    s('path', { d: 'M108 196 L192 176' }), s('path', { d: 'M108 176 L192 196' }));
  const svg = s('svg', { viewBox: '0 0 300 260', class: 'vd-svg', role: 'img', 'aria-label': 'De vuurdriehoek: brandstof, zuurstof en warmte rond een vuur' },
    Object.values(lijnen), labels, hout, rook, vlam);

  const melding = h('p.vd-melding', { 'aria-live': 'polite' });
  const knoppen = KANTEN.map((k) => actie(k.weg, null, () => haalWeg(k), { klein: true }));
  const opnieuw = actie('Steek opnieuw aan', 'vuur', () => haalWeg(null), { hoofd: true, klein: true, hidden: true });

  function haalWeg(k) {
    weg = k;
    svg.classList.toggle('uit', !!k);
    for (const kant of KANTEN) lijnen[kant.id].classList.toggle('weg', kant === k);
    hout.classList.toggle('weg', k?.id === 'brandstof');
    svg.classList.toggle('zand', k?.id === 'zuurstof');
    svg.classList.toggle('water', k?.id === 'warmte');
    knoppen.forEach((b) => { b.disabled = !!k; });
    opnieuw.hidden = !k;
    melding.textContent = k ? `${k.uitleg} Eén kant weg is genoeg.` : 'Het vuur brandt: brandstof, zuurstof en warmte zijn er alle drie. Haal er één weg.';
  }

  haalWeg(null);
  return h('div.doe-vuurdriehoek', svg, h('div.vd-tekst', acties(knoppen, opnieuw), melding));
}
