// Plan a walk on the real map (the TOP25 sample of the Soester Duinen, 2,5 m per pixel): tap points along the
// paths, drag one to move it, and read per stretch how far it is and how long it takes at your pace. With the
// keyboard the arrow keys move a cross over the map (Shift: 100 m) and Enter sets a point there.
import { h } from '../dom.js';
import { keuze } from './knoppen.js';
import { s } from './kompasdelen.js';
import './vorm.css';
import './tochtplanner.css';

const KAART = 'kaarten/top25-soester-duinen.webp';
const [W, H] = [800, 560];
const M_PER_PX = 2.5;
const LETTER = (i) => String.fromCharCode(65 + (i % 26));

const meters = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} km`);
const tijd = (min) => { const m = Math.round(min); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} u ${String(m % 60).padStart(2, '0')}`; };

export default function tochtplanner() {
  const punten = [];
  let tempo = 4;          // km per hour
  let pauze = 0;          // minutes in total

  let cursor = [W / 2, H / 2];  // the cross the keyboard moves
  const lijn = s('polyline', { class: 'tp-lijn' });
  const groep = s('g');
  const kruis = s('path', { d: 'M-18 0H-6M6 0H18M0 -18V-6M0 6V18', class: 'tp-kruis' });
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tp-svg', role: 'img', tabindex: '0',
    'aria-label': 'De topografische kaart van de Soester Duinen, 2 bij 1,4 km. Tik om een punt van je tocht te zetten. '
      + 'Met het toetsenbord: pijltjes schuiven het kruisje 25 m (met Shift 100 m), Enter zet een punt, Backspace haalt het laatste weg.' },
    s('image', { href: KAART, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' }), lijn, groep, kruis);
  const tabel = h('tbody');
  const totaal = h('p.tp-totaal', { 'aria-live': 'polite' });
  const terug = h('button.knop.klein', { type: 'button', onclick: () => { punten.pop(); teken(); } }, 'Haal het laatste punt weg');
  const opnieuw = h('button.knop.klein', { type: 'button', onclick: () => { punten.length = 0; teken(); } }, 'Begin opnieuw');
  const pauzeVeld = h('input.doe-veld.tp-pauze', { type: 'number', min: 0, max: 600, step: 5, value: 0, inputmode: 'numeric',
    oninput: () => { pauze = Math.max(0, Number(pauzeVeld.value) || 0); teken(); } });

  function teken() {
    lijn.setAttribute('points', punten.map(([x, y]) => `${x},${y}`).join(' '));
    groep.replaceChildren(...punten.map(([x, y], i) => s('g', { class: `tp-punt${i === 0 ? ' start' : ''}`, 'data-i': i },
      s('circle', { cx: x, cy: y, r: 11 }), s('text', { x, y: y + 5, 'text-anchor': 'middle' }, LETTER(i)))));
    const stukken = punten.slice(1).map(([x, y], i) => Math.hypot(x - punten[i][0], y - punten[i][1]) * M_PER_PX);
    let samen = 0;
    tabel.replaceChildren(...stukken.map((m, i) => {
      samen += m;
      return h('tr', h('th', { scope: 'row' }, `${LETTER(i)} → ${LETTER(i + 1)}`), h('td', meters(m)), h('td', tijd((m / 1000 / tempo) * 60)), h('td', meters(samen)));
    }));
    const loop = (samen / 1000 / tempo) * 60;
    totaal.textContent = punten.length < 2
      ? 'Tik op de kaart om je tocht uit te zetten. Zet een punt op elke plek die je onderweg herkent: een kruising, een bosrand, een brug.'
      : `Samen ${meters(samen)}: ${tijd(loop)} lopen${pauze ? ` en ${tijd(pauze)} pauze, dus ${tijd(loop + pauze)}` : ''}.`;
    terug.disabled = opnieuw.disabled = punten.length === 0;
    kruis.setAttribute('transform', `translate(${cursor[0]} ${cursor[1]})`);
  }

  const naarSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [Math.round(Math.max(0, Math.min(W, q.x))), Math.round(Math.max(0, Math.min(H, q.y)))]; };
  let sleep = null; let begin = null;
  svg.addEventListener('pointerdown', (e) => {
    const punt = e.target.closest('.tp-punt');
    sleep = punt ? Number(punt.dataset.i) : null;
    begin = [e.clientX, e.clientY];
    svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove', (e) => {
    if (sleep === null || !begin) return;
    punten[sleep] = naarSvg(e);
    teken();
  });
  svg.addEventListener('pointerup', (e) => {
    const bewogen = begin && Math.hypot(e.clientX - begin[0], e.clientY - begin[1]) > 6;
    if (sleep === null && begin && !bewogen && punten.length < 26) { punten.push(naarSvg(e)); teken(); }
    sleep = null; begin = null;
  });
  svg.addEventListener('pointercancel', () => { sleep = null; begin = null; });
  svg.addEventListener('keydown', (e) => {
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (r) {
      const stap = (e.shiftKey ? 100 : 25) / M_PER_PX;
      cursor = [Math.max(0, Math.min(W, cursor[0] + r[0] * stap)), Math.max(0, Math.min(H, cursor[1] + r[1] * stap))];
    } else if ((e.key === 'Enter' || e.key === ' ') && punten.length < 26) punten.push([...cursor]);
    else if (e.key === 'Backspace' || e.key === 'Delete') punten.pop();
    else return;
    e.preventDefault();
    teken();
  });

  teken();
  return h('div.doe-tochtplanner',
    h('div.tp-beeld', svg, h('p.doe-stil', 'Kaart: Kadaster, TOPraster via PDOK (open data). Hij is 2 bij 1,4 km.')),
    h('div.tp-zijkant',
      h('div.tp-instellingen',
        h('div.doe-label', h('span', 'Tempo'), h('div.chips', { role: 'group', 'aria-label': 'Tempo' },
          keuze([[3, '3 km/u'], [4, '4 km/u'], [5, '5 km/u']], tempo, (v) => { tempo = v; teken(); }))),
        h('label.doe-label', h('span', 'Pauze (minuten)'), pauzeVeld)),
      totaal,
      h('div.tabel-wrap', h('table.tp-tabel', h('thead', h('tr', h('th', 'Stuk'), h('th', 'Afstand'), h('th', 'Tijd'), h('th', 'Tot hier'))), tabel)),
      h('div.knop-rij', terug, opnieuw),
      h('p.doe-stil', 'Je meet in rechte lijnen. Een pad slingert: zet een punt op elke bocht, anders kom je te kort uit.')));
}
