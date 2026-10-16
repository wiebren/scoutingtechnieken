// Zoek de teken: after a day in the woods three ticks sit somewhere on this scout, front and back. Check the places
// where ticks like to hide (Scouting Nederland, Teken 2026): tap them on the body, or use the buttons. A place you
// check lights up, and shows the tick if there is one there.
import { h } from '../../dom.js';
import { s, schud } from './hulp.js';
import './wn.css';
import './tekencheck.css';

const [VX, AX] = [80, 240];       // the middle of the front and of the back
const PLEKKEN = [
  { id: 'nek', naam: 'haargrens en achter de oren', plekken: [[AX, 42], [AX - 12, 30], [AX + 12, 30]] },
  { id: 'oksels', naam: 'oksels', plekken: [[VX - 21, 76], [VX + 21, 76]] },
  { id: 'ellebogen', naam: 'ellebogen', plekken: [[VX - 30, 92], [VX + 30, 92], [AX - 30, 92], [AX + 30, 92]] },
  { id: 'broeksband', naam: 'rond de broeksband', plekken: [[VX - 14, 132], [VX + 14, 132], [AX, 132]] },
  { id: 'liezen', naam: 'liezen', plekken: [[VX - 12, 146], [VX + 12, 146]] },
  { id: 'billen', naam: 'billen', plekken: [[AX - 11, 158], [AX + 11, 158]] },
  { id: 'knieholtes', naam: 'knieholtes', plekken: [[AX - 12, 202], [AX + 12, 202]] },
];
const R = 11;

/** A body seen from the front or the back, standing, arms a little out: a head, and the right half mirrored. */
const HALF = [[5, 41], [7, 48], [24, 54], [30, 62], [38, 112], [34, 118], [30, 116], [22, 72], [21, 100], [22, 140], [19, 200],
  [18, 262], [20, 270], [6, 270], [6, 262], [5, 200], [2, 150]];
function lijf(cx) {
  const rechts = HALF.map(([x, y]) => `${cx + x} ${y}`);
  const links = [...HALF].reverse().map(([x, y]) => `${cx - x} ${y}`);
  return s('g', { class: 'tc-lijf' }, s('circle', { cx, cy: 28, r: 13 }), s('path', { d: `M${rechts.join(' L')} L${links.join(' L')} Z` }));
}

export default function tekencheck() {
  let teken = [];                  // [plek id, x, y]
  let bekeken = new Set();

  const gezien = s('g', {});
  const tekenG = s('g', {});
  const svg = s('svg', { viewBox: '0 0 320 290', class: 'wn-svg wn-rand tc-svg', role: 'img', 'aria-label': 'Een scout van voren en van achteren. Tik de plekken aan die je controleert.' },
    lijf(VX), lijf(AX),
    s('text', { x: VX, y: 284, 'text-anchor': 'middle', class: 'klein stil' }, 'voorkant'),
    s('text', { x: AX, y: 284, 'text-anchor': 'middle', class: 'klein stil' }, 'achterkant'),
    s('path', { d: `M${AX - 5} 22 q5 -6 10 0`, class: 'lijn dun stil' }),
    s('path', { d: `M${VX - 4} 24 h1 M${VX + 3} 24 h1 M${VX - 3} 31 q3 2 6 0`, class: 'lijn dun' }),
    gezien, tekenG);

  const knoppen = PLEKKEN.map((p) => h('button.chip', { type: 'button', 'aria-pressed': 'false', onclick: () => bekijk(p.id) }, p.naam));
  const melding = h('p', { 'aria-live': 'polite' });
  const toon = h('button.knop.klein', { type: 'button', onclick: () => PLEKKEN.forEach((p) => bekijk(p.id, true)) }, 'Laat alle plekken zien');
  const el = h('div.wn.naast.doe-tekencheck', svg,
    h('div.wn-tekst',
      h('p', 'Na een dag in het bos zitten er drie teken op deze scout. Waar kijk je? Tik op het lijf, of op een plek hieronder.'),
      h('div.chips', { role: 'group', 'aria-label': 'Plekken om te controleren' }, knoppen),
      melding,
      h('div.knop-rij', toon, h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Opnieuw'))));

  svg.addEventListener('click', (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse());
    const raak = PLEKKEN.find((p) => p.plekken.some(([px, py]) => Math.hypot(px - x, py - y) <= R + 4));
    if (raak) bekijk(raak.id);
    else melding.textContent = 'Daar zitten teken minder vaak. Kijk op warme, verborgen plekjes.';
  });

  function bekijk(id, stil = false) {
    if (bekeken.has(id)) return;
    bekeken.add(id);
    const p = PLEKKEN.find((x) => x.id === id);
    knoppen[PLEKKEN.indexOf(p)].setAttribute('aria-pressed', 'true');
    gezien.append(...p.plekken.map(([x, y]) => s('circle', { cx: x, cy: y, r: R, class: 'tc-gezien' })));
    const hier = teken.filter(([t]) => t === id);
    tekenG.append(...hier.map(([, x, y]) => s('g', { transform: `translate(${x} ${y})`, class: 'tc-teek' },
      s('ellipse', { cx: 0, cy: 0, rx: 2.6, ry: 3.4 }), s('path', { d: 'M-2 -2 l-3 -2 M2 -2 l3 -2 M-2.5 0 h-3.5 M2.5 0 h3.5 M-2 2 l-3 2 M2 2 l3 2' }))));
    const gevonden = teken.filter(([t]) => bekeken.has(t)).length;
    if (stil) { melding.textContent = 'Dit zijn de plekken waar teken graag zitten. Kijk er na elke dag in het groen.'; return; }
    melding.textContent = `${p.naam[0].toUpperCase()}${p.naam.slice(1)}: ${hier.length ? `${hier.length === 1 ? 'een teek' : `${hier.length} teken`} gevonden!` : 'niets.'} ${gevonden === teken.length ? `Alle ${teken.length} gevonden, na ${bekeken.size} plekken. Haal ze er zo snel mogelijk uit.` : `${gevonden} van de ${teken.length} gevonden.`}`;
  }

  function nieuw() {
    bekeken = new Set();
    gezien.replaceChildren(); tekenG.replaceChildren();
    knoppen.forEach((k) => k.setAttribute('aria-pressed', 'false'));
    teken = schud(PLEKKEN).slice(0, 3).map((p) => { const [x, y] = p.plekken[Math.floor(Math.random() * p.plekken.length)]; return [p.id, x, y]; });
    melding.textContent = '';
  }

  nieuw();
  return el;
}
