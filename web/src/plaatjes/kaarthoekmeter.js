// The kaarthoekmeter card, as SVG: the drawing on the blad (../plaatjes.js) and the card you lay on the map in the
// piece (../doe/kaarthoekmeter.js) both draw it with this, so they look the same. Everything is in mm on the card;
// U says how many units a mm is. A bank card: 85,6 × 54 mm, two corner scales in the top right, numbered from the
// corner (outside 1:25.000, 1 km = 40 mm; inside 1:50.000, 1 km = 20 mm), a protractor and a cm ruler.

import { r1, tekst } from './basis.js';

export const KAART = [85.6, 54];
/** The corners of the scales on the card, in mm from its top left, and how long a km is there. */
export const HOEK = { 25: { x: 82, y: 4, km: 40 }, 50: { x: 72, y: 16, km: 20 } };

/**
 * The card with its top left corner at (X0, Y0). Classes as in .plaatje (vlak, lijn, tekst, stil, ...). `fijn` adds
 * a tick every 20 m on the 1:25.000 scale, for the piece where the card is large; `doorzicht` is how much of the
 * card's colour covers what lies under it.
 */
export function kaartje(U, X0, Y0, { fijn = false, doorzicht = 0.62 } = {}) {
  const [B, H] = KAART;
  const k = (mx, my) => [r1(X0 + mx * U), r1(Y0 + my * U)];
  const lijn = (a, b, cls) => { const [x1, y1] = k(...a); const [x2, y2] = k(...b); return `<path d="M${x1} ${y1}L${x2} ${y2}" class="${cls}"/>`; };
  const op = (mx, my, t, { maat, ...rest }) => { const [x, y] = k(mx, my); return tekst(x, y, t, { maat: r1(maat * U), ...rest }); };
  const { x: O, y: OY } = HOEK[25]; const { x: I, y: IY } = HOEK[50];

  // clear plastic: what lies under it shows through
  const [cx, cy] = k(0, 0);
  const vorm = `x="${cx}" y="${cy}" width="${r1(B * U)}" height="${r1(H * U)}" rx="${r1(3.2 * U)}"`;
  let uit = `<rect ${vorm} class="vlak" opacity="${doorzicht}"/><rect ${vorm} class="lijn dun stil"/>`;

  // 1:25.000: 100 steps of 10 m on 40 mm, numbered from the corner; ticks hang inwards, the numbers beside them
  uit += lijn([O - 40, OY], [O, OY], 'lijn') + lijn([O, OY], [O, OY + 40], 'lijn');
  for (let v = 0; v <= 100; v++) {
    if (v % 5 && (!fijn || v % 2)) continue;
    const d = v * 0.4; const l = v % 10 ? (v % 5 ? 0.8 : 1.4) : 2.6;
    const cls = v % 5 ? 'lijn haar' : 'lijn dun';
    uit += lijn([O - d, OY], [O - d, OY + l], cls) + lijn([O, OY + d], [O - l, OY + d], cls);
    if (v > 10 && !(v % 10)) uit += op(O - d, OY + 5.5, String(v), { maat: 2.15 });          // 10 would hit the 10 below it
    if (v && !(v % 10)) uit += op(O - 3.2, OY + d + 0.8, String(v), { maat: 2.15, anker: 'end' });
  }
  uit += op(O - 42, OY + 2.6, 'SCHAAL 1:25.000', { maat: 2.25, anker: 'end', klasse: 'vet' });

  // 1:50.000: the same 100 steps on 20 mm, inside the other; ticks point outwards
  uit += lijn([I - 20, IY], [I, IY], 'lijn stil') + lijn([I, IY], [I, IY + 20], 'lijn stil');
  for (let v = 0; v <= 100; v += 5) {
    const d = v * 0.2; const l = v % 10 ? 1 : 1.8;
    uit += lijn([I - d, IY], [I - d, IY - l], 'lijn haar') + lijn([I, IY + d], [I + l, IY + d], 'lijn haar');
    if (v && !(v % 20)) uit += op(I - d, IY - 2.4, String(v), { maat: 1.9, klasse: 'stil' }) + op(I - 0.8, IY + d + 0.7, String(v), { maat: 1.9, anker: 'end', klasse: 'stil' });
  }
  uit += op(I - 22, IY - 0.6, 'SCHAAL 1:50.000', { maat: 2.25, anker: 'end', klasse: 'vet stil' });

  // the protractor: 0 on the left, 180 on the right
  const [gx, gy, gr] = [28, 44.5, 22];
  const boog = (r, a) => [gx - r * Math.cos((a * Math.PI) / 180), gy - r * Math.sin((a * Math.PI) / 180)];
  { const [ax, ay] = k(gx - gr, gy); const [bx, by] = k(gx + gr, gy); uit += `<path d="M${ax} ${ay}A${r1(gr * U)} ${r1(gr * U)} 0 0 1 ${bx} ${by}Z" class="lijn dun"/>`; }
  for (let a = 0; a <= 180; a += 5) uit += lijn(boog(gr, a), boog(gr - (a % 10 ? 1.2 : 2.2), a), 'lijn dun');
  for (let a = 0; a <= 180; a += 30) { const [tx, ty] = boog(gr - 4.6, a); uit += op(tx, ty + 0.9, String(a), { maat: 2 }); }
  uit += lijn([gx, gy - 1.5], [gx, gy], 'lijn dun') + op(gx, gy - 6, 'GRADEN', { maat: 2.25, klasse: 'vet' });

  // the ruler along the bottom edge: 0 to 8 cm
  for (let mm = 0; mm <= 80; mm++) uit += lijn([3 + mm, H], [3 + mm, H - (mm % 10 ? (mm % 5 ? 1.2 : 2) : 3)], mm % 5 ? 'lijn haar' : 'lijn dun');
  for (let c = 0; c <= 8; c++) uit += op(3 + c * 10, H - 3.8, String(c), { maat: 2.15 });
  uit += op(5.4, H - 3.8, 'CM', { maat: 1.55, anker: 'start', klasse: 'vet' });
  return uit;
}
