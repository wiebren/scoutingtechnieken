// Flits en donder tellen: tap Flits! when you see the lightning and Donder! when you hear it, or slide the seconds.
// Seconds divided by three is the distance in kilometres, and within ten seconds the storm is dangerously close
// (blad flits-donder, letterlijk). A strip shows how far that is; a second count says if it is coming nearer.
import { h } from '../dom.js';
import './vorm.css';
import './onweer.css';

const NS = 'http://www.w3.org/2000/svg';
const MAX = 60;                                  // seconds on the slider, and 20 km on the strip
const X0 = 30;
const X1 = 330;
const xVan = (km) => X0 + (Math.min(km, MAX / 3) / (MAX / 3)) * (X1 - X0);
const getal = (n) => n.toLocaleString('nl-NL', { maximumFractionDigits: 1 });

function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}

export default function onweer() {
  let begin = null;              // performance.now() at the flash, while counting
  let vorige = null;             // the seconds of the count before, to see if it comes nearer
  let frame = 0;

  // -- the strip: you on the left, the storm somewhere along it, the dangerous part red
  const wolk = s('g', { class: 'ow-wolk' },
    s('path', { d: 'M-16 -14a9 9 0 0 1 8-10a11 11 0 0 1 20 2a8 8 0 0 1 4 15h-30a7 7 0 0 1-2-7z', class: 'ow-wolk-vorm' }),
    s('path', { d: 'M2 1l-6 11h5l-4 10l10-14h-5l4-7z', class: 'ow-bliksem' }));
  const strook = s('svg', { viewBox: '0 0 360 96', class: 'ow-svg', 'aria-hidden': 'true' },
    s('rect', { x: X0, y: 62, width: xVan(10 / 3) - X0, height: 8, rx: 2, class: 'ow-gevaar' }),
    s('path', { d: `M${X0} 66H${X1}`, class: 'ow-as' }),
    [0, 5, 10, 15, 20].map((km) => [
      s('path', { d: `M${xVan(km)} 61v10`, class: 'ow-as' }),
      s('text', { x: xVan(km), y: 88, 'text-anchor': 'middle', class: 'ow-klein' }, km === 20 ? '20 km' : String(km)),
    ]),
    s('g', { transform: `translate(${X0} 50)` },
      s('path', { d: 'M-11 9L0 -8L11 9z', class: 'ow-tent' }), s('path', { d: 'M0 -8V9', class: 'ow-tent-lijn' })),
    s('text', { x: X0, y: 30, 'text-anchor': 'middle', class: 'ow-klein' }, 'jij'),
    wolk);

  // -- the words
  const knop = h('button.knop.hoofd.ow-knop', { type: 'button', onclick: () => (begin == null ? flits() : donder()) }, 'Flits!');
  const teller = h('p.ow-teller', { 'aria-hidden': 'true' });
  const uitleg = h('p.doe-stil', 'Tik op Flits! als je de bliksem ziet, en op Donder! als je hem hoort.');
  const schuifTekst = h('strong');
  const schuif = h('input.doe-schuif', { type: 'range', min: 0, max: MAX, step: 1, value: 15, oninput: () => { stopTellen(); zet(Number(schuif.value), false); } });
  const uitkomst = h('p.ow-uitkomst', { 'aria-live': 'polite' });
  const advies = h('p.ow-advies', { 'aria-live': 'polite' });
  const vergelijk = h('p.doe-stil', { 'aria-live': 'polite' });

  const el = h('div.doe-onweer',
    h('div.ow-tellen', knop, teller),
    uitleg,
    h('label.doe-label', h('span', 'Of schuif: ', schuifTekst), schuif),
    strook, uitkomst, advies, vergelijk);
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && begin != null) { e.preventDefault(); stopTellen(); uitleg.textContent = 'Gestopt met tellen.'; } });

  function flits() {
    begin = performance.now();
    knop.textContent = 'Donder!';
    knop.classList.add('telt');
    uitleg.textContent = 'Tellen… Tik op Donder! zodra je de donder hoort.';
    const tik = () => {
      if (!el.isConnected || begin == null) return;
      const sec = (performance.now() - begin) / 1000;
      teller.textContent = `${getal(Math.floor(sec * 10) / 10)} s`;
      frame = requestAnimationFrame(tik);
    };
    tik();
  }

  function donder() {
    const sec = Math.round(((performance.now() - begin) / 1000) * 10) / 10;
    stopTellen();
    uitleg.textContent = 'Tik op Flits! bij de volgende bliksem om opnieuw te tellen.';
    schuif.value = Math.min(MAX, Math.round(sec));
    zet(sec, true);
  }

  function stopTellen() {
    if (begin == null) return;
    begin = null;
    cancelAnimationFrame(frame);
    knop.textContent = 'Flits!';
    knop.classList.remove('telt');
  }

  /** Show what a count of `sec` seconds means; `geteld` when it was counted, not slid. */
  function zet(sec, geteld) {
    const km = sec / 3;
    teller.textContent = geteld ? `${getal(sec)} s` : '';
    schuifTekst.textContent = `${Math.round(Number(schuif.value))} seconden`;
    uitkomst.replaceChildren(`${getal(sec)} seconden gedeeld door 3: het onweer is ongeveer `, h('strong', `${getal(Math.round(km * 10) / 10)} km`), ' weg.');
    const dichtbij = sec <= 10;
    advies.classList.toggle('gevaar', dichtbij);
    advies.textContent = dichtbij
      ? 'Hoor je de donder binnen 10 seconden, dan is het onweer gevaarlijk dichtbij. Stop de activiteit en zoek een veilige plek.'
      : 'Meer dan 10 seconden: nog niet vlakbij. Maar hoor je donder, zoek dan al een veilige plek. Tel bij de volgende flits opnieuw: komt het dichterbij?';
    wolk.setAttribute('transform', `translate(${xVan(km)} 34)`);
    strook.classList.toggle('dichtbij', dichtbij);
    if (geteld) {
      vergelijk.textContent = vorige == null ? ''
        : `De vorige keer ${getal(vorige)} seconden: ${sec < vorige - 1 ? 'het onweer komt dichterbij.' : sec > vorige + 1 ? 'het onweer trekt weg.' : 'ongeveer even ver.'}`;
      vorige = sec;
    }
  }

  zet(Number(schuif.value), false);
  return el;
}
