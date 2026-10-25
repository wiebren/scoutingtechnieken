// The roostercode (Cardan-rooster, NAV §5d): a square of letters that looks like nonsense, and a sjabloon with holes.
// Lay the sjabloon on it and only the letters in the holes show: that is the message. Type your own message and the
// piece makes a new square and sjabloon for it.
import { h } from '../../dom.js';
import { kaal } from '../codes.js';
import { actie, acties, schakel } from '../knoppen.js';
import '../vorm.css';
import './roostercode.css';

const N = 6;
const VUL = 'ABDEEGHIKLMNNOPRSTTUVWZ';     // filling, a little like Dutch text

/** A square for a message: the letters, the holes of the sjabloon, and the message as it is read (kraak.js uses it too). */
export function maak(boodschap) {
  const letters = [...kaal(boodschap).replace(/[^A-Z]/g, '')].slice(0, N * N - 6);
  const vakken = Array.from({ length: N * N }, (_, i) => i);
  // the holes: random places, read from top left to bottom right
  const gaten = vakken.sort(() => Math.random() - 0.5).slice(0, letters.length).sort((a, b) => a - b);
  const rooster = Array.from({ length: N * N }, () => VUL[Math.floor(Math.random() * VUL.length)]);
  gaten.forEach((g, i) => { rooster[g] = letters[i]; });
  return { rooster, gaten: new Set(gaten), boodschap: letters.join('') };
}

export default function roostercode() {
  let nu = maak('Zoek bij de eik');
  let erop = false;

  const rooster = h('div.rc-rooster', { role: 'img' });
  const uitkomst = h('p.rc-uitkomst', { 'aria-live': 'polite' });
  const invoer = h('input.doe-veld', { type: 'text', value: 'Zoek bij de eik', maxlength: 40, spellcheck: 'false',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); nieuw(); } } });
  const knop = schakel('Sjabloon erop', erop, (aan) => { erop = aan; toon(); });

  function toon() {
    rooster.classList.toggle('erop', erop);
    rooster.replaceChildren(...nu.rooster.map((l, i) => h('span', { class: nu.gaten.has(i) ? 'gat' : null }, l)));
    rooster.setAttribute('aria-label', erop ? `Met het sjabloon erop zie je alleen: ${nu.boodschap}` : `Een rooster van letters: ${nu.rooster.join(' ')}`);
    uitkomst.textContent = erop ? `Door de gaten lees je: ${nu.boodschap}` : 'Zie jij iets? Leg het sjabloon erop.';
  }

  function nieuw() {
    if (!kaal(invoer.value).replace(/[^A-Z]/g, '')) { uitkomst.textContent = 'Typ eerst een boodschap.'; return; }
    nu = maak(invoer.value);
    toon();
  }

  const el = h('div.doe-roostercode',
    h('div.rc-plek', rooster),
    h('div.chips', knop), uitkomst,
    h('label.doe-label', `Je eigen boodschap (hooguit ${N * N - 6} letters)`, invoer),
    acties(actie('Maak een rooster', 'opnieuw', () => nieuw(), { klein: true })),
    h('p.doe-stil', 'Echt maken: knip de gaten uit een stuk karton. De ontvanger heeft hetzelfde sjabloon.'));
  toon();
  return el;
}
