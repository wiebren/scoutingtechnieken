// The compasses of the kompas3d pieces as SVG, drawn around the middle of the housing so kijker.js can turn the
// scale (rotate(-huis)) and the needle on their own:
// - the spiegelpeilkompas as you hold it: the near end with the sight notch, and under it the mirror with the housing
//   in it (display only: you cannot turn a housing in a mirror);
// - the open compass seen from above, the control: the box, the slide with the housing ring, whose ribbed edge sticks
//   out at both sides of the slide, where your thumb turns it (seen through the slide's walls);
// - the plaatkompas held flat in front of you, seen from above, turned on the housing itself.
//
// The mirror view (matchbox compass, Recta DP / Suunto MB-6 type). You see the ring itself (the scale on the turning
// ring), not numbers on glass. The mirror under the housing shows its underside, and the mirror reverses that once
// more, so the scale reads normally, runs clockwise, and the side of the target (with the index) is at the top - as
// the ring seen from above. Recta's handbook says so for the DP compasses ("Met de onderliggende spiegel (geen
// spiegelbeeld!)", Recta compass handbook p. 20); Suunto's manual draws the mirror view that way (SU-MB §5). You look
// into the mirror at an angle, so the ring is drawn squashed (cos 45° ≈ 0.7 high), as the user asked. The scale:
// steps of 2°, a number every 20° in tens (2 = 20°) [SU-TAC].
import { s, pol, p } from '../kompasdelen.js';

const R_BUITEN = 96;         // the ring
const R_RING = 74;           // its inner edge: the liquid inside
const R_RIB = 103;           // the ribbed edge round it (spiegelpeilkompas)
const PLAT = 0.7;            // the mirror is seen at about 45°: the ring looks this much lower than wide

/**
 * The turning part of a housing round cx, cy: the ring with its scale, the liquid, the orientation lines, and what the
 * needle goes into. 'spiegel': ticks on the inner edge, numbers in tens every 20°, two marks for the needle.
 * 'plaat': ticks on the outer edge, numbers every 30° with N O Z W (as the app's own plaatkompas), an orientation arrow.
 */
function schaal(cx, cy, soort) {
  const plaat = soort === 'plaat';
  const ring = s('g', { class: 'k3-ring' });
  if (!plaat) {
    // the ribbed edge of the ring (the spiegelpeilkompas): the grip your thumb turns
    ring.append(s('circle', { cx, cy, r: R_RIB, class: 'k3-rib-vlak' }));
    for (let g = 0; g < 360; g += 3) {
      const [x1, y1] = pol(cx, cy, R_RIB, g); const [x2, y2] = pol(cx, cy, R_BUITEN - 1, g);
      ring.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: 'k3-rib' }));
    }
  }
  ring.append(s('circle', { cx, cy, r: R_BUITEN - 1, class: 'k3-ring-vlak' }));
  for (let g = 0; g < 360; g += 2) {
    const lang = g % 10 ? 3.5 : g % (plaat ? 30 : 20) ? 6 : 8;
    const [ra, rb] = plaat ? [R_BUITEN - 1, R_BUITEN - 1 - lang] : [R_RING, R_RING + lang];
    const [x1, y1] = pol(cx, cy, ra, g); const [x2, y2] = pol(cx, cy, rb, g);
    ring.append(s('path', { d: `M${p(x1)} ${p(y1)}L${p(x2)} ${p(y2)}`, class: g % 10 ? 'k3-streep dun' : 'k3-streep' }));
  }
  const stap = plaat ? 30 : 20;
  for (let g = 0; g < 360; g += stap) {
    const [x, y] = pol(cx, cy, plaat ? R_RING + 8 : 86, g);
    const letter = plaat ? { 0: 'N', 90: 'O', 180: 'Z', 270: 'W' }[g] : g ? null : 'N';
    const tekst = letter ?? String(plaat ? g : g / 10);
    ring.append(s('text', { x: p(x), y: p(y), class: letter ? 'k3-getal k3-n' : plaat ? 'k3-getal klein' : 'k3-getal',
      'text-anchor': 'middle', 'dominant-baseline': 'central', transform: `rotate(${g} ${p(x)} ${p(y)})` }, tekst));
  }
  ring.append(s('circle', { cx, cy, r: R_RING, class: 'k3-vloeistof' }));
  for (const dx of [-48, -32, -16, 16, 32, 48]) {
    const dy = Math.sqrt(R_RING * R_RING - dx * dx) - 4;
    ring.append(s('path', { d: `M${cx + dx} ${p(cy - dy)}V${p(cy + dy)}`, class: 'k3-lijn' }));
  }
  ring.append(plaat
    ? s('path', { d: `M${cx - 10} ${cy - 38}L${cx} ${cy - 66}L${cx + 10} ${cy - 38}M${cx - 10} ${cy - 38}V${cy + 44}M${cx + 10} ${cy - 38}V${cy + 44}`, class: 'k3-orientatiepijl' })
    : s('path', { d: `M${cx - 8} ${cy - 64}V${cy - 46}M${cx + 8} ${cy - 64}V${cy - 46}`, class: 'k3-huisje' }));
  return ring;
}

