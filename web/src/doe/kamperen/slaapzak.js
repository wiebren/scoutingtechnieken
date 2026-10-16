// Warm enough? Set how cold the night gets, the comfort and limit temperatures on your sleeping bag, and the
// R-value of your mat (or two mats: R-values add up). The card says what the bag and the mat mean for that night.
// Only numbers from the sources: ISO 23537-1 (comfort: a standard woman, relaxed; limit: a standard man, curled up;
// tested in long underwear on an insulating mat) and the R-value guidance of REI and Cascade Designs (an R below 2
// for warm weather, 2-4 for three seasons, 4-6 for winter, 5.5 and up for extreme cold), which differ a little.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import '../vorm.css';
import './kamp.css';
import './slaapzak.css';

const SEIZOENEN = [
  ['zomer', 'Zomer', 1, 'In de zomer is een matje met een R-waarde onder 2 vaak genoeg.'],
  ['tussen', 'Voorjaar en herfst', 2, 'Voor voorjaar en herfst wordt een R-waarde van 2 tot 4 aangeraden.'],
  ['winter', 'Winter', 4, 'In de winter wordt een R-waarde van 4 of meer aangeraden; bij strenge vorst 5,5 of meer.'],
];
const getal = (n) => n.toLocaleString('nl-NL', { maximumFractionDigits: 1 });

export default function slaapzak() {
  let nacht = 6; let comfort = 8; let limiet = 3; let r1 = 2; let r2 = 0; let seizoen = 'tussen';

  const veld = (label, min, max, stap, waarde, zet, eenheid) => {
    const uit = h('output');
    const schuif = h('input.doe-schuif', { type: 'range', min, max, step: stap, value: waarde, oninput: () => { zet(Number(schuif.value)); reken(); } });
    const toon = () => { uit.textContent = `${getal(Number(schuif.value))}${eenheid}`; };
    return { el: h('label.doe-label', h('span', label, ' ', uit), schuif), schuif, toon };
  };
  const vNacht = veld('Kouder wordt het vannacht niet:', -10, 20, 1, nacht, (v) => { nacht = v; }, ' °C');
  const vComfort = veld('Comfort op je slaapzak:', -10, 20, 1, comfort, (v) => { comfort = v; if (limiet > comfort) { limiet = comfort; vLimiet.schuif.value = limiet; } }, ' °C');
  const vLimiet = veld('Limiet op je slaapzak:', -15, 20, 1, limiet, (v) => { limiet = v; if (limiet > comfort) { comfort = limiet; vComfort.schuif.value = comfort; } }, ' °C');
  const vR1 = veld('R-waarde van je matje:', 0, 7, 0.1, r1, (v) => { r1 = v; }, '');
  const vR2 = veld('Tweede matje eronder (0 = geen):', 0, 7, 0.1, r2, (v) => { r2 = v; }, '');
  const velden = [vNacht, vComfort, vLimiet, vR1, vR2];

  const balk = h('div.sz-balk', { 'aria-hidden': 'true' });
  const zak = h('p', { 'aria-live': 'polite' });
  const mat = h('p', { 'aria-live': 'polite' });
  const chips = keuze(SEIZOENEN.map(([k, n]) => [k, n]), seizoen, (k) => { seizoen = k; reken(); });

  function reken() {
    for (const v of velden) v.toon();
    // the bar: from 20 °C (left) to -15 °C (right), the bag's zones, and the night as a marker
    const x = (t) => `${((20 - t) / 35) * 100}%`;
    balk.replaceChildren(
      h('span.sz-zone.warm', { style: `left:0;width:${x(comfort)}` }),
      h('span.sz-zone.koel', { style: `left:${x(comfort)};width:calc(${x(limiet)} - ${x(comfort)})` }),
      h('span.sz-zone.koud', { style: `left:${x(limiet)};right:0` }),
      h('span.sz-nacht', { style: `left:${x(nacht)}` }, `${nacht} °C`));
    zak.className = 'sz-oordeel';
    if (nacht >= comfort) {
      zak.classList.add('goed');
      zak.textContent = `Slaapzak: warm genoeg. De nacht (${nacht} °C) is niet kouder dan de comforttemperatuur (${comfort} °C): dan slaap je ontspannen.`;
    } else if (nacht >= limiet) {
      zak.classList.add('matig');
      zak.textContent = `Slaapzak: krap. ${nacht} °C ligt tussen comfort (${comfort} °C) en limiet (${limiet} °C). Opgerold red je het misschien, maar lekker slapen wordt het niet. Kies op de comforttemperatuur.`;
    } else {
      zak.classList.add('fout');
      zak.textContent = `Slaapzak: te koud. ${nacht} °C is kouder dan de limiet (${limiet} °C). Neem een warmere slaapzak, of een extra slaapzak of deken.`;
    }
    const r = Math.round((r1 + r2) * 10) / 10;
    const [, , minimum, advies] = SEIZOENEN.find(([k]) => k === seizoen);
    mat.className = 'sz-oordeel';
    mat.classList.add(r >= minimum ? 'goed' : 'fout');
    mat.textContent = `Matje: R ${getal(r)}${r2 ? ` (${getal(r1)} + ${getal(r2)}: R-waarden tel je op)` : ''}. ${advies} ${r >= minimum ? '' : 'Dit is te weinig: de grond trekt de warmte uit je weg.'}`.trim();
  }

  reken();
  return h('div.kd.naast.doe-slaapzak',
    h('div.kd-tekst', vNacht.el, vComfort.el, vLimiet.el, h('div.chips', { role: 'group', 'aria-label': 'Seizoen' }, chips), vR1.el, vR2.el),
    h('div.kd-tekst', balk, h('p.sz-legenda', h('span.sz-l.warm'), 'comfort ', h('span.sz-l.koel'), 'krap ', h('span.sz-l.koud'), 'te koud'), zak, mat,
      h('p.kd-score', 'De temperaturen op een slaapzak zijn gemeten met lang ondergoed aan, op een goed isolerend matje. Met een dun matje of in je dagkleding krijg je het eerder koud.')));
}
