// Small drawings for the tiles of "Welke sjorring kies je?": only how the poles lie, so you see which connection you
// need, with at most a few plain bands where the lashing sits. No labels and no rope detail; the full drawings of
// each sjorring are in ./sjorren.js. Wood and rope use its classes (./sjorren.css), on a 160 × 120 field like the
// other tiles (./kaart.js).
import { r1, svg } from './basis.js';

const W = 160;
const H = 120;
const DIK = 16;    // a pionierpaal
const LICHT = 10;  // light work: japans and filipijns

const P = (x, y) => `${r1(x)} ${r1(y)}`;

/** A pole from (x1, y1) to (x2, y2), d thick, with one grain line; `kop1`/`kop2` show the sawn end. */
function paal(x1, y1, x2, y2, d = DIK, { kop1 = false, kop2 = false } = {}) {
  const l = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / l; const uy = (y2 - y1) / l;
  const nx = -uy * d / 2; const ny = ux * d / 2;
  let uit = `<path d="M${P(x1 + nx, y1 + ny)}L${P(x2 + nx, y2 + ny)}L${P(x2 - nx, y2 - ny)}L${P(x1 - nx, y1 - ny)}Z" class="sj-hout"/>`;
  uit += `<path d="M${P(x1 + nx * 0.3 + ux * 6, y1 + ny * 0.3 + uy * 6)}L${P(x2 + nx * 0.3 - ux * 6, y2 + ny * 0.3 - uy * 6)}" class="sj-nerf"/>`;
  const hoek = r1((Math.atan2(uy, ux) * 180) / Math.PI);
  const kop = (x, y) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(d * 0.18)}" ry="${r1(d / 2)}" transform="rotate(${hoek} ${P(x, y)})" class="sj-kop"/>`;
  return uit + (kop1 ? kop(x1, y1) : '') + (kop2 ? kop(x2, y2) : '');
}
/** The end of a pole seen from above: the cut with a year ring. */
const kopVanBoven = (cx, cy, r) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" class="sj-kop"/>`
  + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.55)}" class="sj-jaar"/>`;

/** A plain band of rope along a path: one stroke with a dark edge, no core. */
const band = (d, dik = 4.6) => `<path d="${d}" class="sj-touw-rand" stroke-width="${dik}" stroke-linecap="round"/>`
  + `<path d="${d}" class="sj-touw-lijf" stroke-width="${r1(dik - 2.2)}" stroke-linecap="round"/>`;
/** A band straight across from (x1, y1) to (x2, y2). */
const streep = (x1, y1, x2, y2, dik) => band(`M${P(x1, y1)}L${P(x2, y2)}`, dik);
/** Bands round a pole through (cx, cy) in direction `graden`, at distances `afst` along it from that point. */
function omPaal(cx, cy, graden, d, afst, dik) {
  const a = (graden * Math.PI) / 180; const ux = Math.cos(a); const uy = Math.sin(a);
  const h = d / 2 + 1;
  return afst.map((s) => streep(cx + ux * s + uy * h, cy + uy * s - ux * h, cx + ux * s - uy * h, cy + uy * s + ux * h, dik)).join('');
}
/** Bands straight across at heights ys, from x1 to x2 (round several poles at once). */
const dwars = (ys, x1, x2, dik) => ys.map((y) => streep(x1, y, x2, y, dik)).join('');

/** Two poles crossing in the middle: the first (behind) at `achter` degrees, the second (in front) at `voor`;
 *  bands on both sides of the crossing. `half`: on the pole behind only on the upper side (the balk hangs in it). */