function maakNaald(cx, cy) {
  return s('g', { class: 'k3-naald' },
    s('path', { d: `M${cx} ${cy - 64}L${cx + 5} ${cy}L${cx - 5} ${cy}Z`, class: 'k3-naald-noord' }),
    s('path', { d: `M${cx} ${cy + 64}L${cx + 5} ${cy}L${cx - 5} ${cy}Z`, class: 'k3-naald-zuid' }),
    s('circle', { cx, cy, r: 3.2, class: 'k3-as' }));
}

/** The end of the spiegelpeilkompas nearest you, seen from behind: the sight notch in its top edge (at y = 14). */
export function tekenEindplaat() {
  return s('svg', { viewBox: '0 0 240 50', class: 'k3-eindplaat', 'aria-hidden': 'true' },
    s('path', { d: 'M8 6Q8 2 12 2H110V14H130V2H228Q232 2 232 6V50H8Z', class: 'k3-plaat-vlak' }),
    s('path', { d: 'M110 2V14H130V2', class: 'k3-plaat-rand' }),
    s('circle', { cx: 120, cy: 31, r: 3.5, class: 'k3-plaat-punt' }));
}

/** The mirror with the housing in it, as you see it (240 × 196, housing round 120, 98, squashed to PLAT high). */
export function tekenSpiegel(id) {
  const cx = 120; const cy = 98;
  const ring = schaal(cx, cy, 'spiegel'); const naald = maakNaald(cx, cy);
  const svg = s('svg', { viewBox: '0 0 240 196', class: 'k3-spiegel', role: 'img' },
    s('defs', {},
      s('clipPath', { id: `${id}-glas` }, s('rect', { x: 20, y: 6, width: 200, height: 184, rx: 5 })),
      s('linearGradient', { id: `${id}-glans`, x1: 0, y1: 0, x2: 1, y2: 1 },
        s('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.28' }),
        s('stop', { offset: '0.45', 'stop-color': '#ffffff', 'stop-opacity': '0' }),
        s('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0.12' }))),
    s('rect', { x: 12, y: 0, width: 216, height: 196, rx: 10, class: 'k3-spiegel-rand' }),
    s('rect', { x: 20, y: 6, width: 200, height: 184, rx: 5, class: 'k3-glas' }),
    s('g', { 'clip-path': `url(#${id}-glas)` },
      // the housing, seen at an angle: squashed top to bottom round its middle
      s('g', { transform: `translate(0 ${cy}) scale(1 ${PLAT}) translate(0 ${-cy})` },
        ring, naald,
        // the bearing index, fixed to the frame, at the top: the side of your target
        s('path', { d: `M${cx} ${cy - R_RING + 1}l-5 9h10z`, class: 'k3-index' })),
      s('path', { d: `M${cx} 6V190`, class: 'k3-middenlijn' }),
      s('rect', { x: 20, y: 6, width: 200, height: 184, fill: `url(#${id}-glans)` })));
  return { svg, ring, naald, cx, cy };
}

