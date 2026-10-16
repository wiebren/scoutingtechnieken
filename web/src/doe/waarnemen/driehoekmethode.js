// Driehoekmethode, seen from above: a tree A across the river, stick B opposite it, C 40 passen along the bank, D
// half as far again. Walk from D away from the river (drag yourself, or use the arrow keys) until C and A are in one
// line. Then D to E is half of B to A. With "CD even lang" D is as far from C as B is, and DE is AB itself.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { getal, s, sleep, tussen } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './driehoekmethode.css';

const K = 3;                    // px per metre
const PAS = 0.75;               // metres in one pas
const BC = 40;                  // passen from B to C
const OEVER = 150;              // y of the near bank
const Y0 = OEVER + 6;           // y of the sticks B, C and D
const BX = 60;

export default function driehoekmethode() {
  let breed = 0;                // the river, in metres
  let deel = 0.5;               // CD as a part of BC
  let passen = 0;               // from D to E

  const xC = BX + BC * PAS * K;
  const xD = () => xC + BC * deel * PAS * K;
  const yA = () => Y0 - breed * K;
  const yE = () => Y0 + passen * PAS * K;
  const nodig = () => breed * deel / PAS;            // passen from D to E when it lines up

  const water = s('rect', { x: 0, width: 360, class: 'water' });
  const overkant = s('rect', { x: 0, y: 0, width: 360, class: 'gras' });
  const boom = s('g', {}, s('circle', { r: 11, class: 'kruin' }), s('circle', { r: 3, class: 'stam' }));
  const labelA = s('text', { class: 'dm-label' }, 'A');
  const lijnBA = s('path', { class: 'lijn dun stil', 'stroke-dasharray': '3 3' });
  const lijnBD = s('path', { class: 'lijn dun stil' });
  const lijnDE = s('path', { class: 'maat' });
  const zicht = s('path', { class: 'zicht' });
  const stok = (naam) => { const g = s('g', {}, s('circle', { r: 4, class: 'inkt' }), s('text', { x: -14, y: -7, class: 'dm-label' }, naam)); return g; };
  const [stokB, stokC, stokD] = [stok('B'), stok('C'), stok('D')];
  const ik = s('g', { class: 'dm-ik' }, s('circle', { r: 16, class: 'greep' }), s('circle', { r: 5, class: 'accent' }), s('text', { x: 20, y: 4, class: 'dm-label' }, 'E (jij)'));
  const telTekst = s('text', { class: 'klein' });
  const svg = s('svg', { viewBox: '0 0 360 300', class: 'wn-svg wn-rand dm-svg', role: 'slider', tabindex: '0',
    'aria-label': 'Jij bij E. Sleep jezelf van de oever weg, of gebruik de pijltjes omhoog en omlaag.', 'aria-valuemin': '0', 'aria-valuemax': '60' },
    s('rect', { x: 0, y: 0, width: 360, height: 300, class: 'gras' }), overkant, water, lijnBA, lijnBD, lijnDE, zicht, boom, labelA, stokB, stokC, stokD, telTekst, ik);

  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const uitkomst = h('p', { 'aria-live': 'polite' });
  const deelChips = keuze([[0.5, 'CD half zo lang'], [1, 'CD even lang']], deel, (d) => { deel = d; passen = 3; uitkomst.textContent = ''; teken(); });

  const el = h('div.wn.naast.doe-driehoekmethode', svg,
    h('div.wn-tekst',
      h('p', `B staat recht tegenover boom A. Van B naar C is ${BC} passen langs de oever, en dan nog een stuk naar D. Loop van D haaks van de oever weg, tot je C en A precies achter elkaar ziet.`),
      h('div.chips', { role: 'group', 'aria-label': 'Hoe ver is D van C?' }, deelChips),
      melding, uitkomst,
      h('div.knop-rij',
        h('button.knop.hoofd.klein', { type: 'button', onclick: reken }, 'Reken uit'),
        h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Andere rivier')),
      h('p.doe-stil', `Eén pas is hier ${getal(PAS * 100)} cm.`)));

  function zet(p) {
    passen = Math.max(0, Math.min(60, Math.round(p)));
    uitkomst.textContent = '';
    teken();
  }

  function teken() {
    const [ax, ay] = [BX, yA()]; const dx = xD(); const ey = yE();
    overkant.setAttribute('height', ay + 4);
    water.setAttribute('y', ay + 4); water.setAttribute('height', OEVER - ay - 4);
    boom.setAttribute('transform', `translate(${ax} ${ay})`);
    labelA.setAttribute('x', ax + 14); labelA.setAttribute('y', ay - 12);
    stokB.setAttribute('transform', `translate(${BX} ${Y0})`);
    stokC.setAttribute('transform', `translate(${xC} ${Y0})`);
    stokD.setAttribute('transform', `translate(${dx} ${Y0})`);
    lijnBA.setAttribute('d', `M${BX} ${Y0} L${ax} ${ay}`);
    lijnBD.setAttribute('d', `M${BX} ${Y0} H${dx}`);
    lijnDE.setAttribute('d', `M${dx} ${Y0} V${ey}`);
    ik.setAttribute('transform', `translate(${dx} ${ey})`);
    // the line from E through C, on to the far bank
    const t = passen ? (ay - ey) / (Y0 - ey) : 0;
    const xVer = dx + (xC - dx) * t;
    zicht.setAttribute('d', passen ? `M${dx} ${ey} L${xVer.toFixed(1)} ${ay}` : '');
    const mis = xVer - ax;                                 // how far beside the tree the line ends, px
    const raak = Math.abs(passen - nodig()) <= 0.5;
    zicht.classList.toggle('rood', !raak);
    telTekst.setAttribute('x', dx + 8); telTekst.setAttribute('y', (Y0 + ey) / 2 + 4);
    telTekst.textContent = passen ? `${passen} p.` : '';
    svg.setAttribute('aria-valuenow', String(passen));
    svg.setAttribute('aria-valuetext', `${passen} passen van D`);
    melding.classList.toggle('fout', !raak && passen > 0);
    melding.textContent = passen === 0 ? 'Sleep jezelf (E) van de oever weg.'
      : raak ? `C en A staan op één lijn. Van D naar E is ${passen} passen.`
        : `Nog niet: je ziet C ${mis > 0 ? 'rechts' : 'links'} van de boom. ${mis > 0 ? 'Loop terug naar de oever.' : 'Loop verder van de oever.'}`;
  }

  function reken() {
    if (Math.abs(passen - nodig()) > 0.5) { uitkomst.textContent = 'Zet eerst C en A op één lijn.'; return; }
    const ab = passen / deel;
    uitkomst.textContent = deel === 1
      ? `DE is even lang als AB: ${passen} passen, dus ${getal(passen * PAS, 1)} m. De rivier is ${getal(breed, 1)} m breed.`
      : `AB is twee keer DE: 2 × ${passen} = ${getal(ab)} passen, dus ${getal(ab * PAS, 1)} m. De rivier is ${getal(breed, 1)} m breed.`;
  }

  function nieuw() {
    breed = tussen(10, 26) * 1.5;
    passen = 3; uitkomst.textContent = '';
    teken();
  }

  sleep(svg, svg, ({ y }) => zet((y - Y0) / (PAS * K)));
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, PageDown: 5, PageUp: -5 }[e.key];
    if (d) { e.preventDefault(); zet(passen + d); }
  });

  nieuw();
  return el;
}
