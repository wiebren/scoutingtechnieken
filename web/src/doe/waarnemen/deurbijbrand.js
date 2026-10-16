// Een deur openen bij brand: the steps of the door procedure, one picture per step, with the shared step control.
// After the deurprocedure of BHV.nl (look, feel with the back of your hand, get low, open a crack, call, close) and
// brandweer.nl (a warm handle: a flash of fire when you open; keep doors shut behind you; stay low in smoke).
import { h } from '../../dom.js';
import { stappenBalk } from '../stappen.js';
import { s } from './hulp.js';
import './wn.css';
import './deurbijbrand.css';

const STAPPEN = [
  { kort: 'Kijk', tekst: 'Kijk eerst, zonder de deur aan te raken. Komt er rook langs de randen of onder de deur door? Dan blijft hij dicht.' },
  { kort: 'Voel', tekst: 'Voel met de rug van je hand aan de deur, van boven naar beneden en langs de randen, en aan de klink. Is iets warm? Laat de deur dicht: daarachter brandt het.' },
  { kort: 'Laag', tekst: 'Alles koud? Ga laag zitten, naast de deur, met je gezicht ervan af. Draait de deur naar je toe, zet dan je voet ertegen. Dan zwaait hij niet ineens open.' },
  { kort: 'Kier', tekst: 'Doe de deur een klein stukje open en wacht even. Kijk eerst boven bij de deur, dan laag de ruimte in. Zie je rook of vlammen? Meteen dicht.' },
  { kort: 'Roep', tekst: 'Roep: „Is daar iemand?” Hoor je niets, doe de deur dan weer dicht. Ga nooit een ruimte met rook in.' },
  { kort: 'Dicht', tekst: 'Deur dicht, en naar buiten. Doe alle deuren achter je dicht. Zeg tegen de leiding of de brandweer wie er misschien nog binnen is.' },
];

const VLOER = 182;
const [DL, DR, DT] = [120, 196, 52];   // the door frame: left, right, top

/** A scout standing at x, seen from the front. */
const staand = (x) => s('g', { class: 'bd-lijf' },
  s('path', { d: `M${x} 86 V134 M${x} 134 L${x - 9} ${VLOER} M${x} 134 L${x + 9} ${VLOER} M${x} 94 L${x + 12} 124` }),
  s('circle', { cx: x, cy: 74, r: 10, class: 'huid' }));

/** A scout crouching to the right of the door, one hand on the handle (at klinkX), a foot against the door. */
const gehurkt = (klinkX) => s('g', { class: 'bd-lijf' },
  s('path', { d: `M236 146 L246 170 L232 ${VLOER} M246 170 L216 176 L200 ${VLOER - 2} M238 152 L${klinkX + 4} 126` }),
  s('circle', { cx: 232, cy: 136, r: 10, class: 'huid' }),
  s('path', { d: 'M241 134 h3', class: 'lijn dun' }));   // looking away from the door