function kruising(achter, voor, d, { half = false } = {}) {
  const c = [W / 2, H / 2];
  // as long as fits: the corners of the pole stay just inside the field
  const lengte = (g) => {
    const a = (g * Math.PI) / 180; const co = Math.abs(Math.cos(a)); const si = Math.abs(Math.sin(a));
    return Math.min(co > 0.01 ? (W / 2 - 3 - (d / 2) * si) / co : 999, si > 0.01 ? (H / 2 - 3 - (d / 2) * co) / si : 999);
  };
  const eind = (g, s) => { const a = (g * Math.PI) / 180; const l = lengte(g) * s; return [c[0] + Math.cos(a) * l, c[1] + Math.sin(a) * l]; };
  // how far from the middle a band clears the other pole
  const tussen = Math.abs(Math.sin(((voor - achter) * Math.PI) / 180));
  const vrij = d / 2 / tussen + 3.5;
  const dik = d < DIK ? 3.8 : 4.6;
  const stap = dik + 1.2;
  const beide = [-vrij - stap, -vrij, vrij, vrij + stap];
  let uit = paal(...eind(achter, -1), ...eind(achter, 1), d, { kop1: true });
  // on the pole behind, `achter` points down the picture for a standing pole: negative distances are above
  uit += omPaal(...c, achter, d, half ? [-vrij - stap, -vrij] : beide, dik);
  uit += paal(...eind(voor, -1), ...eind(voor, 1), d, { kop1: true, kop2: true });
  uit += omPaal(...c, voor, d, beide, dik);
  return uit;
}

const kruis = () => svg(W, H, 'Twee palen die haaks kruisen, gesjord op de kruising', kruising(90, 0, DIK));
const halveKruis = () => svg(W, H, 'Een balk haaks aan een staande paal, gesjord alleen boven de balk: de balk hangt erin', kruising(90, 0, DIK, { half: true }));
const japans = () => svg(W, H, 'Twee lichte palen die haaks kruisen, gesjord op de kruising', kruising(90, 0, LICHT));
const diagonaal = () => svg(W, H, 'Twee palen die schuin kruisen, gesjord op de kruising', kruising(62, 14, DIK));
const filipijns = () => svg(W, H, 'Twee lichte palen die schuin kruisen, gesjord op de kruising', kruising(62, 14, LICHT));

/** A narrow scissor: two poles crossing near the top, lashed together just under the crossing. */
function vork() {
  const a = [[46, 116], [94, 6]]; const b = [[114, 116], [66, 6]];
  let uit = paal(...a[0], ...a[1], DIK, { kop2: true }) + paal(...b[0], ...b[1], DIK, { kop2: true });
  // where the poles are at height y: their outer edges, for bands round both
  const x = ([[x1, y1], [x2, y2]], y) => x1 + ((x2 - x1) * (y - y1)) / (y2 - y1);
  for (const y of [42, 48, 54]) uit += streep(x(a, y) - 9.5, y, x(b, y) + 9.5, y);
  return svg(W, H, 'Twee palen als een smalle schaar, een bok, samen gesjord bij de kruising', uit);
}

/** A driepoot: three poles standing, crossing at the top, lashed together there. */
function acht() {
  const d = 14;
  const palen = [[[28, 116], [94, 8]], [[132, 116], [66, 8]], [[80, 118], [80, 6]]];
  let uit = '';
  for (const [[x1, y1], [x2, y2]] of palen) uit += paal(x1, y1, x2, y2, d, { kop2: true });
  uit += dwars([30, 36, 42], 58, 102);
  return svg(W, H, 'Drie palen samen, een driepoot, gesjord waar ze kruisen', uit);
}

/** Four poles together seen from above, the rope round the bundle. */
function polypedestra() {
  const c = [W / 2, H / 2]; const R = 17; const o = 21;
  const palen = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => [c[0] + sx * o, c[1] + sy * o]);
  let uit = '';
  // a band round the outside of all four, as a rounded square
  const s = o + R + 3;
  for (const extra of [0, 5]) {
    const k = s + extra;
    uit += band(`M${P(c[0] - k + 22, c[1] - k)}H${c[0] + k - 22}Q${P(c[0] + k, c[1] - k)} ${P(c[0] + k, c[1] - k + 22)}V${c[1] + k - 22}`
      + `Q${P(c[0] + k, c[1] + k)} ${P(c[0] + k - 22, c[1] + k)}H${c[0] - k + 22}Q${P(c[0] - k, c[1] + k)} ${P(c[0] - k, c[1] + k - 22)}`
      + `V${c[1] - k + 22}Q${P(c[0] - k, c[1] - k)} ${P(c[0] - k + 22, c[1] - k)}Z`, 4.2);
  }
  for (const [x, y] of palen) uit += kopVanBoven(x, y, R);
  return svg(W, H, 'Vier palen samen, van boven gezien, met het touw om het bundel: een veelpoot', uit);
}

