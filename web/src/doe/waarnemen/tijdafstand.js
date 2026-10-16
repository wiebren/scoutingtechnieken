// Tijd en afstand: pick a tempo (with a rucksack, brisk walking, verkennerspas) or your own, and turn minutes into
// kilometres and back. Below, a stopwatch for a stretch you know: walk it, and the piece gives your own tempo.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { getal } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './tijdafstand.css';

const TEMPO = [
  [4, 'Met rugzak (4 km/u)'],
  [6, 'Stevig doorlopen (6 km/u)'],
  [8, 'Verkennerspas (8 km/u)'],
];
const mmss = (min) => { const t = Math.round(min * 60); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

export default function tijdAfstand() {
  let tempo = 4;
  let begin = null; let frame = 0;

  const eigen = h('input.doe-veld', { type: 'number', min: 1, max: 20, step: 0.5, inputmode: 'decimal', value: tempo, 'aria-label': 'Eigen tempo in km per uur',
    oninput: () => { const n = Number(eigen.value.replace(',', '.')); if (n > 0) { tempo = n; chips.forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.w) === n))); reken('min'); } } });
  const chips = keuze(TEMPO, tempo, (t) => { tempo = t; eigen.value = t; reken('min'); });
  chips.forEach((c, i) => { c.dataset.w = TEMPO[i][0]; });
  const tempoTekst = h('p.doe-stil', { 'aria-live': 'polite' });

  const minVeld = h('input.doe-veld', { type: 'number', min: 0, step: 5, inputmode: 'numeric', value: 90, oninput: () => reken('min') });
  const kmVeld = h('input.doe-veld', { type: 'number', min: 0, step: 0.5, inputmode: 'decimal', oninput: () => reken('km') });
  const rekenTekst = h('p', { 'aria-live': 'polite' });

  const klok = h('p.wn-groot.ta-klok', '0:00');
  const meters = h('input.doe-veld', { type: 'number', min: 50, step: 50, inputmode: 'numeric', value: 1000, 'aria-label': 'Afstand die je loopt, in meters' });
  const startKnop = h('button.knop.hoofd.klein', { type: 'button', onclick: () => (begin == null ? start() : stop()) }, 'Start');
  const klokTekst = h('p', { 'aria-live': 'polite' });

  const el = h('div.wn.doe-tijdafstand',
    h('section.ta-blok',
      h('h4', 'Tempo'),
      h('div.chips', { role: 'group', 'aria-label': 'Kies een tempo' }, chips),
      h('div.wn-rij', h('span', 'of eigen:'), eigen, h('span', 'km per uur')),
      tempoTekst),
    h('section.ta-blok',
      h('h4', 'Reken'),
      h('div.wn-rij', h('label.doe-label', 'Minuten', minVeld), h('span.ta-pijl', { 'aria-hidden': 'true' }, '⇄'), h('label.doe-label', 'Kilometer', kmVeld)),
      rekenTekst),
    h('section.ta-blok',
      h('h4', 'Meet je eigen tempo'),
      h('p.doe-stil', 'Loop een stuk dat je zeker weet, bijvoorbeeld tien stukken tussen de hectometerpaaltjes langs de weg (1 km). Start bij het begin en stop aan het eind.'),
      h('div.wn-rij', meters, h('span', 'meter'), startKnop),
      klok, klokTekst));

  function reken(van) {
    tempoTekst.textContent = `${getal(tempo, 1)} km per uur is ${mmss(60 / tempo)} minuut per kilometer.`;
    if (van === 'min') {
      const m = Number(minVeld.value);
      kmVeld.value = minVeld.value === '' ? '' : Math.round((m / 60) * tempo * 10) / 10;
      rekenTekst.textContent = minVeld.value === '' ? '' : `In ${getal(m)} minuten loop je ongeveer ${getal((m / 60) * tempo, 1)} km.`;
    } else {
      const km = Number(kmVeld.value.replace(',', '.'));
      minVeld.value = kmVeld.value === '' ? '' : Math.round((km / tempo) * 60);
      rekenTekst.textContent = kmVeld.value === '' ? '' : `Voor ${getal(km, 1)} km heb je ongeveer ${getal((km / tempo) * 60)} minuten nodig, zonder pauzes.`;
    }
  }

  function tik() {
    if (begin == null) return;
    if (!el.isConnected) { begin = null; return; }
    klok.textContent = mmss((performance.now() - begin) / 60000);
    frame = requestAnimationFrame(tik);
  }
  function start() {
    begin = performance.now();
    startKnop.textContent = 'Stop';
    klokTekst.textContent = 'De klok loopt.';
    tik();
  }
  function stop() {
    const min = (performance.now() - begin) / 60000;
    begin = null; cancelAnimationFrame(frame);
    startKnop.textContent = 'Start';
    const m = Number(meters.value) || 1000;
    if (min < 0.05) { klokTekst.textContent = 'Dat was wel heel snel. Probeer het nog eens.'; return; }
    const kmu = (m / 1000) / (min / 60);
    klok.textContent = mmss(min);
    klokTekst.textContent = `${getal(m)} m in ${mmss(min)}: dat is ${getal(kmu, 1)} km per uur, ${mmss(60 / kmu)} per kilometer. De verkennerspas van 1928: 7:30 per kilometer.`;
    tempo = Math.round(kmu * 10) / 10; eigen.value = tempo;
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    reken('min');
  }

  reken('min');
  return el;
}
