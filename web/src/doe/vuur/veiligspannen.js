// Span a rope course: a rope of 10 metres between two anchors with one, two or three scouts of 50 kilo in the
// middle. Slide the doorhang and see how hard the rope pulls at each anchor. A load in the middle of a rope that
// hangs d metres over a span L pulls along the rope with T = (W / 2) / sin(a), sin(a) = d / sqrt(d² + (L/2)²): the
// sum of the blad "Krachten in een strak touw" (sjorren), which gives the same numbers. Rope stretch and people
// spread out are left out: it says so under the picture.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './veilig.css';

const L = 10;                 // metres between the anchors
const SCOUT = 50;             // kilo
const W = 360; const H = 210; // the picture
const AX = 30; const BX = 330; const AY = 60; // the anchors, in px
const PX = (BX - AX) / L;     // px per metre

/** The force in the rope (kg) for a load (kg) in the middle and a doorhang (m). */
export const kracht = (last, doorhang) => (last / 2) * Math.hypot(doorhang, L / 2) / doorhang;

export default function touwbaanSpannen() {
  let doorhang = 1; let mensen = 1;

  const touwRand = s('path', { class: 'vg-touw-rand' });
  const touwLijf = s('path', { class: 'vg-touw' });
  const recht = s('path', { class: 'vg-hulp', d: `M${AX} ${AY}H${BX}` });
  const maat = s('path', { class: 'vg-maat' });
  const pop = s('g');
  const pijlen = s('g');
  const getal = s('text', { class: 'vg-getal', x: W / 2, y: 30, 'text-anchor': 'middle' });
  const svg = s('svg', { class: 'vg-svg', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' },
    s('rect', { class: 'vg-grond', x: 0, y: H - 22, width: W, height: 22 }),
    ...[AX, BX].map((x) => s('rect', { class: 'vg-anker', x: x - 9, y: AY - 22, width: 18, height: H - AY })),
    recht, maat, touwRand, touwLijf, pop, pijlen, getal);

  const uit = h('output.vg-uit', { 'aria-live': 'polite' });
  const schuif = h('input.doe-schuif', { type: 'range', min: '0.1', max: '2', step: '0.05', value: String(doorhang),
    'aria-label': 'Doorhang in meters', oninput: () => { doorhang = Number(schuif.value); teken(); } });
  const waarde = h('strong');
  const chips = keuze([[1, '1 scout'], [2, '2 scouts'], [3, '3 scouts']], mensen, (n) => { mensen = n; teken(); });

  function teken() {
    const last = mensen * SCOUT;
    const t = kracht(last, doorhang);
    const my = AY + doorhang * PX * 0.9 + 4;            // drawn a little less deep, so 2 m still fits
    const d = `M${AX + 9} ${AY}L${W / 2} ${my}L${BX - 9} ${AY}`;
    touwRand.setAttribute('d', d); touwLijf.setAttribute('d', d);
    maat.setAttribute('d', `M${W / 2 - 40} ${AY}V${my}M${W / 2 - 45} ${AY}h10M${W / 2 - 45} ${my}h10`);
    pop.replaceChildren(...Array.from({ length: mensen }, (_, i) => {
      const x = W / 2 + (i - (mensen - 1) / 2) * 16;
      return s('g', { class: 'vg-pop', transform: `translate(${x} ${my})` },
        s('circle', { cx: 0, cy: 12, r: 5 }), s('path', { d: 'M-6 0L0 20L6 0M0 20V38M0 38l-5 14M0 38l5 14' }));
    }));
    // an arrow at each anchor, as long as the force (up to a limit), pointing along the rope into the middle
    const lengte = Math.min(110, 12 + t / 8);
    const hoek = Math.atan2(my - AY, W / 2 - AX);
    pijlen.replaceChildren(...[[AX + 9, 1], [BX - 9, -1]].map(([x, r]) => {
      const ux = r * Math.cos(hoek); const uy = Math.sin(hoek);
      const [bx, by] = [x, AY - 12]; const [ex, ey] = [bx + ux * lengte, by + uy * lengte];
      const punt = (k) => `${ex - ux * 10 - uy * 5 * k} ${ey - uy * 10 + ux * 5 * k}`;
      return s('g', { class: 'vg-pijl' }, s('path', { d: `M${bx} ${by}L${ex - ux * 6} ${ey - uy * 6}` }),
        s('path', { class: 'vg-pijlkop', d: `M${ex} ${ey}L${punt(1)}L${punt(-1)}Z` }));
    }));
    getal.textContent = `± ${(Math.round(t / 5) * 5).toLocaleString('nl-NL')} kg op elk anker`;
    waarde.textContent = `${Math.round(doorhang * 100)} cm`;
    const keer = t / last;
    const kg = (Math.round(t / 5) * 5).toLocaleString('nl-NL');
    const keerTekst = keer < 9.95 ? keer.toFixed(1).replace('.', ',').replace(',0', '') : String(Math.round(keer));
    uit.textContent = `${mensen === 1 ? `1 scout van ${SCOUT} kg` : `${mensen} scouts van ${SCOUT} kg, samen ${last} kg`}, ${Math.round(doorhang * 100)} cm doorhang: `
      + `het touw trekt met ongeveer ${kg} kg aan elk anker. Dat is ${keerTekst} keer het gewicht van wie erop hangt.`;
  }

  teken();
  return h('div.doe-vg',
    svg,
    h('label.doe-label', h('span', 'Doorhang in het midden: ', waarde), schuif),
    h('div.chips', { role: 'group', 'aria-label': 'Hoeveel scouts in het midden' }, chips),
    uit,
    h('p.doe-stil', `Een touw van ${L} meter, de last in het midden. Het is een schatting: in het echt rekt het touw wat uit, lopen mensen niet allemaal in het midden, en komt er bij springen of vallen veel meer kracht op.`));
}
