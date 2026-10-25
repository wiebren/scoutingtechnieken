// Pak de EHBO-set in: tap what goes into the set for a day's hike, then check. What belongs in it is the Rode Kruis
// list of a complete EHBO-set, with a coldpack, something against itching, and for scouting a tick remover and a
// tick form. The rest is handy on a hike, but it is not first aid.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { schud } from './hulp.js';
import './wn.css';
import './ehboset.css';

const ERIN = [
  ['handschoenen', 'Wegwerphandschoenen'], ['kompressen', 'Wondkompressen (plakken niet)'], ['windsel', 'Elastisch windsel'],
  ['hechtpleister', 'Rol hechtpleister'], ['pleisters', 'Wondpleisters'], ['snelverband', 'Wondsnelverband'], ['schaar', 'Schaar'],
  ['pincet', 'Splinterpincet'], ['reddingsdeken', 'Reddingsdeken'], ['coldpack', 'Coldpack'], ['jeuk', 'Middel tegen jeuk'],
  ['teek', 'Tekenpincet of tekenkaart'], ['formulier', 'Tekenformulier'],
];
const NIET = [
  ['kompas', 'Kompas'], ['zaklamp', 'Zaklamp'], ['lucifers', 'Lucifers'], ['touw', 'Touw'], ['kaarten', 'Spelletje kaarten'], ['snoep', 'Snoep'],
];

export default function ehboSet() {
  const gekozen = new Set();
  const lijst = schud([...ERIN.map((x) => [...x, true]), ...NIET.map((x) => [...x, false])]);
  const teller = h('p.wn-groot', { 'aria-live': 'polite' });
  const melding = h('p', { 'aria-live': 'polite' });
  const knoppen = lijst.map(([id, naam, hoort]) => {
    const b = h('button.chip.es-ding', { type: 'button', 'aria-pressed': 'false', 'data-id': id, onclick: () => {
      if (b.classList.contains('klaar')) return;
      gekozen.has(id) ? gekozen.delete(id) : gekozen.add(id);
      b.setAttribute('aria-pressed', String(gekozen.has(id)));
      tel();
    } }, naam);
    b.dataset.hoort = hoort ? 'ja' : 'nee';
    return b;
  });
  const nakijk = actie('Kijk na', 'vink', kijkNa, { hoofd: true, klein: true });
  const opnieuw = actie('Opnieuw', 'opnieuw', reset, { klein: true, hidden: true });
  const el = h('div.wn.doe-ehboset',
    h('p', 'Wat stop je in de EHBO-set voor een dagtocht? Tik alles aan wat erin hoort.'),
    h('div.es-doos', h('span.es-kruis', { 'aria-hidden': 'true' }), teller),
    h('div.chips', { role: 'group', 'aria-label': 'Spullen' }, knoppen),
    acties(nakijk, opnieuw), melding);

  function tel() { teller.textContent = `${gekozen.size} ${gekozen.size === 1 ? 'ding' : 'dingen'} in de set`; }

  function kijkNa() {
    let goed = 0; let teveel = 0;
    for (const b of knoppen) {
      const hoort = b.dataset.hoort === 'ja'; const in_ = gekozen.has(b.dataset.id);
      b.classList.add('klaar');
      b.classList.toggle('goed', hoort && in_);
      b.classList.toggle('gemist', hoort && !in_);
      b.classList.toggle('teveel', !hoort && in_);
      if (hoort && in_) goed += 1;
      if (!hoort && in_) teveel += 1;
    }
    melding.textContent = `${goed} van de ${ERIN.length} goed${teveel ? `, en ${teveel} ${teveel === 1 ? 'ding dat er niet in hoort' : 'dingen die er niet in horen'} (handig op een hike, maar geen EHBO)` : ''}. ${goed === ERIN.length && !teveel ? 'Een complete set!' : 'Wat gestreept is, had erin gemoeten.'} Stop er ook een briefje in met het adres en het nummer van de huisartsenpost.`;
    nakijk.hidden = true; opnieuw.hidden = false;
  }

  function reset() {
    gekozen.clear();
    for (const b of knoppen) { b.classList.remove('klaar', 'goed', 'gemist', 'teveel'); b.setAttribute('aria-pressed', 'false'); }
    melding.textContent = ''; nakijk.hidden = false; opnieuw.hidden = true; tel();
  }

  tel();
  return el;
}
