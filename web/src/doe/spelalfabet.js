// The spelalfabet to try: type a word or your name and it is spelled out, letter by letter, in the NAVO alphabet
// of the blad (with what the hulpdiensten write for J and W). Oefenen shows a letter and four words to choose from.
import { h } from '../dom.js';
import { C2000, SPELALFABET, kaal, willekeurig } from './codes.js';
import { actie, acties, keuze } from './knoppen.js';
import './vorm.css';
import './spelalfabet.css';

const LETTERS = Object.keys(SPELALFABET);

export default function spelalfabet() {
  let vraag = null;              // { letter, klaar }
  let goed = 0;
  let gevraagd = 0;

  // -- Spellen
  const invoer = h('input.doe-veld', { type: 'text', value: 'Scouting', maxlength: 40, autocomplete: 'off', spellcheck: 'false', oninput: () => spel() });
  const zin = h('p.sa-zin', { 'aria-live': 'polite' });
  const lijst = h('ol.sa-lijst', { 'aria-hidden': 'true' });
  const opmerking = h('p.doe-stil');
  const spellen = h('div.sa-paneel', h('label.doe-label', 'Typ een woord of je naam', invoer), zin, lijst, opmerking);

  function spel() {
    const tekens = [...kaal(invoer.value).trim()];
    let overig = false;
    lijst.replaceChildren(...tekens.map((t) => {
      if (/\s/.test(t)) return h('li.sa-spatie', h('span.sa-letter', '␣'), h('span.sa-woord', 'spatie'));
      if (!SPELALFABET[t]) { overig = true; return h('li.sa-ander', h('span.sa-letter', t), h('span.sa-woord', '–')); }
      return h('li', h('span.sa-letter', t), h('span.sa-woord', SPELALFABET[t]),
        C2000[t] && h('span.sa-ook', `hulpdiensten: ${C2000[t]}`));
    }));
    zin.textContent = kaal(invoer.value).trim().split(/\s+/).map((w) => [...w].map((t) => SPELALFABET[t] ?? t).join(' ')).join(' – ');
    opmerking.textContent = overig ? 'Cijfers en leestekens staan niet in het spelalfabet: die zeg je gewoon.' : '';
  }

  // -- Oefenen: a letter, four words
  const vraagLetter = h('p.sa-vraag', { 'aria-live': 'polite' });
  const opties = h('div.sa-opties', { role: 'group', 'aria-label': 'Kies het woord' });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil');
  const volgende = actie('Volgende', 'verder', () => nieuweVraag(true), { klein: true });
  const oefenen = h('div.sa-paneel', vraagLetter, opties, acties(volgende), melding, score);
  oefenen.addEventListener('keydown', (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= 4 && !vraag?.klaar) { e.preventDefault(); opties.children[k - 1]?.click(); }
  });

  function nieuweVraag(focus) {
    let letter;
    do letter = willekeurig(LETTERS); while (letter === vraag?.letter);
    vraag = { letter, klaar: false };
    const anderen = LETTERS.filter((l) => l !== letter).sort(() => Math.random() - 0.5).slice(0, 3);
    const keus = [letter, ...anderen].sort(() => Math.random() - 0.5);
    vraagLetter.replaceChildren('Welk woord hoort bij de ', h('strong', letter), '?');
    opties.replaceChildren(...keus.map((l, i) => h('button.knop.sa-optie', { type: 'button', 'data-letter': l,
      'aria-keyshortcuts': String(i + 1), onclick: (e) => kies(l, e.currentTarget) }, SPELALFABET[l])));
    melding.textContent = '';
    melding.classList.remove('fout');
    volgende.hidden = true;
    if (focus) opties.firstChild.focus();
  }

  function kies(l, knop) {
    if (vraag.klaar) return;
    vraag.klaar = true;
    gevraagd++;
    const juist = [...opties.children].find((k) => k.dataset.letter === vraag.letter);
    juist.classList.add('goed');
    if (l === vraag.letter) { goed++; melding.textContent = `Goed! ${vraag.letter} is ${SPELALFABET[vraag.letter]}.`; }
    else { knop.classList.add('fout'); melding.classList.add('fout'); melding.textContent = `Niet goed: ${vraag.letter} is ${SPELALFABET[vraag.letter]}. ${SPELALFABET[l]} is de ${l}.`; }
    for (const k of opties.children) k.setAttribute('aria-disabled', 'true');
    score.textContent = `${goed} van ${gevraagd} goed.`;
    volgende.hidden = false;
    volgende.focus();
  }

  const el = h('div.doe-spelalfabet',
    h('div.chips', { role: 'group', 'aria-label': 'Wat wil je doen?' }, keuze([['spellen', 'Spellen'], ['oefenen', 'Oefenen']], 'spellen', (m) => {
      spellen.hidden = m !== 'spellen';
      oefenen.hidden = m !== 'oefenen';
      if (m === 'oefenen' && !vraag) nieuweVraag(false);
    })),
    spellen, oefenen);

  oefenen.hidden = true;
  spel();
  return el;
}
