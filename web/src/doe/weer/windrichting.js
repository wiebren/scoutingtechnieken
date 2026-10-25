// Where does the wind come from? Seen from above: a campfire whose smoke blows away with the wind, or a weather vane
// whose arrow points into the wind. Choose the name of the wind: it is named after where it comes from, so smoke
// blowing to the north-east means a zuidwestenwind.
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { p, pol, s } from '../kompasdelen.js';
import '../vorm.css';
import './windrichting.css';

const C = 170;
const ACHT = [[0, 'N', 'noordenwind'], [45, 'NO', 'noordoostenwind'], [90, 'O', 'oostenwind'], [135, 'ZO', 'zuidoostenwind'],
  [180, 'Z', 'zuidenwind'], [225, 'ZW', 'zuidwestenwind'], [270, 'W', 'westenwind'], [315, 'NW', 'noordwestenwind']];
const NAAR = { N: 'het noorden', NO: 'het noordoosten', O: 'het oosten', ZO: 'het zuidoosten', Z: 'het zuiden', ZW: 'het zuidwesten', W: 'het westen', NW: 'het noordwesten' };

export default function windrichting() {
  let uit = 225;                // where the wind comes from
  let teken = 'rook';           // what shows it: rook or vaan
  let goed = 0; let gehad = 0;

  // -- the picture: a rose round the edge, in the middle the fire with smoke, or the vane
  const roos = s('g');
  roos.append(s('circle', { cx: C, cy: C, r: 150, class: 'wr-grond' }), s('circle', { cx: C, cy: C, r: 150, class: 'wr-rand' }));
  for (const [g, t] of ACHT) {
    const [x, y] = pol(C, C, 134, g);
    roos.append(s('text', { x: p(x), y: p(y), class: g % 90 ? 'wr-letter tussen' : 'wr-letter', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, t));
  }
  const rook = s('g', { class: 'wr-rook' });
  for (let i = 0; i < 7; i++) rook.append(s('circle', { cx: 0, cy: -14 - i * 14, r: 6 + i * 1.6, class: 'wr-pluim', style: `--i: ${i}` }));
  const vuur = s('g', {}, rook,
    s('path', { d: 'M-12 8L12 -8M-12 -8L12 8', class: 'wr-hout' }),
    s('path', { d: 'M0 -9C7 -3 6 5 0 8C-6 5 -7 -3 0 -9Z', class: 'wr-vlam' }));
  const vaan = s('g', {},
    s('path', { d: 'M0 -66V58', class: 'wr-stang' }),
    s('path', { d: 'M0 -80L-10 -56H10Z', class: 'wr-punt' }),
    s('path', { d: 'M0 30L-13 52M0 30L13 52M0 42L-13 64M0 42L13 64M0 54L-13 76M0 54L13 76', class: 'wr-staart' }),
    s('circle', { r: 5, class: 'wr-as' }));
  const midden = s('g');
  const svg = s('svg', { viewBox: '0 0 340 340', class: 'wr-svg', role: 'img' }, roos, midden);

  // -- the answer
  const vraag = h('p.wr-vraag');
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const verder = actie('Volgende', 'verder', () => nieuw(), { hoofd: true, klein: true, hidden: true });
  const knoppen = ACHT.map(([g, , naam]) => h('button.knop.klein.wr-knop', { type: 'button', 'data-g': g, onclick: () => kies(g) }, naam));

  function nieuw() {
    let g; do g = ACHT[Math.floor(Math.random() * 8)][0]; while (g === uit);
    uit = g;
    teken = Math.random() < 0.6 ? 'rook' : 'vaan';
    melding.textContent = ''; melding.classList.remove('fout');
    verder.hidden = true;
    knoppen.forEach((k) => { k.disabled = false; k.classList.remove('goed', 'fout'); });
    tekenen();
  }

  function tekenen() {
    // smoke blows away from where the wind comes from: towards uit + 180; the vane's arrow points to uit
    midden.replaceChildren(teken === 'rook' ? vuur : vaan);
    midden.setAttribute('transform', `translate(${C} ${C}) rotate(${teken === 'rook' ? uit + 180 : uit})`);
    vraag.textContent = teken === 'rook'
      ? 'Het kampvuur van bovenaf. Welke wind waait er?'
      : 'Een windvaan van bovenaf. De pijl wijst naar de kant waar de wind vandaan komt. Welke wind waait er?';
    svg.setAttribute('aria-label', teken === 'rook'
      ? `Een kampvuur van bovenaf; de rook waait naar ${NAAR[ACHT.find((a) => a[0] === (uit + 180) % 360)[1]]}.`
      : `Een windvaan van bovenaf; de pijl wijst naar ${NAAR[ACHT.find((a) => a[0] === uit)[1]]}.`);
  }

  function kies(g) {
    const juist = ACHT.find((a) => a[0] === uit);
    gehad += 1; if (g === uit) goed += 1;
    knoppen.forEach((k) => { k.disabled = true; if (Number(k.dataset.g) === uit) k.classList.add('goed'); else if (Number(k.dataset.g) === g) k.classList.add('fout'); });
    const waarom = teken === 'rook'
      ? `De rook waait naar ${NAAR[ACHT.find((a) => a[0] === (uit + 180) % 360)[1]]}, dus de wind komt uit ${NAAR[juist[1]]}`
      : `De pijl wijst naar ${NAAR[juist[1]]}: daar komt de wind vandaan`;
    melding.classList.toggle('fout', g !== uit);
    melding.textContent = `${g === uit ? 'Goed!' : 'Nee.'} ${waarom}: ${juist[2]}.${g !== uit && (g + 180) % 360 === uit ? ' Let op: een wind krijgt de naam van de kant waar hij vandaan komt, niet van waar hij heen gaat.' : ''} ${goed} van de ${gehad} goed.`;
    verder.hidden = false; verder.focus();
  }

  nieuw();
  return h('div.doe-windrichting',
    h('div.wr-beeld', svg),
    h('div.wr-tekst', vraag, h('div.wr-knoppen', knoppen), acties(verder), melding));
}