/**
 * The open spiegelpeilkompas seen from above, the control (230 × 300): the box far away (at the top), the slide
 * towards you with the housing in it, the end with the sight notch nearest you. The housing ring is the same ring as
 * in the mirror (with the scale as seen from above); its ribbed edge sticks out at both sides of the slide, and is
 * seen through the slide's walls. Pushing the ribs on the right away from you brings a higher number to the index.
 */
export function tekenDoosje() {
  const cx = 115; const cy = 182; const k = 0.8;           // the ring at 80%
  const ring = schaal(0, 0, 'spiegel');
  const draai = s('g', {}, ring);                         // kijker.js turns `ring` round 0, 0
  const svg = s('svg', { viewBox: '0 0 230 300', class: 'k3-doosje k3-draaibaar', role: 'slider', tabindex: '0',
    'aria-valuemin': '0', 'aria-valuemax': '359',
    'aria-label': 'Het kompas van bovenaf: het huis met de geribbelde rand. Sleep langs de rand of gebruik pijltjes links en rechts om het huis te draaien. In de spiegel draait het mee.' },
    // the box (far) and the floor of the slide
    s('rect', { x: 34, y: 4, width: 162, height: 92, rx: 7, class: 'k3-doos' }),
    s('path', { d: 'M115 10V90', class: 'k3-doos-lijn' }),
    s('rect', { x: 44, y: 92, width: 142, height: 196, rx: 6, class: 'k3-schuif' }),
    s('g', { transform: `translate(${cx} ${cy}) scale(${k})` }, draai,
      // the middle covered: here you turn, you read in the mirror
      s('circle', { r: R_RING - 2, class: 'k3-doos-midden' }),
      s('path', { d: 'M-26 -8A27 27 0 0 1 18 -20M26 8A27 27 0 0 1 -18 20M18 -20l-9 -2.5M18 -20l-1.5 9M-18 20l9 2.5M-18 20l1.5 -9', class: 'k3-doos-pijl' }),
      s('path', { d: `M0 ${-R_RING + 1}l-5 9h10z`, class: 'k3-index' })),
    // the walls of the slide, see-through: the ribbed edge shows through them and sticks out beside them
    s('rect', { x: 44, y: 92, width: 12, height: 196, rx: 3, class: 'k3-wand' }),
    s('rect', { x: 174, y: 92, width: 12, height: 196, rx: 3, class: 'k3-wand' }),
    // the near end, with the sight notch
    s('path', { d: 'M44 278H106V284H124V278H186V292Q186 296 182 296H48Q44 296 44 292Z', class: 'k3-eind' }));
  return { svg, ring, cx: 0, cy: 0, draaiMidden: { cx, cy }, vak: [0, 0, 230, 300] };
}

/** The plaatkompas held flat in front of you, seen from above (240 × 330, housing round 120, 172). The control too. */
export function tekenPlaatkompas() {
  const cx = 120; const cy = 172;
  const ring = schaal(cx, cy, 'plaat'); const naald = maakNaald(cx, cy);
  const liniaal = [];
  for (let i = 0; i <= 20; i++) liniaal.push(`M24 ${206 + i * 6}h${i % 5 ? 5 : 9}`);
  const svg = s('svg', { viewBox: '0 0 240 330', class: 'k3-plaatkompas k3-draaibaar', role: 'slider', tabindex: '0',
    'aria-valuemin': '0', 'aria-valuemax': '359',
    'aria-label': 'Het kompas, plat in je hand. Sleep rond of gebruik pijltjes links en rechts om het huis te draaien.' },
    s('rect', { x: 22, y: 0, width: 196, height: 328, rx: 16, class: 'k3-plaatglas' }),
    s('path', { d: liniaal.join(''), class: 'k3-liniaal' }),
    // the direction arrow: you look along it to the target
    s('path', { d: 'M120 4L139 36H127V66H113V36H101Z', class: 'k3-richting' }),
    s('circle', { cx, cy, r: R_BUITEN + 3, class: 'k3-kapsel' }),
    ring, naald,
    // the index (leeslijn) on the plate, where the direction arrow meets the housing
    s('path', { d: `M${cx} 66V${cy - R_BUITEN + 7}`, class: 'k3-index-lijn' }));
  return { svg, ring, naald, cx, cy, vak: [0, 0, 240, 330] };
}
