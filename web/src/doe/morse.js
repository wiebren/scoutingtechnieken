// Morse to see, hear and guess. Type something and it is shown in dots and dashes, letter by letter; Speel af
// sends it as a tone and with a lamp at the same time, at the speed you set. Luister en raad sends a letter or a
// short word, and you type what you heard. The letters and cijfers of codes.js (MORSE); SOS as one sign.
import { h } from '../dom.js';
import { MORSE, SOS, WOORDEN, kaal, morseTekst, morseTijdlijn, naarMorse, symbolen, willekeurig } from './codes.js';
import { geluid, speel } from './klank.js';
import { actie, acties, keuze, schakel, zetActie } from './knoppen.js';
import './vorm.css';
import './morse.css';

const LETTERS = Object.keys(MORSE).filter((t) => /[A-Z]/.test(t));
const uitgesproken = (code) => [...code].map((s) => (s === '.' ? 'kort' : 'lang')).join(' ');

/** The words of a text in morse; SOS on its own is one sign (blad morse). */
function inMorse(tekst) {
  if (kaal(tekst).trim() === 'SOS') return { woorden: [[{ teken: 'SOS', code: SOS }]], zonder: [], sos: true };
  return naarMorse(tekst);
}

export default function morse({ modus: beginModus = 'seinen', tekst: beginTekst = 'Hallo scouts' } = {}) {
  let modus = beginModus;
  let wpm = 10;
  let metGeluid = true;
  let metLicht = true;
  let stop = null;               // stops what is playing
  let vraag = null;              // { tekst, woorden, klaar } in Luister en raad
  let soort = 'letters';         // what Luister en raad sends: letters or woorden
  let goed = 0;
  let gevraagd = 0;
  let tegels = [];               // the letters on screen, to light the one that sounds

  // -- the lamp and the speed: for both
  const lamp = h('div.doe-lamp', { 'aria-hidden': 'true' });
  const snelheidTekst = h('strong');
  const snelheid = h('input.doe-schuif', { type: 'range', min: 5, max: 20, step: 1, value: wpm,
    oninput: () => { wpm = Number(snelheid.value); toonSnelheid(); } });
  const toonSnelheid = () => { snelheidTekst.textContent = `${wpm} woorden per minuut`; };
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });

  // -- Seinen: text in, morse out
  const invoer = h('input.doe-veld', { type: 'text', value: beginTekst, maxlength: 80, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false',
    oninput: () => { stopSpelen(); toonTekst(); },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); wisselSpelen(); } } });
  const tekens = h('div.ms-tekens', { 'aria-hidden': 'true' });
  const regel = h('p.ms-regel', { 'aria-hidden': 'true' });
  const voorlezer = h('p.doe-sr');
  const opmerking = h('p.doe-stil');
  const speelKnop = actie('Speel af', 'start', () => wisselSpelen(), { hoofd: true });

  const seinen = h('div.ms-paneel',
    h('label.doe-label', 'Typ een woord of een zin', invoer),
    tekens, regel, voorlezer, opmerking);

  // -- Luister en raad
  const antwoord = h('input.doe-veld', { type: 'text', maxlength: 12, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false',
    'aria-label': 'Wat hoorde je?', placeholder: 'Wat hoorde je?',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); controleer(); } } });
  const vraagKnop = actie('Speel een nieuwe', 'start', () => (vraag && !vraag.klaar ? speelVraag() : nieuweVraag()), { hoofd: true });
  const andereKnop = actie('Een andere', 'opnieuw', () => nieuweVraag());
  const score = h('p.doe-stil');
  const raden = h('div.ms-paneel',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je horen?' }, keuze([['letters', 'Letters'], ['woorden', 'Korte woorden']], soort, (s) => { soort = s; nieuweVraag(); })),
    h('div.ms-antwoord', antwoord),
    acties(actie('Kijk na', 'vink', () => controleer())),
    score);

  const speler = h('div.ms-speler', lamp,
    h('div.ms-bediening',
      h('label.doe-label', h('span', 'Snelheid: ', snelheidTekst), snelheid),
      acties(speelKnop, vraagKnop, andereKnop)));

  const el = h('div.doe-morse',
    h('div.ms-kies',
      h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' }, keuze([['seinen', 'Seinen'], ['raden', 'Luisteren']], modus, zetModus)),
      h('div.chips', { role: 'group', 'aria-label': 'Hoe seinen?' },
        schakel('Geluid', metGeluid, (aan) => { metGeluid = aan; }),
        schakel('Licht', metLicht, (aan) => { metLicht = aan; lamp.hidden = !aan; lamp.classList.remove('aan'); }))),
    seinen, raden, speler, melding,
    h('p.doe-stil', 'Hoor je niets? Zet het geluid van je telefoon aan, en zet de stille stand uit.'));
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && stop) { e.preventDefault(); stopSpelen(); } });

  // -- showing the text
  function toonTekst() {
    const { woorden, zonder, sos } = inMorse(invoer.value);
    tegels = [];
    tekens.replaceChildren(...woorden.map((w) => h('span.ms-woord', w.map((l) => {
      const t = h('span.ms-teken', h('b', l.teken), h('span', symbolen(l.code)));
      tegels.push(t);
      return t;
    }))));
    regel.textContent = morseTekst(woorden);
    voorlezer.textContent = woorden.length ? woorden.flat().map((l) => `${l.teken}: ${uitgesproken(l.code)}.`).join(' ') : '';
    opmerking.textContent = sos ? 'SOS sein je als één teken: zonder ruimte tussen de letters.'
      : zonder.length ? `Hiervoor bestaat geen morse: ${zonder.join(' ')}. Die tekens slaan we over.` : '';
    speelKnop.disabled = !woorden.length;
    return woorden;
  }

  // -- playing
  function zetKnoppen() {
    zetActie(speelKnop, ...(stop ? ['Stop', 'stop'] : ['Speel af', 'start']));
    zetActie(vraagKnop, ...(stop && modus === 'raden' ? ['Stop', 'stop'] : !vraag || vraag.klaar ? ['Speel een nieuwe', 'start'] : ['Nog eens', 'opnieuw']));
  }

  function speelAf(woorden, klaar) {
    stopSpelen();
    if (!metGeluid && !metLicht) { melding.textContent = 'Zet het geluid of het licht aan.'; return; }
    if (metGeluid && !geluid()) melding.textContent = 'Deze browser maakt geen geluid; kijk naar het licht.';
    stop = speel(morseTijdlijn(woorden, wpm), {
      el, metGeluid, hz: 600,
      opStand: (aan, stuk) => {
        if (metLicht) lamp.classList.toggle('aan', aan);
        tegels.forEach((t, i) => t.classList.toggle('nu', i === stuk?.teken));
      },
      opKlaar: () => { stop = null; zetKnoppen(); klaar?.(); },
    });
    zetKnoppen();
  }

  function stopSpelen() {
    if (stop) { const s = stop; stop = null; s(); }
    zetKnoppen();
  }

  function wisselSpelen() {
    if (stop) { stopSpelen(); return; }
    const woorden = toonTekst();
    if (!woorden.length) return;
    melding.textContent = '';
    speelAf(woorden);
  }

  // -- Luister en raad
  function nieuweVraag() {
    let tekst;
    do tekst = soort === 'letters' ? willekeurig(LETTERS) : willekeurig(WOORDEN); while (tekst === vraag?.tekst);
    vraag = { tekst, woorden: naarMorse(tekst).woorden, klaar: false };
    antwoord.value = '';
    melding.textContent = '';
    melding.classList.remove('fout');
    speelVraag();
  }

  function speelVraag() {
    if (stop) { stopSpelen(); return; }
    tegels = [];
    speelAf(vraag.woorden, () => { if (el.isConnected && !vraag.klaar) antwoord.focus({ preventScroll: true }); });
  }

  function controleer() {
    if (!vraag) { melding.textContent = 'Speel eerst een letter af.'; return; }
    if (vraag.klaar) { nieuweVraag(); return; }
    const gegeven = kaal(antwoord.value).replace(/\s/g, '');
    if (!gegeven) { melding.textContent = 'Typ eerst wat je hoorde.'; return; }
    vraag.klaar = true;
    gevraagd++;
    const uitleg = `${vraag.tekst} is ${morseTekst(vraag.woorden)}`;
    if (gegeven === vraag.tekst) { goed++; melding.classList.remove('fout'); melding.textContent = `Goed! ${uitleg}.`; }
    else { melding.classList.add('fout'); melding.textContent = `Niet goed: ${uitleg}.`; }
    score.textContent = `${goed} van ${gevraagd} goed. Enter of de knop voor de volgende.`;
    zetKnoppen();
  }

  function zetModus(m) {
    modus = m;
    stopSpelen();
    seinen.hidden = m !== 'seinen';
    raden.hidden = m !== 'raden';
    speelKnop.hidden = m !== 'seinen';
    vraagKnop.hidden = andereKnop.hidden = m !== 'raden';
    melding.textContent = '';
    melding.classList.remove('fout');
    if (m === 'seinen') toonTekst();
    else score.textContent = gevraagd ? `${goed} van ${gevraagd} goed.` : 'Je hoort morse. Typ wat het was.';
    zetKnoppen();
  }

  toonSnelheid();
  zetModus(modus);
  return el;
}
