// Welke kant vlucht je op? From above: you in the middle of the heath, a fire coming with the wind from one side,
// a village or a paved road somewhere. Tap one of eight directions. The brandweer says: run across the fire, not
// away in front of it; and go to a public road, a large paved area or the built-up area.
import { h } from '../../dom.js';
import { pol } from '../kompasdelen.js';
import { s } from './hulp.js';
import './wn.css';
import './natuurbrand.css';

const NAAM = { 0: 'noorden', 45: 'noordoosten', 90: 'oosten', 135: 'zuidoosten', 180: 'zuiden', 225: 'zuidwesten', 270: 'westen', 315: 'noordwesten' };
const KORT = { 0: 'N', 45: 'NO', 90: 'O', 135: 'ZO', 180: 'Z', 225: 'ZW', 270: 'W', 315: 'NW' };
const C = 150;
const verschil = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

export default function natuurbrand() {
  let van = 180;                    // where the fire comes from
  let dorp = 90;                    // where the village is
  let klaar = false;

  const brand = s('g', {});
  const dorpG = s('g', {});
  const pijlen = s('g', {});
  const svg = s('svg', { viewBox: '0 0 300 300', class: 'wn-svg wn-rand nb-svg', role: 'group', 'aria-label': 'Kies een richting om heen te lopen' },
    s('rect', { x: 0, y: 0, width: 300, height: 300, class: 'nb-heide' }), dorpG, brand, pijlen,
    s('circle', { cx: C, cy: C, r: 9, class: 'accent' }), s('text', { x: C, y: C + 24, 'text-anchor': 'middle', class: 'klein' }, 'jij'));

  const vraag = h('p', { 'aria-live': 'polite' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const verder = h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Andere brand');
  const el = h('div.wn.naast.doe-natuurbrand', svg, h('div.wn-tekst', vraag, melding, h('div.knop-rij', verder)));

  function teken() {
    // the fire: a band of flames along the side it comes from, and wind arrows towards you
    const vlammen = [];
    for (let i = -4; i <= 4; i++) {
      const [x, y] = pol(C, C, 128, van + i * 9);
      vlammen.push(s('path', { d: `M${x - 7} ${y + 6} Q${x - 6} ${y - 6} ${x} ${y - 14} Q${x + 6} ${y - 6} ${x + 7} ${y + 6} Z`, class: 'nb-vlam' }));
    }
    const wind = [-25, 0, 25].map((d) => {
      const [x1, y1] = pol(C, C, 104, van + d); const [x2, y2] = pol(C, C, 70, van + d * 0.8);
      return s('path', { d: `M${x1} ${y1} L${x2} ${y2}`, class: 'nb-wind', 'marker-end': 'url(#nb-punt)' });
    });
    brand.replaceChildren(
      s('defs', {}, s('marker', { id: 'nb-punt', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, s('path', { d: 'M0 0 L10 5 L0 10 z', class: 'nb-wind-punt' }))),
      s('path', { d: arc(van, 128, 46), class: 'nb-rook' }), ...vlammen, ...wind);
    // the village and its road
    const [dx, dy] = pol(C, C, 118, dorp); const [wx, wy] = pol(C, C, 90, dorp);
    dorpG.replaceChildren(
      s('path', { d: `M${wx} ${wy} L${dx} ${dy}`, class: 'nb-weg' }),
      ...[[-10, -6], [6, -8], [-2, 8]].map(([ox, oy]) => s('path', { d: `M${dx + ox - 6} ${dy + oy + 5} v-7 l6 -5 l6 5 v7 z`, class: 'nb-huis' })),
      s('text', { x: dx, y: dy + 26 > 296 ? dy - 18 : dy + 26, 'text-anchor': 'middle', class: 'klein' }, 'dorp'));
    // eight arrows to choose from
    pijlen.replaceChildren(...Object.keys(NAAM).map(Number).map((g) => {
      const [x, y] = pol(C, C, 44, g); const [tx, ty] = pol(C, C, 60, g);
      const knop = s('g', { class: 'nb-keuze', role: 'button', tabindex: '0', 'aria-label': `Naar het ${NAAM[g]}`, 'data-g': g },
        s('circle', { cx: tx, cy: ty, r: 15, class: 'nb-raak' }),
        s('path', { d: `M${C} ${C} L${x} ${y}`, class: 'nb-pijl' }),
        s('text', { x: tx, y: ty + 4, 'text-anchor': 'middle', class: 'nb-letter' }, KORT[g]));
      knop.addEventListener('click', () => kies(g));
      knop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kies(g); } });
      return knop;
    }));
    vraag.textContent = `De heide brandt. De wind blaast het vuur vanuit het ${NAAM[van]} naar je toe. In het ${NAAM[dorp]} ligt een dorp. Welke kant loop je op?`;
  }

  function kies(g) {
    if (klaar) return;
    const t = verschil(g, van);                    // 0: towards the fire, 180: straight away from it
    const goed = t === 90;
    klaar = goed;
    for (const k of pijlen.children) {
      const kg = Number(k.dataset.g);
      if (goed) k.classList.toggle('juist', verschil(kg, van) === 90 && kg === g);
      else if (kg === g) k.classList.add('mis');
    }
    melding.classList.toggle('fout', !goed);
    if (t === 0) melding.textContent = 'Niet doen: dan loop je de brand in.';
    else if (t === 180) melding.textContent = 'Zo blijft het vuur achter je aan komen, want de wind blaast het dezelfde kant op. Loop dwars op de brand.';
    else if (t === 45) melding.textContent = 'Dan loop je schuin naar het vuur toe. Loop dwars op de brand.';
    else if (t === 135) melding.textContent = 'Bijna: je gaat schuin weg, maar het vuur blijft je zo lang achterna komen. Loop echt dwars op de brand.';
    else melding.textContent = g === dorp
      ? 'Goed: dwars op de brand, en naar het dorp met een verharde weg. Bel 112 als je veilig bent.'
      : `Goed: dwars op de brand. Maar in het ${NAAM[dorp]} ligt het dorp, met een verharde weg: daar ben je veiliger. Bel 112 als je veilig bent.`;
  }

  function nieuw() {
    van = [0, 90, 180, 270][Math.floor(Math.random() * 4)] + (Math.random() < 0.5 ? 0 : 45);
    van %= 360;
    dorp = (van + (Math.random() < 0.5 ? 90 : 270)) % 360;
    klaar = false; melding.textContent = ''; melding.classList.remove('fout');
    teken();
  }

  nieuw();
  return el;
}

/** An arc band at radius r around the centre, from van - half to van + half degrees. */
function arc(van, r, half) {
  const [x1, y1] = pol(C, C, r, van - half); const [x2, y2] = pol(C, C, r, van + half);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
}