function tekening(stap) {
  const delen = [s('rect', { x: 0, y: 0, width: 320, height: VLOER, class: 'bd-muur' }), s('rect', { x: 0, y: VLOER, width: 320, height: 18, class: 'bd-vloer' })];
  const open = stap === 3 || stap === 4;
  delen.push(s('rect', { x: DL, y: DT, width: DR - DL, height: VLOER - DT, class: 'bd-donker' }));
  if (open) {
    delen.push(s('path', { d: `M${DL} ${DT} L${DR - 18} ${DT - 5} L${DR - 18} ${VLOER + 5} L${DL} ${VLOER} Z`, class: 'bd-deur' }));
    delen.push(s('circle', { cx: DR - 26, cy: 124, r: 3.5, class: 'bd-klink' }));
  } else {
    delen.push(s('rect', { x: DL, y: DT, width: DR - DL, height: VLOER - DT, class: 'bd-deur' }));
    delen.push(s('circle', { cx: DR - 10, cy: 124, r: 3.5, class: 'bd-klink' }));
  }
  delen.push(s('path', { d: `M${DL + 2} 70 h5 M${DL + 2} 160 h5`, class: 'lijn' }));   // hinges

  if (stap === 0) {
    delen.push(s('rect', { x: DL - 5, y: DT - 5, width: DR - DL + 10, height: VLOER - DT + 5, class: 'zicht', rx: 3 }));
    delen.push(staand(262));
    delen.push(s('text', { x: 158, y: 30, 'text-anchor': 'middle', class: 'klein' }, 'rook langs de randen?'));
  }
  if (stap === 1) {
    delen.push(s('g', { class: 'bd-lijf' }, s('path', { d: 'M232 86 V134 M232 134 L223 182 M232 134 L241 182 M232 94 L190 64' }), s('circle', { cx: 232, cy: 74, r: 10, class: 'huid' })));
    delen.push(s('circle', { cx: 188, cy: 63, r: 5, class: 'huid bd-hand' }));
    delen.push(s('path', { d: `M178 70 V160 m-5 -8 l5 8 l5 -8`, class: 'zicht' }));
    delen.push(s('circle', { cx: DR - 10, cy: 124, r: 9, class: 'zicht' }));
    delen.push(s('text', { x: 158, y: 30, 'text-anchor': 'middle', class: 'klein' }, 'met de rug van je hand'));
  }
  if (stap >= 2 && stap <= 4) delen.push(gehurkt(open ? DR - 26 : DR - 10));
  if (open) {
    delen.push(s('path', { d: 'M224 132 L186 56 M224 134 L186 170', class: 'zicht' }));
    delen.push(s('text', { x: 254, y: 40, 'text-anchor': 'middle', class: 'klein' }, stap === 3 ? 'eerst boven, dan laag' : ''));
  }
  if (stap === 2) delen.push(s('text', { x: 262, y: 110, 'text-anchor': 'middle', class: 'klein' }, 'voet ertegen'));
  if (stap === 4) {
    delen.push(s('path', { d: 'M214 24 h96 v30 h-56 l-12 12 l2 -12 h-30 z', class: 'bd-ballon' }));
    delen.push(s('text', { x: 262, y: 44, 'text-anchor': 'middle', class: 'klein' }, 'Is daar iemand?'));
  }
  if (stap === 5) {
    delen.push(staand(268));
    delen.push(s('path', { d: 'M282 118 h24 m-6 -6 l6 6 l-6 6', class: 'lijn' }));
    delen.push(s('rect', { x: 270, y: 14, width: 40, height: 18, rx: 2, class: 'bd-nood' }));
    delen.push(s('path', { d: 'M280 23 h18 m-5 -5 l5 5 l-5 5', class: 'bd-pijl' }));
    delen.push(s('text', { x: 158, y: 40, 'text-anchor': 'middle', class: 'klein' }, 'deur dicht'));
    delen.push(s('text', { x: 290, y: 46, 'text-anchor': 'middle', class: 'klein' }, 'naar buiten'));
  }
  return delen;
}

export default function deurBijBrand() {
  const svg = s('svg', { viewBox: '0 0 320 200', class: 'wn-svg wn-rand bd-svg', role: 'img', 'aria-label': 'Een deur in een gang, en een scout die hem veilig opent.' });
  const uitleg = h('p.bd-uitleg', { 'aria-live': 'polite' });
  const balk = stappenBalk({ stappen: STAPPEN.map((x) => x.kort), label: 'Een deur openen bij brand, stap voor stap', zet: (v) => toon(Math.round(v)) });
  const el = h('div.wn.doe-deurbijbrand', svg, balk.el, uitleg);

  function toon(stap) {
    svg.replaceChildren(...tekening(stap));
    uitleg.textContent = `${stap + 1}. ${STAPPEN[stap].tekst}`;
  }

  toon(0);
  return el;
}
