// Stroomsnelheid: a beek from above with two sticks 10 m apart. Throw in a float, tap Nu! as it passes the first
// stick and again at the second. Ten divided by your seconds is the speed in m/s; do it a few times and take the
// average. The beek keeps its speed until you pick another one, so your measurements can be compared.
import { h } from '../../dom.js';
import { getal, s } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './stroomsnelheid.css';

const [S1, S2] = [90, 290];       // the sticks, 10 m apart
const PXM = (S2 - S1) / 10;       // px per metre
const BEGIN = 20;

export default function stroomsnelheid() {
  let snelheid = 0;               // m/s, the real one
  let start = null;               // when the float was thrown in
  let bij1 = null;                // when you tapped at the first stick
  let frame = 0;
  const metingen = [];

  const drijver = s('g', { class: 'ss-drijver' }, s('circle', { r: 7, class: 'ss-sinaasappel' }), s('path', { d: 'M-1 -7 q2 -4 5 -3', class: 'lijn dun' }));
  const golfjes = s('g', { class: 'ss-golf' }, [0, 1, 2, 3, 4, 5].map((i) => s('path', { d: `M${10 + i * 62} ${86 + (i % 2) * 22} q8 -4 16 0 t16 0`, class: 'lijn dun stil' })));
  const stok = (x, n) => s('g', {}, s('rect', { x: x - 2.5, y: 26, width: 5, height: 22, class: 'stam' }), s('text', { x, y: 20, 'text-anchor': 'middle', class: 'klein' }, n));
  const svg = s('svg', { viewBox: '0 0 360 170', class: 'wn-svg wn-rand ss-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: 170, class: 'gras' }),
    s('path', { d: 'M0 50 Q90 46 180 52 T360 50 V140 Q270 146 180 138 T0 142 Z', class: 'water' }),
    golfjes,
    stok(S1, 'stok 1'), stok(S2, 'stok 2'),
    s('path', { d: `M${S1} 158 H${S2} M${S1} 153 v10 M${S2} 153 v10`, class: 'maat' }),
    s('text', { x: (S1 + S2) / 2, y: 154, 'text-anchor': 'middle', class: 'klein' }, '10 m'),
    s('path', { d: 'M150 66 h40 l-8 -5 m8 5 l-8 5', class: 'lijn stil' }),
    drijver);

  const klok = h('p.wn-groot', '0,0 s');
  const knop = h('button.knop.hoofd.ss-knop', { type: 'button', onclick: tik }, 'Gooi de drijver erin');
  const melding = h('p', { 'aria-live': 'polite' });
  const lijst = h('ul.ss-lijst');
  const el = h('div.wn.doe-stroomsnelheid', svg,
    h('div.wn-rij', knop, klok), melding, lijst,
    h('div.knop-rij', h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Andere beek')));

  function zetDrijver(x) {
    const y = 96 + Math.sin(x / 23) * 6;
    drijver.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  }

  function loop(t) {
    if (!el.isConnected || start == null) return;
    const x = BEGIN + ((t - start) / 1000) * snelheid * PXM;
    zetDrijver(x);
    if (x > 380) {
      start = null;
      knop.textContent = 'Gooi de drijver erin';
      if (bij1 != null) { bij1 = null; melding.textContent = 'Te laat: de drijver is al voorbij stok 2. Gooi hem er nog eens in.'; }
      klok.textContent = '0,0 s';
      return;
    }
    if (bij1 != null) klok.textContent = `${getal((t - bij1) / 1000, 1)} s`;
    frame = requestAnimationFrame(loop);
  }

  function tik() {
    const nu = performance.now();
    if (start == null) {
      start = nu; bij1 = null;
      knop.textContent = 'Nu! (stok 1)';
      melding.textContent = 'Kijk goed: tik als de drijver langs stok 1 komt.';
      frame = requestAnimationFrame(loop);
    } else if (bij1 == null) {
      bij1 = nu;
      knop.textContent = 'Nu! (stok 2)';
      melding.textContent = 'De klok loopt. Tik als hij langs stok 2 komt.';
    } else {
      const sec = (nu - bij1) / 1000;
      bij1 = null; start = null;
      cancelAnimationFrame(frame);
      knop.textContent = 'Gooi de drijver er nog eens in';
      const v = 10 / sec;
      metingen.push(v);
      const gem = metingen.reduce((a, b) => a + b, 0) / metingen.length;
      melding.textContent = `${getal(sec, 1)} seconden over 10 m: 10 ÷ ${getal(sec, 1)} = ${getal(v, 2)} m/s, dat is ${getal(v * 3.6, 1)} km/u. ${metingen.length > 2 ? `Het water stroomt hier echt ${getal(snelheid, 2)} m/s.` : 'Meet een paar keer.'}`;
      lijst.replaceChildren(...metingen.map((m, i) => h('li', `Meting ${i + 1}: ${getal(m, 2)} m/s`)),
        metingen.length > 1 && h('li.ss-gem', `Gemiddeld: ${getal(gem, 2)} m/s`));
    }
  }

  function nieuw() {
    cancelAnimationFrame(frame);
    start = null; bij1 = null; metingen.length = 0;
    snelheid = Math.round((0.3 + Math.random() * 0.9) * 100) / 100;
    knop.textContent = 'Gooi de drijver erin';
    klok.textContent = '0,0 s'; melding.textContent = ''; lijst.replaceChildren();
    zetDrijver(BEGIN);
    svg.setAttribute('aria-label', 'Een beek van bovenaf, met twee stokken langs de oever, 10 meter uit elkaar. Het water stroomt naar rechts.');
  }

  nieuw();
  return el;
}
