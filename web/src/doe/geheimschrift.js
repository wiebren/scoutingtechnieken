// A geheimschrift to try: the verschuivingscode or A=1 (`soort`). Type in the gewone tekst or in the geheime tekst
// and the other follows. For the verschuiving a slider sets how far, and two strips of the alphabet show what
// becomes what; for A=1 the strips show the numbers. Raad de boodschap gives a sentence in code: find the
// verschuiving with the slider, or type what the numbers say.
import { h } from '../dom.js';
import { ZINNEN, kaal, letterOp, naarGetallen, vanGetallen, verschuif, willekeurig } from './codes.js';
import { actie, acties, keuze } from './knoppen.js';
import './vorm.css';
import './geheimschrift.css';

const ABC = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const alleenLetters = (t) => kaal(t).replace(/[^A-Z]/g, '');

export default function geheimschrift({ soort = 'verschuiving' } = {}) {
  const schuift = soort === 'verschuiving';
  let n = 3;
  let raad = null;               // { zin, geheim, n, klaar }

  // -- the strips: the alphabet, and under it what each letter becomes
  const boven = ABC.map((l) => h('span', l));
  const onder = ABC.map(() => h('span'));
  const stroken = h('div.gs-stroken', { 'aria-hidden': 'true' },
    h('div.gs-strook', h('span.gs-kop', 'gewoon'), boven),
    h('div.gs-strook.geheim', h('span.gs-kop', schuift ? 'geheim' : 'getal'), onder));
  const markeer = (i) => [...boven, ...onder].forEach((c, j) => c.classList.toggle('nu', j % 26 === i));

  // -- Coderen
  const schuifTekst = h('strong');
  const schuif = h('input.doe-schuif', { type: 'range', min: 1, max: 25, step: 1, value: n,
    oninput: () => { n = Number(schuif.value); zetStroken(); vanGewoon(); } });
  const gewoon = h('textarea.doe-veld', { rows: 2, maxlength: 300, spellcheck: 'false', oninput: () => vanGewoon(true) },
    'Kom om acht uur naar het kampvuur');
  const geheim = h('textarea.doe-veld', { rows: 2, maxlength: 900, spellcheck: 'false', oninput: () => vanGeheim(true) });
  const opmerking = h('p.doe-stil', { 'aria-live': 'polite' });
  const coderen = h('div.gs-paneel',
    schuift && h('label.doe-label', h('span', 'Verschuiving: ', schuifTekst), schuif),
    stroken,
    h('div.gs-velden',
      h('label.doe-label', 'Gewone tekst', gewoon),
      h('label.doe-label', schuift ? 'Geheime tekst' : 'In getallen', geheim)),
    opmerking);

  function zetStroken() {
    onder.forEach((c, i) => { c.textContent = schuift ? letterOp(i + n) : String(i + 1); });
    if (schuift) schuifTekst.textContent = `${n} (A wordt ${letterOp(n)}, B wordt ${letterOp(n + 1)})`;
  }

  /** The column of the last letter typed, to light it in the strips. */
  function laatsteLetter(tekst, terug) {
    const l = alleenLetters(tekst).at(-1);
    if (!l) return -1;
    const i = ABC.indexOf(l);
    return terug ? (((i - n) % 26) + 26) % 26 : i;
  }

  function vanGewoon(getypt) {
    if (schuift) {
      geheim.value = verschuif(gewoon.value, n);
      opmerking.textContent = '';
    } else {
      const { tekst, zonder } = naarGetallen(gewoon.value);
      geheim.value = tekst;
      opmerking.textContent = zonder.length ? 'Cijfers kun je in deze code niet schrijven; die zijn weggelaten.' : '';
    }
    if (getypt) markeer(laatsteLetter(gewoon.value, false));
  }

  function vanGeheim(getypt) {
    if (schuift) {
      gewoon.value = verschuif(geheim.value, -n);
      if (getypt) markeer(laatsteLetter(geheim.value, true));
    } else {
      gewoon.value = vanGetallen(geheim.value);
      opmerking.textContent = gewoon.value.includes('?') ? 'Een ? staat voor een getal dat geen letter is. Alleen 1 tot en met 26 zijn letters.' : '';
      if (getypt) markeer(laatsteLetter(gewoon.value, false));
    }
  }

  // -- Raad de boodschap
  const raadGeheim = h('p.gs-boodschap');
  const terugTekst = h('strong');
  const terug = h('input.doe-schuif', { type: 'range', min: 0, max: 25, step: 1, value: 0, oninput: () => probeer() });
  const uitkomst = h('p.gs-uitkomst', { 'aria-live': 'polite' });
  const antwoord = h('input.doe-veld', { type: 'text', maxlength: 120, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Wat staat er?', placeholder: 'Wat staat er?',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); kijkNa(); } } });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const raden = h('div.gs-paneel',
    h('p.doe-stil', schuift ? 'Deze boodschap is verschoven, maar je weet niet hoeveel. Schuif terug tot er iets staat dat je kunt lezen.'
      : 'Wat staat hier? Elk getal is een letter.'),
    raadGeheim,
    schuift ? [
      h('label.doe-label', h('span', 'Schuif terug: ', terugTekst), terug),
      uitkomst,
      h('p.doe-stil', 'Tip: kijk naar de korte woorden. Welke woorden van twee of drie letters ken je?'),
    ] : h('div.gs-antwoord', antwoord),
    acties(
      !schuift && actie('Kijk na', 'vink', () => kijkNa()),
      !schuift && actie('Laat zien', 'oog', () => laatZien()),
      actie('Nieuwe boodschap', 'opnieuw', () => nieuweBoodschap(), { klein: true })),
    melding);

  function nieuweBoodschap() {
    let zin;
    do zin = willekeurig(ZINNEN); while (zin === raad?.zin);
    const sleutel = 1 + Math.floor(Math.random() * 25);
    raad = { zin, n: sleutel, klaar: false, geheim: schuift ? verschuif(zin, sleutel).toUpperCase() : naarGetallen(zin).tekst };
    raadGeheim.textContent = raad.geheim;
    terug.value = 0;
    antwoord.value = '';
    melding.textContent = '';
    melding.classList.remove('fout');
    if (schuift) probeer();
  }

  function probeer() {
    const t = Number(terug.value);
    terugTekst.textContent = String(t);
    uitkomst.textContent = `Dan staat er: ${verschuif(raad.geheim, -t)}`;
    const gevonden = t === raad.n;
    uitkomst.classList.toggle('goed', gevonden);
    melding.textContent = gevonden ? `Gevonden! De verschuiving was ${raad.n}: A werd ${letterOp(raad.n)}.` : '';
  }

  function kijkNa() {
    const goed = alleenLetters(antwoord.value) === alleenLetters(raad.zin);
    melding.classList.toggle('fout', !goed);
    melding.textContent = !alleenLetters(antwoord.value) ? 'Typ eerst wat er volgens jou staat.'
      : goed ? `Goed! Er staat: ${raad.zin}.` : 'Nog niet goed. Kijk nog eens naar de getallen, of laat het zien.';
  }

  function laatZien() {
    melding.classList.remove('fout');
    melding.textContent = `Er staat: ${raad.zin}.`;
  }

  const el = h('div.doe-geheimschrift',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' }, keuze([['coderen', 'Coderen'], ['raden', 'Ontcijferen']], 'coderen', (m) => {
      coderen.hidden = m !== 'coderen';
      raden.hidden = m !== 'raden';
      if (m === 'raden' && !raad) nieuweBoodschap();
    })),
    coderen, raden);

  raden.hidden = true;
  zetStroken();
  vanGewoon(false);
  return el;
}
