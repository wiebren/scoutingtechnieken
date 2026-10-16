// Bake bread on a stick. Choose how high above the coals you hold it and whether you turn it, then bake and take it
// off when you think it is done. About a hand (10-15 cm) above the glowing coals, turning slowly, it is light brown
// and done in 10-15 minutes (Scoutpedia, Stokbrood). Too close: black outside, raw inside; too far and too long: a
// hard crust. The model is a rough one: the crust browns with the square of the heat, the inside more slowly.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const MIN_PER_TIK = 1;                   // one simulated minute per tick
const TIK_MS = 450;

export function bak({ afstand, draaien, minuten }) {
  const f = 12 / afstand;
  const korst = 8.5 * f * f * minuten;
  const binnen = 8.5 * f ** 0.8 * minuten;
  return draaien ? { boven: korst, onder: korst, binnen } : { boven: korst * 0.45, onder: korst * 1.6, binnen };
}

const kleur = (k) => (k < 40 ? '#f1e3c2' : k < 80 ? '#e9c98a' : k < 135 ? '#c9893f' : k < 185 ? '#7a4a1e' : '#2a1d14');
const korstWoord = (k) => (k < 40 ? 'nog wit' : k < 80 ? 'lichtgeel' : k < 135 ? 'lichtbruin' : k < 185 ? 'donkerbruin' : 'zwart');

export function oordeel({ afstand, draaien, minuten }) {
  const { boven, onder, binnen } = bak({ afstand, draaien, minuten });
  const ergste = Math.max(boven, onder);
  if (!draaien && onder >= 135) return { soort: 'fout', tekst: 'Aan de onderkant zwartgeblakerd, aan de bovenkant bleek. Draai het brood langzaam rond, dan wordt het overal even bruin.' };
  if (ergste >= 185 && binnen < 100) return { soort: 'fout', tekst: 'Zwart vanbuiten en klef vanbinnen: te dicht bij de kolen. Houd het hoger, ongeveer een hand boven de gloed.' };
  if (ergste >= 185) return { soort: 'fout', tekst: 'Verbrand. Haal het er eerder af, of houd het iets hoger.' };
  if (binnen < 100) return { soort: 'fout', tekst: `Vanbinnen nog klef: het deeg is niet gaar. ${ergste < 80 ? 'Houd het langer boven de kolen, of iets lager.' : 'Bak het langer, iets hoger, zodat de korst niet verbrandt.'}` };
  if (minuten > 22 || (ergste < 80 && binnen >= 100)) return { soort: 'half', tekst: 'Gaar, maar het duurde lang: het brood is uitgedroogd tot één harde korst. Te lang, te ver van de kolen. Houd het iets lager.' };
  if (ergste >= 135) return { soort: 'half', tekst: 'Gaar, maar wel erg donker. Iets hoger houden, of iets eerder eraf.' };
  return { soort: 'goed', tekst: `Lichtbruin vanbuiten, zacht en gaar vanbinnen. Het schuift los van de stok. Na ${minuten} minuten: smakelijk eten!` };
}

