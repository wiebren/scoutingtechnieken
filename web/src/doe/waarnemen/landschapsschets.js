// Eén landschap, drie schetsen: the same view as a horizonschets (only the skyline, the band below it dark), a
// recognografische schets (everything that stays: roads, fences, houses, trees; no people, animals or clouds) and a
// panoramaschets (everything you see, in colour). Numbered points carry a compass bearing and an estimated
// distance, as the schets asks. opties.soort picks the one to start with.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from './hulp.js';
import './wn.css';
import './landschapsschets.css';

const SOORTEN = [
  ['horizon', 'Horizonschets', 'Alleen de luchtlijn: wat tegen de lucht afsteekt. Het stuk tussen de horizon en de luchtlijn maak je donker. Wat eronder ligt, teken je niet.'],
  ['recognografisch', 'Recognografisch', 'Alles wat blijft staan en ook op de kaart zou kunnen staan: de weg, het hek, de huizen, de kerk, de molen, de bomen. Geen koeien, geen fietser, geen wolken.'],
  ['panorama', 'Panorama', 'Alles wat je ziet, ook wat er maar even is: de koeien, de fietser, de wolken. In kleur, met licht en schaduw. Een getekende foto.'],
];
const H = 128;                    // the horizon

export default function landschapsschets({ soort = 'horizon' } = {}) {
  // -- what stands against the sky
  const lucht = s('g', { class: 'ls-lucht' },
    // a far tree line
    s('path', { d: `M0 ${H} V114 Q8 104 16 110 Q24 98 34 108 Q44 100 52 109 Q62 102 70 112 Q78 106 86 114 V${H} Z`, class: 'ls-bomen' }),
    // the church: nave and tower with spire
    s('path', { d: `M112 ${H} V100 L128 90 L144 100 V${H} Z`, class: 'ls-gebouw' }),
    s('path', { d: `M144 ${H} V78 H156 V${H} Z M144 78 L150 46 L156 78 Z`, class: 'ls-gebouw' }),
    // houses
    s('path', { d: `M176 ${H} V112 L188 102 L200 112 V${H} Z M204 ${H} V114 L214 106 L224 114 V${H} Z`, class: 'ls-gebouw' }),
    // the mill: body and sails
    s('path', { d: `M270 ${H} L274 96 H286 L290 ${H} Z M272 96 Q280 86 288 96 Z`, class: 'ls-gebouw' }),
    s('path', { d: 'M280 92 L262 70 M280 92 L302 74 M280 92 L298 114 M280 92 L258 110', class: 'ls-wiek' }),
    // a group of trees
    s('path', { d: `M312 ${H} V108 Q314 92 326 94 Q330 82 342 90 Q356 88 356 104 Q360 112 352 116 V${H} Z`, class: 'ls-bomen' }));

  // -- what lies below the horizon and stays
  const vast = s('g', { class: 'ls-vast' },
    s('path', { d: `M0 ${H} H360 V210 H0 Z`, class: 'ls-land' }),
    s('path', { d: `M0 ${H + 18} Q120 ${H + 12} 230 ${H + 20} T360 ${H + 16}`, class: 'ls-sloot' }),
    s('path', { d: `M190 210 Q196 170 214 ${H}`, class: 'ls-weg-rand' }), s('path', { d: `M250 210 Q232 170 220 ${H}`, class: 'ls-weg-rand' }),
    s('path', { d: `M190 210 Q196 170 214 ${H} H220 Q232 170 250 210 Z`, class: 'ls-weg' }),
    [262, 280, 300, 322, 346].map((x, i) => s('path', { d: `M${x} ${H + 30 + i * 9} v-${12 + i * 3}`, class: 'ls-paal' })),
    s('path', { d: `M262 ${H + 21} L346 ${H + 51}`, class: 'ls-draad' }),
    s('path', { d: `M262 ${H + 25} L346 ${H + 58}`, class: 'ls-draad' }),
    s('path', { d: `M170 ${H + 36} v-22 M164 ${H + 14} h14 v8 h-14 z`, class: 'ls-bord' }),
    s('path', { d: `M28 ${H + 4} Q50 ${H + 1} 92 ${H + 6}`, class: 'ls-heg' }));

  // -- what is there only for a moment
  const even = s('g', { class: 'ls-even' },
    s('path', { d: 'M40 30 q8 -12 22 -6 q10 -8 20 2 q12 0 10 10 h-56 q-6 -6 4 -6 z', class: 'ls-wolk' }),
    s('path', { d: 'M226 22 q6 -9 16 -4 q8 -6 15 2 q9 0 7 8 h-42 q-4 -5 4 -6 z', class: 'ls-wolk' }),
    [[58, 168], [98, 176]].map(([x, y]) => s('g', { transform: `translate(${x} ${y})` },
      s('ellipse', { cx: 0, cy: 0, rx: 13, ry: 7, class: 'ls-koe' }), s('circle', { cx: 13, cy: -3, r: 4, class: 'ls-koe' }),
      s('path', { d: 'M-9 5 v7 M-3 5 v7 M5 5 v7 M10 5 v7', class: 'ls-koe-poot' }),
      s('ellipse', { cx: -3, cy: -1, rx: 4, ry: 3, class: 'ls-vlek' }))),
    s('g', { transform: 'translate(226 160)' },
      s('circle', { cx: -8, cy: 8, r: 6, class: 'ls-fiets' }), s('circle', { cx: 8, cy: 8, r: 6, class: 'ls-fiets' }),
      s('path', { d: 'M-8 8 L0 0 L8 8 M0 0 L2 -12', class: 'ls-fiets' }), s('circle', { cx: 2, cy: -16, r: 3.5, class: 'ls-fietser' })),
    s('path', { d: 'M96 40 q4 -4 8 0 q4 -4 8 0 M300 34 q3 -3 6 0 q3 -3 6 0', class: 'ls-vogels' }));

  // -- the numbered points
  const punt = (x, y, n) => s('g', { class: 'ls-punt' }, s('circle', { cx: x, cy: y, r: 7 }), s('text', { x, y: y + 3.5, 'text-anchor': 'middle' }, n));
  const punten = s('g', {}, punt(150, 36, '1'), punt(280, 60, '2'), punt(334, 78, '3'));

  const svg = s('svg', { viewBox: '0 0 360 210', class: 'wn-svg ls-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: 210, class: 'ls-papier' }), vast, even, lucht,
    s('path', { d: `M0 ${H} H360`, class: 'ls-horizon' }), punten);

  const uitleg = h('p', { 'aria-live': 'polite' });
  const tabel = h('table.ls-tabel',
    h('thead', h('tr', h('th', { scope: 'col' }, ''), h('th', { scope: 'col' }, 'Wat'), h('th', { scope: 'col' }, 'Richting'), h('th', { scope: 'col' }, 'Afstand'))),
    h('tbody',
      h('tr', h('th', { scope: 'row' }, '1'), h('td', 'kerktoren'), h('td', '78°'), h('td', '±1,5 km')),
      h('tr', h('th', { scope: 'row' }, '2'), h('td', 'molen'), h('td', '104°'), h('td', '±900 m')),
      h('tr', h('th', { scope: 'row' }, '3'), h('td', 'bosje'), h('td', '115°'), h('td', '±600 m'))));
  const chips = keuze(SOORTEN.map(([k, n]) => [k, n]), soort, zet);
  const el = h('div.wn.doe-landschapsschets',
    h('div.chips', { role: 'group', 'aria-label': 'Soort schets' }, chips), svg, uitleg,
    h('div.tabel-wrap', tabel),
    h('p.doe-stil', 'Zet boven of naast de schets bij elk opvallend punt de kompasrichting en de geschatte afstand. De getallen hier zijn een voorbeeld.'));

  function zet(k) {
    soort = k;
    svg.classList.remove('horizon', 'recognografisch', 'panorama');
    svg.classList.add(k);
    const [, naam, tekst] = SOORTEN.find(([x]) => x === k);
    uitleg.textContent = tekst;
    svg.setAttribute('aria-label', `${naam} van een landschap met een kerktoren, huizen, een molen en bomen. ${tekst}`);
  }

  zet(soort);
  return el;
}
