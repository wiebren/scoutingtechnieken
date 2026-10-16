// The figure that signals with two flags, for semafoor and for the old Vreede-stelsel: the positions of the arms,
// what letter they make, and the figure as an SVG string (for the drawings in src/plaatjes/seinen.js and for the
// pieces in ../). Everything is as the one reading the signal sees it: the seiner faces you, so his right arm is on
// your left. Angles are in degrees clockwise from straight up: 0 up, 90 to the right (as you look), 180 down.
// Classes (sp-*) are in src/plaatjes/seinen.css, which the app always loads.

/** The eight positions of a semafoor flag, by the names of notities/technieken/navigatie-en-seinen.md §4b. */
export const RICHTING = { B: 0, RB: 45, R: 90, RO: 135, O: 180, LO: 225, L: 270, LB: 315 };
export const RICHTING_NAAM = { B: 'boven', RB: 'rechtsboven', R: 'rechts', RO: 'rechtsonder', O: 'omlaag', LO: 'linksonder', L: 'links', LB: 'linksboven' };
const NAAR_NAAM = Object.fromEntries(Object.entries(RICHTING).map(([n, g]) => [g, n]));

/** Semafoor, NAV §4b (from the Commons drawings, as the reader sees it). A to I and K are also 1 to 9 and 0. */
export const SEMAFOOR = {
  A: ['LO', 'O'], B: ['L', 'O'], C: ['LB', 'O'], D: ['B', 'O'], E: ['RB', 'O'], F: ['R', 'O'], G: ['RO', 'O'],
  H: ['L', 'LO'], I: ['LB', 'LO'], J: ['B', 'R'], K: ['B', 'LO'], L: ['RB', 'LO'], M: ['R', 'LO'], N: ['LO', 'RO'],
  O: ['LB', 'L'], P: ['B', 'L'], Q: ['RB', 'L'], R: ['L', 'R'], S: ['L', 'RO'], T: ['LB', 'B'], U: ['LB', 'RB'],
  V: ['B', 'RO'], W: ['RB', 'R'], X: ['RB', 'RO'], Y: ['LB', 'R'], Z: ['R', 'RO'],
};
/** The signs that are not a letter. Rust is both flags down, crossed in front of the legs. */
export const SEMAFOOR_TEKEN = {
  rust: { naam: 'Rust en spatie', vlaggen: ['O', 'O'] },
  cijfers: { naam: 'Cijferteken', vlaggen: ['B', 'RB'] },
  annuleren: { naam: 'Annuleren', vlaggen: ['LB', 'RO'] },
};
export const SEMAFOOR_CIJFER = { A: '1', B: '2', C: '3', D: '4', E: '5', F: '6', G: '7', H: '8', I: '9', K: '0' };

const kant = (g) => (g === 0 || g === 180 ? 0 : g < 180 ? 1 : -1);   // -1 your left, 1 your right, 0 up or down

/**
 * Which arm holds which flag, for a pair of directions: the arm on your left takes the flag on your left; when both
 * are on one side, the other arm crosses in front of the body and takes the lower one. Returns { links, rechts } in
 * degrees: the arm on your left (the seiner's right arm) and the one on your right.
 */
export function armen([a, b]) {
  let [p, q] = [RICHTING[a], RICHTING[b]];
  if (kant(p) > kant(q) || (kant(p) === kant(q) && kant(p) === 0 && p > q)) [p, q] = [q, p];
  if (kant(p) === kant(q) && kant(p) !== 0) {
    // both on one side: the lower one (nearer to 180) goes to the arm that crosses
    const laag = Math.abs(p - 180) < Math.abs(q - 180) ? p : q;
    const hoog = laag === p ? q : p;
    return kant(p) < 0 ? { links: hoog, rechts: laag } : { links: laag, rechts: hoog };
  }
  return { links: p, rechts: q };
}

/** The letter (or sign) two arms make in semafoor, whatever arm holds which flag; null when it is none. */
export function semafoorLetter(links, rechts) {
  const namen = [NAAR_NAAM[links], NAAR_NAAM[rechts]].sort().join();
  if (namen === 'O,O') return 'rust';
  for (const [letter, v] of Object.entries(SEMAFOOR)) if ([...v].sort().join() === namen) return letter;
  for (const [teken, v] of Object.entries(SEMAFOOR_TEKEN)) if ([...v.vlaggen].sort().join() === namen) return teken;
  return null;
}

/** A direction in words, for a screen reader: "rechtsboven". */
export const inWoorden = (g) => RICHTING_NAAM[NAAR_NAAM[((g % 360) + 360) % 360]] ?? `${g} graden`;

// -- Vreede (1886): each arm on its own side, in stand 0 to 4. reference/boeken/BRONNEN.md, from the table in
// Abraas (1922): 0 down (rust), 1 straight up, 2 slanting up, 3 out sideways, 4 slanting down. A letter is
// "rechts/links": the marked right arm (red flag, on your left) over the left arm.

export const VREEDE_STANDEN = ['omlaag', 'recht omhoog', 'schuin omhoog', 'opzij', 'schuin omlaag'];
/** VREEDE[rechts][links]; I and J are one sign; there is no X (write KS). */
export const VREEDE = [
  ['rust', 'A', 'E', 'O', 'U'],
  ['B', 'C', 'D', 'F', 'G'],
  ['H', 'IJ', 'K', 'L', 'M'],
  ['N', 'P', 'Q', 'R', 'S'],
  ['T', 'V', 'W', 'Y', 'Z'],
];
/** The angle of a stand: for the arm on your left (the seiner's right arm) and the one on your right. */
export const VREEDE_HOEK = { links: [180, 0, 315, 270, 225], rechts: [180, 0, 45, 90, 135] };
/** Where a letter is in the Vreede table: [rechts, links], or null. I and J both give the I/J. */
export function vreedeStand(letter) {
  const l = letter === 'I' || letter === 'J' ? 'IJ' : letter;
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) if (VREEDE[r][k] === l) return [r, k];
  return null;
}
export const vreedeNaam = (l) => (l === 'IJ' ? 'I/J' : l);

