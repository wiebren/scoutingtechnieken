// Duimsprong: your thumb at arm's length, a house of known width far away. Look with one eye, then the other, and
// the thumb jumps against the background. The jump is always about a tenth of the distance (the arm is about ten
// times the distance between the eyes), so: how many house widths is the jump, times the width, times ten.
// In the picture the jump is a fixed angle; only the size of the house changes with the distance.
import { h } from '../../dom.js';
import { actie, acties, keuze, schakel } from '../knoppen.js';
import { getal, s, tussen } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './duimsprong.css';

const F = 1200;                 // px per metre at 1 m: something W m wide at D m is W * F / D px
const SPRONG = F / 10;          // the jump in px, the same at every distance
const BREED = 10;               // the house is 10 m wide
const X = 170;                  // where the thumb is

export default function duimsprong() {
  let afstand = 0;
  let oog = 'rechts';
  let beide = false;
  let goed = 0; let gedaan = 0;

  // -- what you see: a far field with a house, and your thumb close by
  const huis = s('g', {});
  const verte = s('g', { class: 'ds-verte' },
    s('rect', { x: -400, y: 0, width: 1200, height: 120, class: 'lucht' }),
    s('rect', { x: -400, y: 120, width: 1200, height: 100, class: 'gras' }),
    s('path', { d: 'M-400 120 Q-200 110 0 118 T400 114 T800 120 V120Z', class: 'gras-donker' }),
    huis);
  const maat = s('g', { class: 'ds-maat' });
  const geest = s('path', { d: thumbPad(X), class: 'ds-geest' });
  const duim = s('path', { d: thumbPad(X), class: 'ds-duim' });
  const svg = s('svg', { viewBox: '0 0 360 220', class: 'wn-svg wn-rand ds-svg', role: 'img' }, verte, maat, geest, duim);

  // -- seen from above, how it works
  const boven = s('svg', { viewBox: '0 0 220 150', class: 'wn-svg ds-boven', role: 'img',
    'aria-label': 'Van bovenaf: je twee ogen, je duim op armlengte, en de lijnen van elk oog langs je duim naar de verte. Daar liggen ze een tiende van de afstand uit elkaar.' },
    s('path', { d: 'M20 18 H200', class: 'lijn stil' }),
    s('path', { d: 'M104 132 L110 92 L128 18 M116 132 L110 92 L92 18', class: 'zicht' }),
    s('path', { d: 'M92 12 H128', class: 'maat' }),
    s('text', { x: 110, y: 9, 'text-anchor': 'middle', class: 'klein' }, 'sprong'),
    s('circle', { cx: 104, cy: 134, r: 3.5, class: 'inkt' }), s('circle', { cx: 116, cy: 134, r: 3.5, class: 'inkt' }),
    s('circle', { cx: 110, cy: 92, r: 3, class: 'accent' }),
    s('text', { x: 124, y: 96, class: 'klein' }, 'duim'),
    s('text', { x: 124, y: 140, class: 'klein' }, 'ogen'),
    s('text', { x: 24, y: 112, class: 'klein stil' }, 'arm ≈ 10 × de'),
    s('text', { x: 24, y: 125, class: 'klein stil' }, 'afstand tussen'),
    s('text', { x: 24, y: 138, class: 'klein stil' }, 'je ogen'),
    s('text', { x: 140, y: 52, class: 'klein stil' }, 'sprong ≈'),
    s('text', { x: 140, y: 65, class: 'klein stil' }, 'afstand ÷ 10'));

  // -- the words
  const oogChips = keuze([['rechts', 'Rechteroog'], ['links', 'Linkeroog']], oog, (o) => { oog = o; teken(); });
  const beideChip = schakel('Beide plekken tegelijk', beide, (aan) => { beide = aan; teken(); });
  const omschrijving = h('p.doe-sr', { 'aria-live': 'polite' });
  const veld = h('input.doe-veld', { type: 'number', min: 1, max: 5000, inputmode: 'numeric', 'aria-label': 'Jouw schatting in meters',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); controleer(); } } });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');

  const el = h('div.wn.doe-duimsprong',
    h('p', `Het huis is ${BREED} m breed. Kijk met je rechteroog: je duim staat op de linkerkant van het huis. Kijk dan met je linkeroog.`),
    h('div.chips', { role: 'group', 'aria-label': 'Met welk oog kijk je?' }, oogChips, beideChip),
    svg, omschrijving,
    h('div.wn-rij', h('span', 'Hoe ver is het huis?'), veld, h('span', 'm')),
    acties(actie('Kijk na', 'vink', controleer, { hoofd: true, klein: true }), actie('Ander huis', 'opnieuw', nieuw, { klein: true })),
    melding, score,
    h('details.ds-hoe', h('summary', 'Hoe werkt het?'), boven,
      h('p.doe-stil', 'De sprong daarginds is ongeveer een tiende van de afstand. Springt je duim 2½ keer een huis van 10 m breed, dan is de sprong 25 m en het huis ongeveer 250 m ver.')));

  function huisVorm(px) {
    const w = px; const hh = px * 0.62; const dak = px * 0.42;
    const voet = 120 + Math.min(14, 1400 / afstand);
    return [
      s('rect', { x: 0, y: voet - hh, width: w, height: hh, class: 'ds-muur' }),
      s('path', { d: `M${-w * 0.06} ${voet - hh} L${w / 2} ${voet - hh - dak} L${w * 1.06} ${voet - hh}Z`, class: 'ds-dak' }),
      w > 14 && s('rect', { x: w * 0.42, y: voet - hh * 0.55, width: w * 0.16, height: hh * 0.55, class: 'ds-deur' }),
      w > 24 && [0.14, 0.7].map((f) => s('rect', { x: w * f, y: voet - hh * 0.8, width: w * 0.16, height: hh * 0.24, class: 'ds-raam' })),
    ];
  }

  function teken() {
    const px = (BREED * F) / afstand;
    huis.replaceChildren(...huisVorm(px).flat().filter(Boolean));
    // with the right eye the left wall of the house is behind the thumb; with the left eye everything far away
    // shifts the jump to the left, so the thumb seems to have jumped to the right
    const links = oog === 'links' ? -SPRONG : 0;
    huis.setAttribute('transform', `translate(${X} 0)`);
    verte.style.transform = `translateX(${links}px)`;
    geest.style.display = beide ? '' : 'none';
    geest.setAttribute('d', thumbPad(oog === 'links' ? X - SPRONG : X + SPRONG));
    maat.replaceChildren();
    if (beide) {
      const begin = oog === 'links' ? X - SPRONG : X;
      for (let x = 0; x <= SPRONG + 0.5; x += px) maat.append(s('path', { d: `M${(begin + x).toFixed(1)} 196 v10`, class: 'maat' }));
      maat.append(s('path', { d: `M${begin} 201 h${SPRONG}`, class: 'maat' }),
        s('text', { x: 180, y: 18, 'text-anchor': 'middle', class: 'ds-label' }, `sprong ≈ ${getal(SPRONG / px, 1)} × het huis`));
    }
    omschrijving.textContent = oog === 'links'
      ? `Met je linkeroog staat je duim rechts van de linkerkant van het huis${beide ? `, ${getal(SPRONG / px, 1)} keer de breedte van het huis verder` : ''}.`
      : 'Met je rechteroog staat je duim op de linkerkant van het huis.';
    svg.setAttribute('aria-label', `Je duim voor een huis in de verte. ${omschrijving.textContent}`);
  }

  function nieuw() {
    afstand = tussen(6, 60) * 10;
    oog = 'rechts'; oogChips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === 0)));
    veld.value = ''; melding.textContent = ''; melding.classList.remove('fout');
    teken();
  }

  function controleer() {
    const g = Number(veld.value);
    if (!veld.value || !(g > 0)) { melding.textContent = 'Vul een afstand in meters in.'; melding.classList.add('fout'); return; }
    const fout = Math.abs(g - afstand) / afstand;
    gedaan += 1; if (fout <= 0.25) goed += 1;
    const keer = afstand / 100;
    melding.classList.toggle('fout', fout > 0.25);
    melding.textContent = `${fout <= 0.25 ? 'Goed!' : 'Mis.'} De duim sprong ${getal(keer, 1)} keer het huis: ${getal(keer * BREED)} m. Keer 10 is ${getal(afstand)} m.`;
    score.textContent = `${goed} van de ${gedaan} binnen 25 %.`;
  }

  nieuw();
  return el;
}

/** A thumb from below, its nail up, centred on x. */
function thumbPad(x) {
  return `M${x - 17} 220 L${x - 15} 150 Q${x - 15} 128 ${x} 126 Q${x + 15} 128 ${x + 15} 150 L${x + 17} 220 Z`;
}
