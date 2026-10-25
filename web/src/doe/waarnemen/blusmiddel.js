// Kies het blusmiddel: a small fire, and seven choices. Some fires have more than one good answer; some have one
// that makes it much worse. After brandweer.nl (Het juiste blusmiddel, Vlam in de pan).
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { schud } from './hulp.js';
import './wn.css';
import './blusmiddel.css';

const MIDDELEN = [
  ['water', 'Water'], ['schuim', 'Schuimblusser'], ['poeder', 'Poederblusser'], ['co2', 'CO2-blusser'],
  ['deken', 'Blusdeken'], ['deksel', 'Deksel'], ['weg', 'Niet blussen: eruit en 112'],
];
// goed: good answers; slecht: answers that make it worse, with why; uitleg: said after any answer
const BRANDEN = [
  { wat: 'Er staat vet in brand in een pan op het fornuis.', goed: ['deksel', 'co2'],
    slecht: { water: 'Water wordt in het hete vet meteen stoom, die het brandende vet de lucht in blaast: een enorme steekvlam.', deken: 'Een blusdeken past niet bij een vlam in de pan: de pan kan schuiven, of de deken vat vlam.', schuim: 'In schuim zit water: dat geeft dezelfde steekvlam.' },
    uitleg: 'Vuur uit, deksel erop, en laten zitten tot de pan is afgekoeld.' },
  { wat: 'Een prullenbak met papier brandt.', goed: ['water', 'schuim', 'deken', 'poeder'],
    uitleg: 'Papier is een vaste stof: water, schuim of poeder werken. Een blusdeken kan ook, bij een brand zo groot als een voetbal.' },
  { wat: 'Een stekkerdoos met een laptop eraan begint te branden.', goed: ['co2'],
    slecht: { water: 'Geen water op elektrische apparaten.', schuim: 'In schuim zit water: niet op elektriciteit.' },
    uitleg: 'Een CO2-blusser is voor elektrische apparaten en laat niets achter. Poeder blust ook, maar maakt elektronica kapot.' },
  { wat: 'De jas van iemand bij het kampvuur vat vlam.', goed: ['deken', 'water'],
    uitleg: 'Een blusdeken is ook voor iemand van wie de kleren branden: leg hem vanaf de hals naar beneden om de vlammen. Water mag ook, en laat hem over de grond rollen.' },
  { wat: 'Een olielamp is omgevallen: er brandt een plasje olie op de vloer.', goed: ['schuim', 'poeder'],
    slecht: { water: 'Water hoort niet op brandende olie of vet.' },
    uitleg: 'Schuim is voor kleine branden van vaste stoffen en vloeistoffen; poeder kan ook.' },
  { wat: 'In de caravan op het kampterrein brandt het, nog klein.', goed: ['poeder'],
    uitleg: 'Een poederblusser is voor de meeste branden in huis, en in een auto, caravan, huisje of boot.' },
  { wat: 'Het hele lokaal staat in brand en de rook komt onder de deur door.', goed: ['weg'],
    uitleg: 'Blus alleen een kleine brand, en alleen als je veilig weg kunt. Waarschuw de anderen, ga naar buiten, doe deuren dicht en bel 112.' },
];

export default function blusmiddel() {
  let rij = []; let nu = null; let klaar = false;
  let goed = 0; let gedaan = 0;

  const vraag = h('p.bm-vraag', { 'aria-live': 'polite' });
  const knoppen = MIDDELEN.map(([k, n]) => h('button.knop.bm-keuze', { type: 'button', 'data-k': k, onclick: () => kies(k) }, n));
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const verder = actie('Volgende brand', 'verder', nieuw, { hoofd: true, klein: true, hidden: true });
  const el = h('div.wn.doe-blusmiddel', vraag, h('div.bm-keuzes', { role: 'group', 'aria-label': 'Blusmiddel' }, knoppen), acties(verder), melding, score);

  function kies(k) {
    if (klaar) return;
    klaar = true;
    const ok = nu.goed.includes(k);
    gedaan += 1; if (ok) goed += 1;
    knoppen.forEach((b) => { b.disabled = true; b.classList.toggle('juist', nu.goed.includes(b.dataset.k)); b.classList.toggle('mis', b.dataset.k === k && !ok); });
    melding.classList.toggle('fout', !ok);
    const waarom = nu.slecht?.[k] ?? (nu.goed.includes('weg') && !ok ? 'Deze brand is te groot om zelf te blussen.' : null);
    melding.textContent = `${ok ? 'Goed.' : waarom ? `Gevaarlijk! ${waarom}` : 'Niet het beste.'} ${nu.uitleg}`;
    score.textContent = `${goed} van de ${gedaan} goed.`;
    verder.hidden = false;
    verder.focus({ preventScroll: true });
  }

  function nieuw() {
    if (!rij.length) rij = schud(BRANDEN.filter((b) => b !== nu));
    nu = rij.pop(); klaar = false;
    vraag.textContent = nu.wat;
    knoppen.forEach((b) => { b.disabled = false; b.classList.remove('juist', 'mis'); });
    melding.textContent = ''; verder.hidden = true;
  }

  nieuw();
  return el;
}
