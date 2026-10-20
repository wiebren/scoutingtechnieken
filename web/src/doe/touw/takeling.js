// A takeling, step by step (./speler.js): the loop of twine laid on the rope, the turns wound from the end to the
// loop, the tip of the twine through the loop, the loop pulled half way under the turns, the ends cut off. Drawn with
// the rope and twine of the drawings in ../../plaatjes/touw.js; the blad has no drawing of its own.
import { geslagen, stukTouw } from '../../plaatjes/touw.js';
import { speler } from './speler.js';

const W = 300; const H = 176;
const BOVEN = 79; const ONDER = 113;           // the rope (geslagen(8, 250, 96, 34)): top and bottom
const SLAGEN = 10; const STAP = 4.4;           // the turns, from x 234 (at the end) to the left
const slagX = (i) => 234 - i * STAP;
const LINKS = slagX(SLAGEN - 1) - STAP / 2;    // the left edge of the turns
const TIP = 168;                               // the tip of the loop, before it is pulled
const TREK = 48;                               // how far the loop goes under the turns

const STAPPEN = ['Lus', 'Wikkelen', 'Door de lus', 'Aantrekken', 'Afknippen'];
const TEKST = [
  'Stap 1: leg een lus van het garen in de lengte op het touw, vlak bij het eind. De lus wijst van het eind af; het korte eindje wijst naar het eind.',
  'Stap 2: wikkel het lange stuk garen strak om het touw en over de lus heen. Begin bij het eind en wikkel naar de lus toe, tot de wikkeling zo breed is als het touw dik is. Het puntje van de lus blijft vrij.',
  'Stap 3: steek het garen door de lus.',
  'Stap 4: trek aan het korte eindje. De lus trekt het garen mee, tot halverwege onder de wikkeling.',
  'Stap 5: knip de eindjes af, vlak bij de wikkeling. Klaar.',
];

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const zacht = (x) => x * x * (3 - 2 * x);
const tussen = (a, b, f) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * f, p[1] + (b[i][1] - p[1]) * f]);
const schuif = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);

/** A polyline cut off after length l. */
function tot(pts, l) {
  const uit = [pts[0]];
  for (let i = 1; i < pts.length && l > 0; i++) {
    const [ax, ay] = pts[i - 1]; const [bx, by] = pts[i]; const d = Math.hypot(bx - ax, by - ay);
    if (d <= l) { uit.push(pts[i]); l -= d; continue; }
    uit.push([ax + ((bx - ax) * l) / d, ay + ((by - ay) * l) / d]); l = 0;
  }
  return uit;
}
/** A polyline from length l on (the rest of what tot() cut off). */
function vanaf(pts, l) {
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]; const [bx, by] = pts[i]; const d = Math.hypot(bx - ax, by - ay);
    if (d < l) { l -= d; continue; }
    return [[ax + ((bx - ax) * l) / d, ay + ((by - ay) * l) / d], ...pts.slice(i)];
  }
  return [];
}
/** A piece cut off: at f = 0 where it was; then it drops away, turning a little and fading. */
const valt = (pts, f, draai) => {
  if (pts.length < 2 || f >= 1) return '';
  const [x, y] = pts[0];
  return `<g transform="translate(0 ${r(140 * f * f)}) rotate(${r(draai * f)} ${r(x)} ${r(y)})" opacity="${r(1 - f * f)}">${stukTouw(pts, 'garen', 4.4)}</g>`;
};
const r = (n) => Math.round(n * 10) / 10;
const STOMP = 2.5;                             // what is left of an end after cutting
const lengte = (pts) => pts.slice(1).reduce((som, p, i) => som + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
/** The length of a polyline that runs to the left, up to the left edge of the turns. */
function totRand(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]; const [bx, by] = pts[i]; const d = Math.hypot(bx - ax, by - ay);
    if (bx >= LINKS) { l += d; continue; }
    return l + (ax > LINKS ? (d * (ax - LINKS)) / (ax - bx) : 0);
  }
  return l;
}

