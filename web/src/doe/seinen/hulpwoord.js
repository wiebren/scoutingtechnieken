// The morse hulpwoorden: pick a letter and see its word, the syllables with an o as strepen. Or make your own word:
// type it with streepjes between the syllables and see which letter it gives (./lib/hulpwoorden.js).
import { h } from '../../dom.js';
import { MORSE, symbolen } from '../codes.js';
import { HULPWOORDEN, hulpCode } from './lib/hulpwoorden.js';
import '../vorm.css';
import './hulpwoord.css';

const TERUG = Object.fromEntries(Object.entries(MORSE).filter(([l]) => /[A-Z]/.test(l)).map(([l, c]) => [c, l]));

/** A word in syllables, each with its punt or streep under it. */
function lettergrepen(woord) {
  return h('div.hw-woord', woord.split('-').map((g) => {
    const streep = /o/i.test(g);
    return h('span.hw-greep', { class: streep ? 'streep' : 'punt' },
      h('span.hw-tekst', [...g].map((ch) => (/o/i.test(ch) ? h('b', ch) : ch))),
      h('span.hw-teken', { 'aria-hidden': 'true' }));
  }));
}

export default function hulpwoord() {
  let letter = 'A';
  const knoppen = Object.keys(HULPWOORDEN).map((l) => h('button.chip', { type: 'button', 'aria-pressed': String(l === letter), onclick: () => kies(l) }, l));
  const toon = h('div.hw-toon', { 'aria-live': 'polite' });

  function kies(l) {
    letter = l;
    knoppen.forEach((k) => k.setAttribute('aria-pressed', String(k.textContent === l)));
    toon.replaceChildren(
      h('p.hw-kop', h('span.hw-letter', l), h('span.hw-morse', symbolen(MORSE[l]))),
      ...HULPWOORDEN[l].map((w) => lettergrepen(w)),
      l === 'X' ? h('p.doe-stil', 'Voor de X is er geen goed Nederlands woord; dit woord begint niet eens met een X.') : null);
  }

  // -- your own word
  const invoer = h('input.doe-veld', { type: 'text', value: 'Pan-nen-koe-ken', maxlength: 40, autocomplete: 'off', spellcheck: 'false', oninput: () => probeer() });
  const eigen = h('div.hw-eigen', { 'aria-live': 'polite' });
  function probeer() {
    const w = invoer.value.trim();
    if (!w) { eigen.replaceChildren(); return; }
    const code = hulpCode(w);
    const l = TERUG[code];
    const eerste = w.normalize('NFD').replace(/[^A-Za-z]/g, '')[0]?.toUpperCase();
    eigen.replaceChildren(lettergrepen(w.replace(/[\s·]+/g, '-')),
      h('p', `${symbolen(code)} `, l ? h('strong', `= ${l}`) : 'is geen letter.',
        l && eerste && l !== eerste ? ` Maar het woord begint met een ${eerste}: kies een woord dat met de ${l} begint.` : '',
        l && l === eerste ? ' Dat klopt: het begint ook met die letter!' : ''));
  }

  const el = h('div.doe-hulpwoord',
    h('div.chips.hw-letters', { role: 'group', 'aria-label': 'Kies een letter' }, knoppen),
    toon,
    h('label.doe-label', 'Bedenk zelf een woord: zet streepjes tussen de lettergrepen', invoer),
    eigen);

  kies(letter);
  probeer();
  return el;
}
