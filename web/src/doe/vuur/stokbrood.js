// Bake bread on a stick. Choose how high above the coals you hold it and whether you turn it, then bake and take it
// off when you think it is done. About a hand (10-15 cm) above the glowing coals, turning slowly, it is light brown
// and done in 10-15 minutes (Scoutpedia, Stokbrood). Too close: black outside, raw inside; too far and too long: a
// hard crust. The model is a rough one: the crust browns with the square of the heat, the inside more slowly.
// The stick lies flat on a log at the edge of the fire, raised on stones to the chosen height, with all the bread
// over the coals.
import { h } from '../../dom.js';
import { actie, acties, keuze, zetActie } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

let nr = 0;                              // for an id of its own per exercise on the page
const MIN_PER_TIK = 1;                   // one simulated minute per tick
const TIK_MS = 450;

export function bak({ afstand, draaien, minuten }) {
  const f = 12 / afstand;
  const korst = 8.5 * f * f * minuten;
  const binnen = 10 * f ** 0.8 * minuten;           // at 12 cm: done after 10 min, too dark after 15 (Scoutpedia: 10-15 min)
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

  const hitte = s('g');
  const steun = s('g'); const maat = s('g');
  const stok = s('g', { class: 'sb-stok' });                // stick and bread: slides over the coals while it bakes
  const minTekst = s('text', { x: 310, y: 30, class: 'tekst sb-klok', 'text-anchor': 'end' });
  const staatTekst = s('text', { x: 310, y: 46, class: 'tekst stil', 'text-anchor': 'end' });
  // each piece of dough: the top in the colour of the top crust, the bottom in that of the bottom (only different when
  // you hold the stick still: then the bottom browns faster)
  const kant = [s('stop', { offset: '40%' }), s('stop', { offset: '62%' })];
  const verloop = s('linearGradient', { id: `sb-korst-${++nr}`, x1: 0, y1: 0, x2: 0, y2: 1 }, kant[0], kant[1]);
  const svg = s('svg', { viewBox: '0 0 320 210', class: 'vk-svg', role: 'img' }, s('defs', {}, verloop),
    s('rect', { x: 0, y: 182, width: 320, height: 28, class: 'grond' }),
    hitte, steun, maat, stok, minTekst, staatTekst);
  const kolenG = s('g');
  for (let i = 0; i < 9; i++) kolenG.append(s('ellipse', { cx: 120 + i * 18, cy: 180 + (i % 2 ? -2 : 1), rx: 10, ry: 5, class: 'kool' }));
  svg.append(kolenG);

  const schuif = h('input.doe-schuif', { type: 'range', min: 3, max: 30, step: 1, value: afstand, 'aria-label': 'Hoogte boven de kolen in centimeter' });
  const hoogte = h('output');
  const tijd = h('span.vk-stand', { 'aria-live': 'off' });
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const bakKnop = actie('Houd boven het vuur', 'start', () => (klok ? eraf() : start()), { hoofd: true });
  const opnieuw = actie('Nieuw deeg', 'opnieuw', () => reset());
  const veld = (kop, ...inhoud) => h('div.vk-veld', { role: 'group', 'aria-label': kop }, h('p.vk-kop', kop), h('div', ...inhoud));
  // As Bouw een vuur: the drawing on top, the choices below it.
  const el = h('div.doe-vk',
    h('figure.vk-beeld', svg, h('figcaption.vk-uitleg', tijd)),
    h('div.vk-velden',
      veld('Hoogte', schuif, hoogte),
      veld('Draaien', keuze([[true, 'langzaam rond'], [false, 'stil']], draaien, (d) => { draaien = d; teken(); }))),
    acties(bakKnop, opnieuw),
    melding);

  schuif.addEventListener('input', () => { afstand = Number(schuif.value); teken(); });

  function teken() {
    const y = 176 - afstand * 4.2;                 // 1 cm is 4.2 units
    const { boven, onder, binnen } = bak({ afstand, draaien, minuten });
    // the log the stick rests on, end-on, on a stack of stones that fills the gap to the ground
    const r = Math.min(9.5, (182 - y - 3.5) / 2);        // close to the coals a thinner log, lying on the ground
    const balkY = y + 3.5 + r;
    const stenen = [];
    for (let top = balkY + r, i = 0; 182 - top >= 3; i++) {
      const dik = 182 - top < 12 ? 182 - top : 9;            // the last stone takes what is left, so the stack stands on the ground
      stenen.push(s('rect', { x: i % 2 ? 80 : 78, y: top.toFixed(1), width: i % 2 ? 24 : 28, height: dik.toFixed(1), rx: 3, style: 'fill: #a3a199; stroke: #66645d; stroke-width: 1' }));
      top += dik;
    }
    steun.replaceChildren(
      ...stenen,
      s('circle', { cx: 92, cy: balkY.toFixed(1), r: r.toFixed(1), class: 'kop' }), s('circle', { cx: 92, cy: balkY.toFixed(1), r: (r * 0.42).toFixed(1), fill: 'none', stroke: '#8a6a3a', 'stroke-width': 0.8 }));
    stok.replaceChildren(
      s('path', { d: `M20 ${y}H282`, class: 'hout', 'stroke-width': 7 }),
      ...[0, 1, 2, 3, 4, 5].map((i) => s('ellipse', { cx: 160 + i * 18, cy: y.toFixed(1), rx: 11, ry: 9, fill: `url(#${verloop.id})`, stroke: '#8a6a3a', 'stroke-width': 1 })));
    kant[0].setAttribute('stop-color', kleur(boven)); kant[1].setAttribute('stop-color', kleur(onder));
    maat.replaceChildren(
      s('path', { d: `M156 ${y + 10}V176`, class: 'lijn dun stil', 'stroke-dasharray': '3 3' }),
      s('text', { x: 150, y: y + 34 <= 172 ? y + 34 : y - 10, class: 'tekst stil', 'text-anchor': 'end' }, `${afstand} cm`));
    const bakt = Boolean(klok);
    stok.style.transform = bakt ? '' : 'translateX(-150px)';    // off the fire: pulled back, the bread over the log
    // the heat shimmer is made once when baking starts, so its animation runs on instead of restarting every tick
    if (!bakt) hitte.replaceChildren();
    else if (!hitte.childElementCount) hitte.append(...[0, 1, 2].map((i) => s('path', { d: `M${150 + i * 30} 168c-6 -10 6 -16 0 -26`, class: 'rook opstijgen', style: `animation-delay: ${i * 0.3}s; animation-iteration-count: infinite` })));
    hoogte.textContent = `${afstand} cm${afstand >= 10 && afstand <= 15 ? ' (ongeveer een hand)' : ''}`;
    minTekst.textContent = `${minuten} min`;
    staatTekst.textContent = bakt ? 'boven het vuur' : minuten ? 'eraf' : 'nog naast het vuur';
    const k = draaien ? korstWoord(boven) : `${korstWoord(boven)} boven, ${korstWoord(onder)} onder`;
    tijd.textContent = `Korst: ${k} · binnen: ${binnen >= 100 ? 'gaar' : 'nog deeg'}`;
    svg.setAttribute('aria-label', `Stokbrood op een stok, die op een balk rust, ${afstand} cm boven de gloeiende kolen, ${staatTekst.textContent}. ${minuten} minuten. ${tijd.textContent}.`);
  }

  function start() {
    melding.className = 'vk-oordeel'; melding.textContent = 'Het brood bakt. Haal het eraf als je denkt dat het klaar is.';
    zetActie(bakKnop, 'Haal eraf', 'stop');
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
    zetActie(bakKnop, 'Houd boven het vuur', 'start');
    bakKnop.disabled = true;
    const o = oordeel({ afstand, draaien, minuten });
    melding.className = `vk-oordeel ${o.soort}`;
    melding.textContent = o.tekst;
    schuif.disabled = true;
    teken();
  }

  function reset() {
    clearInterval(klok); klok = null; minuten = 0;
    bakKnop.disabled = false; zetActie(bakKnop, 'Houd boven het vuur', 'start'); schuif.disabled = false;
    melding.className = 'vk-oordeel'; melding.textContent = 'Kies de hoogte, en houd het brood boven de gloeiende kolen.';
    teken();
  }

  reset();
  return el;
}