// The short end hangs down past the end of the rope; pulling it brings more of it out.
const KORT = [[236, 90], [250, 90], [262, 96], [268, 114], [269, 140], [268, 172]];
// The long end, after the last turn: free above the rope; then its tip is brought to the loop (HAAK) and pulled
// through it, until the twine runs straight from the turns into the loop (STRAK) and on under the loop (DOORHEEN).
const VRIJ = [[192, BOVEN], [188, 62], [172, 44], [146, 32], [122, 28], [100, 27], [90, 27], [80, 27]];
const HAAK = [[192, BOVEN], [190, 60], [178, 40], [160, 34], [146, 42], [148, 62], [164, 80], [183, 90]];
const STRAK = [[192, BOVEN], [191, 80], [190, 82], [189, 84], [188, 86], [186, 88], [185, 89], [183, 90]];
const DOORHEEN = [[178, 97], [172, 105], [150, 108], [122, 110], [96, 116], [70, 122], [44, 128]];
const LANG = lengte(VRIJ);
const HAAKT = 0.45;                            // the part of step 3 that brings the tip to the loop

/** The drawing at place w on the stappenbalk (0 = step 1 done ... 4 = step 5 done). */
export function tekening(w) {
  const wikkel = klem(w);
  const door = zacht(klem(w - 1));
  const trek = zacht(klem(w - 2)) * TREK;
  const knip = klem(w - 3);
  const val = klem((knip - 0.2) / 0.8);         // first the cut, then the piece drops
  const n = Math.round(wikkel * SLAGEN);

  let uit = geslagen(8, 250, 96, 34, 'a');

  // the long end: free while winding, then its tip through the loop; pulled along with the loop. `voor` lies on top
  // of the loop, `achter` (what has gone through) under it.
  let voor; let achter = [];
  if (n === 0) voor = [[240, 102], [247, 96], [246, 76], [234, 54], [210, 38], [182, 30], [160, 28]];
  else if (w <= 1) voor = schuif(VRIJ, slagX(n - 1) - STAP - 192);
  else if (door < HAAKT) voor = tussen(VRIJ, HAAK, door / HAAKT);
  else {
    const heen = tussen(HAAK, STRAK, (door - HAAKT) / (1 - HAAKT));
    const rest = LANG - lengte(heen);
    voor = rest > 0 ? heen : tot(heen, LANG);
    if (rest > 0.5) achter = tot([heen.at(-1), ...DOORHEEN], rest);
    // pulled under the turns, it runs from the last turn along the middle of the rope to the loop, which moves the most
    voor = voor.map(([x, y], i, al) => [x + trek * (i / (al.length - 1)), y + (92 - y) * (trek / TREK) * Math.min(1, i)]);
    achter = schuif(achter, trek);
  }
  // cut just outside the turns: a small stub stays, the rest drops
  let los = '';
  if (knip > 0 && achter.length > 1) {
    const hier = totRand(achter) + STOMP;
    los += valt(vanaf(achter, hier), val, -14);
    achter = tot(achter, hier);
  }
  if (achter.length > 1 && lengte(achter) > 0.5) uit += stukTouw(achter, 'garen', 4.4);

  // the loop and the short end, one piece of twine
  const tip = TIP + trek;
  let kortPad = tot(KORT, lengte(KORT) * (0.45 + 0.3 * (trek / TREK)));
  if (knip > 0) { los += valt(vanaf(kortPad, STOMP + 2), val, 10); kortPad = tot(kortPad, STOMP + 2); }
  const kort = kortPad.toReversed();
  uit += stukTouw([...kort, [tip + 10, 90], [tip, 96], [tip + 10, 102], [n ? 234 : 240, 102]].filter((p, i, al) => i === 0 || p[0] !== al[i - 1][0] || p[1] !== al[i - 1][1]), 'garen', 4.4);

  uit += stukTouw(voor, 'garen', 4.4);

  for (let i = 0; i < n; i++) { const x = slagX(i); uit += stukTouw([[x, BOVEN], [x + 0.6, 96], [x, ONDER]], 'garen', 4.4); }
  uit += los;

  if (w < 0.5) {
    uit += `<text x="${TIP - 6}" y="100" class="tekst stil" font-size="11" text-anchor="end">lus</text>`;
    uit += `<path d="M270 155V128" class="tw-wijs"/><text x="296" y="166" class="tekst stil" font-size="11" text-anchor="end">kort eindje</text>`;
  }
  // how wide the turns become: while you lay the loop and wind
  if (w <= 1) {
    uit += `<path d="M${LINKS} 132H236" class="tw-pijl"/><path d="M${LINKS} 126v12M236 126v12" class="tw-pijl"/>`;
    uit += `<text x="236" y="152" class="tekst stil" font-size="10" text-anchor="end">ongeveer zo breed als het touw dik is</text>`;
  }
  return uit;
}

export default function takeling() {
  return speler({ stappen: STAPPEN, teksten: TEKST, tekening, viewBox: `0 0 ${W} ${H}`, label: 'Een takeling leggen' });
}