export default function stokbrood() {
  let afstand = 12; let draaien = true; let minuten = 0; let klok = null;

  const deeg = s('g'); const hitte = s('g');
  const stok = s('g');
  const svg = s('svg', { viewBox: '0 0 320 210', class: 'vk-svg', role: 'img' },
    s('rect', { x: 0, y: 182, width: 320, height: 28, class: 'grond' }),
    hitte, stok);
  const kolenG = s('g');
  for (let i = 0; i < 9; i++) kolenG.append(s('ellipse', { cx: 120 + i * 18, cy: 180 + (i % 2 ? -2 : 1), rx: 10, ry: 5, class: 'kool' }));
  svg.append(kolenG);

  const schuif = h('input.doe-schuif', { type: 'range', min: 3, max: 30, step: 1, value: afstand, 'aria-label': 'Hoogte boven de kolen in centimeter' });
  const hoogte = h('output');
  const tijd = h('p.vk-stand', { 'aria-live': 'off' });
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const bakKnop = h('button.knop.hoofd', { type: 'button', onclick: () => (klok ? eraf() : start()) }, 'Boven het vuur houden');
  const opnieuw = h('button.knop.klein', { type: 'button', onclick: () => reset() }, 'Nieuw deeg');
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('label.doe-label', h('span', 'Hoogte boven de kolen: ', hoogte), schuif),
      h('div.vk-rij', { role: 'group', 'aria-label': 'Draaien' }, h('p.vk-kop', 'Draaien'), keuze([[true, 'langzaam rond draaien'], [false, 'stil houden']], draaien, (d) => { draaien = d; teken(); })),
      h('div.knop-rij', bakKnop, opnieuw), tijd, melding));

  schuif.addEventListener('input', () => { afstand = Number(schuif.value); teken(); });

  function teken() {
    const y = 176 - afstand * 4.2;                 // 1 cm is 4.2 units
    const { boven, onder, binnen } = bak({ afstand, draaien, minuten });
    stok.replaceChildren(
      s('path', { d: `M20 ${y + 8}L290 ${y - 4}`, class: 'hout', 'stroke-width': 7 }),
      ...[0, 1, 2, 3, 4, 5].map((i) => s('ellipse', { cx: 160 + i * 18, cy: (y + 1 - i * 0.8).toFixed(1), rx: 11, ry: 9, fill: kleur(i % 2 ? onder : boven), stroke: '#8a6a3a', 'stroke-width': 1 })),
      s('path', { d: `M156 ${y + 18}V176`, class: 'lijn dun stil', 'stroke-dasharray': '3 3' }),
      s('text', { x: 150, y: Math.min(172, y + 34), class: 'tekst stil', 'text-anchor': 'end' }, `${afstand} cm`));
    // the heat shimmer is made once when baking starts, so its animation runs on instead of restarting every tick
    const bakt = minuten > 0 && klok;
    if (!bakt) hitte.replaceChildren();
    else if (!hitte.childElementCount) hitte.append(...[0, 1, 2].map((i) => s('path', { d: `M${150 + i * 30} 168c-6 -10 6 -16 0 -26`, class: 'rook opstijgen', style: `animation-delay: ${i * 0.3}s; animation-iteration-count: infinite` })));
    hoogte.textContent = `${afstand} cm${afstand >= 10 && afstand <= 15 ? ' (ongeveer een hand)' : ''}`;
    const k = draaien ? korstWoord(boven) : `${korstWoord(boven)} boven, ${korstWoord(onder)} onder`;
    tijd.textContent = `${minuten} min · korst: ${k} · binnen: ${binnen >= 100 ? 'gaar' : 'nog deeg'}`;
    svg.setAttribute('aria-label', `Stokbrood ${afstand} cm boven de gloeiende kolen. ${tijd.textContent}.`);
  }

  function start() {
    melding.className = 'vk-oordeel'; melding.textContent = 'Het brood bakt. Haal het eraf als je denkt dat het klaar is.';
    bakKnop.textContent = 'Haal het eraf';
    klok = setInterval(() => {
      if (!el.isConnected) { clearInterval(klok); klok = null; return; }
      minuten += MIN_PER_TIK;
      teken();
      if (minuten >= 40) eraf();
    }, TIK_MS);
    teken();
  }

  function eraf() {
    clearInterval(klok); klok = null;
    bakKnop.textContent = 'Boven het vuur houden';
    bakKnop.disabled = true;
    const o = oordeel({ afstand, draaien, minuten });
    melding.className = `vk-oordeel ${o.soort}`;
    melding.textContent = o.tekst;
    schuif.disabled = true;
    teken();
  }

  function reset() {
    clearInterval(klok); klok = null; minuten = 0;
    bakKnop.disabled = false; bakKnop.textContent = 'Boven het vuur houden'; schuif.disabled = false;
    melding.className = 'vk-oordeel'; melding.textContent = 'Kies de hoogte, en houd het brood boven de gloeiende kolen.';
    teken();
  }

  reset();
  return el;
}