/** Two poles in each other's line, with a spalk alongside, lashed in two places. */
function steiger() {
  const x = 72; const sx = x + DIK / 2 + 6;
  let uit = paal(x, 118, x, 61, DIK, { kop2: true }) + paal(x, 59, x, 2, DIK, { kop1: true });
  uit += paal(sx, 22, sx, 98, 12, { kop1: true, kop2: true });
  const l = x - DIK / 2 - 1.5; const r = sx + 7.5;
  uit += dwars([32, 38], l, r) + dwars([82, 88], l, r);
  return svg(W, H, 'Twee palen in elkaars verlengde met een spalk ernaast, op twee plaatsen gesjord', uit);
}

/** Two poles side by side over a length, lashed in two places. */
function rond() {
  const y1 = 50; const y2 = 68;
  let uit = paal(4, y1, 116, y1, DIK, { kop1: true, kop2: true }) + paal(44, y2, 156, y2, DIK, { kop1: true, kop2: true });
  for (const x of [58, 64, 96, 102]) uit += streep(x, y1 - DIK / 2 - 1.5, x, y2 + DIK / 2 + 1.5);
  return svg(W, H, 'Twee palen naast elkaar over een stuk lengte, op twee plaatsen gesjord', uit);
}

/** Two pickets a distance apart, the rope from the head of the front one to the foot of the one behind. */
function slinger() {
  const gy = 90;
  let uit = `<rect x="0" y="${gy}" width="${W}" height="${H - gy}" class="sj-grond"/>`;
  uit += paal(46, 116, 34, 36, 12, { kop2: true }) + paal(122, 116, 110, 36, 12, { kop2: true });
  uit += `<rect x="0" y="${gy}" width="${W}" height="${H - gy}" class="sj-grond-over"/><path d="M0 ${gy}H${W}" class="sj-maaiveld"/>`;
  // a band of three strands from the head of the front picket to the foot of the one behind
  const a = [110, 44]; const b = [44, 84];
  for (const o of [-3.6, 0, 3.6]) uit += streep(a[0], a[1] + o, b[0], b[1] + o, 3.6);
  uit += omPaal(...a, -98, 12, [0], 4) + omPaal(...b, -98, 12, [0], 4);
  return svg(W, H, 'Twee piketten een eind uit elkaar in de grond, met touw ertussen van de kop van de ene naar de voet van de andere', uit);
}

/** A floor of thin poles on a ligger, clamped by a rib over it, the rope round rib and ligger. */
function woel() {
  const ly = 86; const ld = 18; const r = 9; const ry = ly - ld / 2 - 2 * r - 6;
  let uit = paal(4, ly, 156, ly, ld, { kop1: true, kop2: true });
  for (let i = 0; i < 6; i++) uit += kopVanBoven(34 + i * 18.4, ly - ld / 2 - r, r);
  uit += paal(8, ry, 152, ry, 11, { kop1: true, kop2: true });
  // the loop round rib and ligger, just past the floor at both ends
  for (const x of [19, 141]) uit += streep(x - 2.5, ry - 6, x - 2.5, ly + ld / 2 + 1.5) + streep(x + 2.5, ry - 6, x + 2.5, ly + ld / 2 + 1.5);
  return svg(W, H, 'Een vloer van palen op een ligger, met een rib erover, en het touw om rib en ligger', uit);
}

export default {
  'sj-keuze-kruis': kruis,
  'sj-keuze-diagonaal': diagonaal,
  'sj-keuze-vork': vork,
  'sj-keuze-acht': acht,
  'sj-keuze-polypedestra': polypedestra,
  'sj-keuze-steiger': steiger,
  'sj-keuze-rond': rond,
  'sj-keuze-slinger': slinger,
  'sj-keuze-woel': woel,
  'sj-keuze-halve-kruis': halveKruis,
  'sj-keuze-japans': japans,
  'sj-keuze-filipijns': filipijns,
};