// -- the figure

const r1 = (n) => Math.round(n * 10) / 10;
const op = (x, y, len, g) => [r1(x + len * Math.sin((g * Math.PI) / 180)), r1(y - len * Math.cos((g * Math.PI) / 180))];

/** The size of the figure: draw it in a box of BREED x HOOG (at 1x). */
export const BREED = 120;
export const HOOG = 124;
const MX = 60;                   // the middle
const SY = 46;                   // the shoulders
const SCHOUDER = 9;
const ARM = 27;
const STOK = 16;
const VLAG = 13;

/** Where the hand is for an arm at angle g, from shoulder `eigen` (-1 your left, 1 your right). */
function hand(g, eigen) {
  const k = kant(g) || eigen;
  return op(MX + k * SCHOUDER, SY, ARM, g);
}

/** One flag on a stick: soort 'semafoor' (red and yellow, corner to corner), 'rood', or 'witblauw' (Vreede). */
function vlag(hx, hy, g, soort) {
  const [ex, ey] = op(hx, hy, STOK, g);
  // the flag is fixed to the outer end of the stick, on the lower side (or the outer side when it is upright)
  const zij = g === 0 || g === 180 ? (hx < MX ? -90 : 90) : (Math.cos(((g + 90) * Math.PI) / 180) < 0 ? 90 : -90);
  const [ax, ay] = op(ex, ey, -VLAG, g);   // along the stick, back towards the hand
  const [bx, by] = op(ax, ay, VLAG, g + zij);
  const [cx, cy] = op(ex, ey, VLAG, g + zij);
  const kleuren = soort === 'semafoor' ? ['sp-rood', 'sp-geel'] : soort === 'rood' ? ['sp-rood', 'sp-rood'] : ['sp-wit', 'sp-blauw'];
  return `<line x1="${hx}" y1="${hy}" x2="${ex}" y2="${ey}" class="sp-stok"/>`
    + `<polygon points="${ax},${ay} ${ex},${ey} ${cx},${cy}" class="${kleuren[0]}"/>`
    + `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" class="${kleuren[1]}"/>`
    + `<polygon points="${ax},${ay} ${ex},${ey} ${cx},${cy} ${bx},${by}" class="sp-vlagrand"/>`;
}

/**
 * The figure with its two arms, as SVG elements (no <svg> around it), BREED x HOOG at (x, y), `schaal` times.
 * links, rechts: the angles of the arm on your left and on your right. soort: 'semafoor' or 'vreede'.
 * greep: draw round handles at the hands (for the piece that lets you move them); vlaggen: false for bare arms.
 * An arm that is null is left out, for a drawing that draws that arm itself (bent, say): `extra` goes in front.
 */
export function pop({ links, rechts, x = 0, y = 0, schaal = 1, soort = 'semafoor', greep = false, vlaggen = true, extra = '' }) {
  // both down: crossed in front of the legs (rust)
  const rust = links === 180 && rechts === 180;
  const gl = rust ? 160 : links;
  const gr = rust ? 200 : rechts;
  const [lx, ly] = hand(gl, -1);
  const [rx, ry] = hand(gr, 1);
  const arm = (sx, hx, hy, extra = '') => `<line x1="${sx}" y1="${SY}" x2="${hx}" y2="${hy}" class="sp-arm${extra}"/>`;
  const lijf = `<line x1="${MX - 6}" y1="78" x2="${MX - 8}" y2="112" class="sp-been"/><line x1="${MX + 6}" y1="78" x2="${MX + 8}" y2="112" class="sp-been"/>`
    + `<path d="M${MX - SCHOUDER - 2} ${SY - 3} Q${MX} ${SY - 8} ${MX + SCHOUDER + 2} ${SY - 3} L${MX + 8} 80 L${MX - 8} 80Z" class="sp-lijf"/>`
    + `<circle cx="${MX}" cy="${SY - 15}" r="8.5" class="sp-hoofd"/>`;
  const vlagL = soort === 'vreede' ? 'rood' : 'semafoor';
  const vlagR = soort === 'vreede' ? 'witblauw' : 'semafoor';
  // an arm that crosses the body is drawn last, in front
  const kruistL = kant(gl) > 0;
  const kruistR = kant(gr) < 0;
  const delen = [
    links !== null && { z: kruistL ? 2 : 1, s: arm(MX - SCHOUDER, lx, ly) + (vlaggen ? vlag(lx, ly, gl, vlagL) : '') },
    rechts !== null && { z: kruistR ? 2 : 1, s: arm(MX + SCHOUDER, rx, ry) + (vlaggen ? vlag(rx, ry, gr, vlagR) : '') },
  ].filter(Boolean).sort((a, b) => a.z - b.z).map((d) => d.s).join('');
  const grepen = greep ? `<circle cx="${lx}" cy="${ly}" r="7" class="sp-greep" data-arm="links"/><circle cx="${rx}" cy="${ry}" r="7" class="sp-greep" data-arm="rechts"/>` : '';
  return `<g transform="translate(${x} ${y})${schaal !== 1 ? ` scale(${schaal})` : ''}">${lijf}${delen}${extra}${grepen}</g>`;
}

/** The point an arm of the figure turns around (for dragging): its own shoulder. */
export const SCHOUDERS = { links: [MX - SCHOUDER, SY], rechts: [MX + SCHOUDER, SY] };
