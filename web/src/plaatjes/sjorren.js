// Drawings for sjorren en pionieren: the sjorringen, takels, ankers and materiaal, simple and finished (no steps);
// the bouwwerken themselves are 3D pieces in ../doe/sjorren/. Rope and wood look like the knots in ./touw.js (a
// rope with edge, body and core; poles as wood with a grain), in their own classes in ./sjorren.css. A turn over a
// pole is drawn after the pole, a turn behind it before: that is all the over and under there is.
// See ../plaatjes.js and ./basis.js.
import { r1, svg, tekst } from './basis.js';
import { fout, goed } from './vuur.js';
import { opgeschotenBos } from './touw.js';

const P = (x, y) => `${r1(x)} ${r1(y)}`;
/** A path through points [[x, y], ...]. */
const lijn = (pts) => `M${pts.map(([x, y]) => P(x, y)).join('L')}`;

/** A piece of rope along a path `d`: edge, body and core. */
function touw(d, dik = 6, { rond = false } = {}) {
  const kap = rond ? ' stroke-linecap="round"' : ' stroke-linecap="butt"';
  return `<path d="${d}" class="sj-touw-rand" stroke-width="${dik}"${kap}/><path d="${d}" class="sj-touw-lijf" stroke-width="${r1(dik - 2.2)}"${kap}/>`
    + `<path d="${d}" class="sj-touw-kern" stroke-width="${r1(dik * 0.26)}"${kap}/>`;
}
/** A rope end: rounded, with a whipping just behind it. */
function eind(x, y, hoek = 0, dik = 6) {
  return `<g transform="translate(${P(x, y)}) rotate(${hoek})"><circle r="${r1(dik / 2)}" class="sj-touw-vul"/>`
    + `<path d="M-4 ${-dik / 2}V${dik / 2}" class="sj-touw-rand" stroke-width="1.3"/></g>`;
}

/** A pole from (x1, y1) to (x2, y2), d thick, with a grain line; `kop1`/`kop2` show the sawn end. A second
 *  thickness `d2` makes it taper towards the second end. */
function paal(x1, y1, x2, y2, d = 24, { kop1 = false, kop2 = false, d2 = d } = {}) {
  const l = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / l; const uy = (y2 - y1) / l;
  const n1x = -uy * d / 2; const n1y = ux * d / 2; const n2x = -uy * d2 / 2; const n2y = ux * d2 / 2;
  let uit = `<path d="M${P(x1 + n1x, y1 + n1y)}L${P(x2 + n2x, y2 + n2y)}L${P(x2 - n2x, y2 - n2y)}L${P(x1 - n1x, y1 - n1y)}Z" class="sj-hout"/>`;
  for (const [f, s] of [[0.35, 8], [-0.4, 20]]) {
    uit += `<path d="M${P(x1 + n1x * f + ux * s, y1 + n1y * f + uy * s)}L${P(x2 + n2x * f - ux * s, y2 + n2y * f - uy * s)}" class="sj-nerf"/>`;
  }
  const hoek = r1((Math.atan2(uy, ux) * 180) / Math.PI);
  if (kop1) uit += `<ellipse cx="${r1(x1)}" cy="${r1(y1)}" rx="${r1(d * 0.16)}" ry="${r1(d / 2)}" transform="rotate(${hoek} ${P(x1, y1)})" class="sj-kop"/>`;
  if (kop2) uit += `<ellipse cx="${r1(x2)}" cy="${r1(y2)}" rx="${r1(d2 * 0.16)}" ry="${r1(d2 / 2)}" transform="rotate(${hoek} ${P(x2, y2)})" class="sj-kop"/>`;
  return uit;
}
/** The end of a pole seen from above: the cut with its year rings. */
const kopVanBoven = (cx, cy, r) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" class="sj-kop"/>`
  + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.62)}" class="sj-jaar"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 0.28)}" class="sj-jaar"/>`;

/** A mastworp on a standing pole at x (pole d wide), its two turns at y and y + 8, the crossing over them. */
function mastworpStaand(x, y, d, { staart = 1 } = {}) {
  const l = x - d / 2 - 2; const r = x + d / 2 + 2;
  let uit = touw(lijn([[l, y], [r, y + 3]])) + touw(lijn([[l, y + 9], [r, y + 12]]));
  uit += touw(lijn([[l + 3, y + 11], [r - 3, y + 1]]));
  if (staart) uit += touw(`M${P(r, y + 11)}Q${P(r + 10, y + 14)} ${P(r + 12 * staart, y + 26)}`, 6, { rond: true }) + eind(r + 12 * staart, y + 26, 70);
  return uit;
}
/** The same on a lying pole at y, its turns at x and x + 9. */
function mastworpLiggend(x, y, d, { staart = true } = {}) {
  const t = y - d / 2 - 2; const b = y + d / 2 + 2;
  let uit = touw(lijn([[x, t], [x + 3, b]])) + touw(lijn([[x + 9, t], [x + 12, b]]));
  uit += touw(lijn([[x + 11, t + 3], [x + 1, b - 3]]));
  if (staart) uit += touw(`M${P(x + 11, b)}Q${P(x + 14, b + 10)} ${P(x + 24, b + 14)}`, 6, { rond: true }) + eind(x + 24, b + 14, 20);
  return uit;
}
/** A timmersteek on a lying pole: one turn at x, its end twisted back along the pole. */
function timmersteekLiggend(x, y, d) {
  const t = y - d / 2 - 2; const b = y + d / 2 + 2;
  let uit = touw(lijn([[x, t], [x + 3, b]]));
  uit += touw(`M${P(x - 1, y - 3)}q-6 5 -12 0t-12 0t-12 0`, 5, { rond: true }) + eind(x - 37, y - 3, 180, 5);
  return uit;
}
/** A platte knoop as a small symbol at (x, y), its two ends leaving to the lower right. */
function platteKnoop(x, y) {
  return touw(`M${P(x - 18, y - 4)}H${x + 2}c7 0 7 9 0 9H${x - 18}`, 5, { rond: true })
    + touw(`M${P(x + 18, y + 4)}H${x - 2}c-7 0 -7 -9 0 -9H${x + 18}`, 5, { rond: true })
    + touw(lijn([[x + 1, y - 4], [x + 3, y - 4]]), 5);
}

/** A name with a thin line to what it names; `anker` as text-anchor. */
function wijs(x, y, t, nx, ny, anker = 'middle', maat = 10.5) {
  const sy = ny > y ? y + 4 : y - 11;
  const sx = anker === 'start' ? x - 3 : anker === 'end' ? x + 3 : x;
  return `<path d="M${P(sx, sy)}L${P(nx, ny)}" class="sj-wijs"/><circle cx="${r1(nx)}" cy="${r1(ny)}" r="2" class="sj-wijs-punt"/>`
    + tekst(x, y, t, { maat, anker });
}
/** An arrow from (x1, y1) to (x2, y2); `kracht` makes it red (a force). */
function pijl(x1, y1, x2, y2, { kracht = false } = {}) {
  const l = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / l; const uy = (y2 - y1) / l;
  const k = kracht ? ' kracht' : '';
  return `<path d="M${P(x1, y1)}L${P(x2 - ux * 5, y2 - uy * 5)}" class="sj-pijl${k}"/>`
    + `<path d="M${P(x2 - ux * 10 - uy * 5, y2 - uy * 10 + ux * 5)}L${P(x2, y2)}L${P(x2 - ux * 10 + uy * 5, y2 - uy * 10 - ux * 5)}Z" class="sj-pijlpunt${k}"/>`;
}
/** Ground from y down, w wide, with its surface line. */
const grond = (y, w, h = 80) => `<rect x="0" y="${y}" width="${w}" height="${h}" class="sj-grond"/><path d="M0 ${y}H${w}" class="sj-maaiveld"/>`;
/** A number in a circle, for steps in a drawing. */
const nummer = (x, y, n) => `<circle cx="${x}" cy="${y}" r="9" class="sj-nummer"/>` + tekst(x, y + 4, String(n), { maat: 11, klasse: 'vet' });

// ---- sjorringen ----

/** A crossing of a standing pole (behind) and a lying balk (in front), lashed: the kruissjorring and its family.
 *  `soort`: 'kruis' (four corners), 'half' (only the two corners above the balk, the balk hangs in it), 'japans'
 *  (begun with the middle of the rope, ended with a platte knoop). */
function kruisFamilie(soort) {
  const w = 340; const h = 300; const px = 170; const by = 150; const d = 26; const r = d / 2;
  const links = [0, 1, 2].map((i) => px - r - 6 - i * 7); const rechts = [0, 1, 2].map((i) => px + r + 6 + i * 7);
  const half = soort === 'half';
  let uit = '';
  // the turns behind the standing pole: above (and below) the balk, from a band on the left to one on the right
  for (let i = 0; i < 3; i++) {
    const yb = by - r - 9 - i * 5;
    uit += touw(`M${P(links[i], by - r - 2)}C${P(links[i], yb)} ${P(rechts[i], yb)} ${P(rechts[i], by - r - 2)}`);
    if (!half) {
      const yo = by + r + 9 + i * 5;
      uit += touw(`M${P(links[i], by + r + 2)}C${P(links[i], yo)} ${P(rechts[i], yo)} ${P(rechts[i], by + r + 2)}`);
    }
  }
  uit += paal(px, 12, px, h - 10, d, { kop1: true });
  // the frapping: between the poles, in front of the standing one and behind the balk, in the corners
  const hoeken = half ? [[-1, -1], [1, -1]] : [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (const [sx, sy] of hoeken) {
    for (const k of [0, 1]) {
      const cx = px + sx * (r + 3 + k * 5); const cy = by + sy * (r + 3 + k * 5);
      uit += touw(lijn([[cx - sx * 15, cy + sy * 2], [cx + sx * 2, cy - sy * 15]]), 5);
    }
  }
  uit += paal(16, by, w - 16, by, d, { kop1: true, kop2: true });
  // the turns in front of the balk
  for (let i = 0; i < 3; i++) uit += touw(lijn([[links[i], by - r - 3], [links[i] + 1, by + r + 3]])) + touw(lijn([[rechts[i], by - r - 3], [rechts[i] - 1, by + r + 3]]));
  if (soort === 'japans') {
    // the middle of the rope round the standing pole under the balk, both ends going up into the lashing
    uit += touw(lijn([[px - r - 2, by + r + 24], [px + r + 2, by + r + 27]]));
    uit += platteKnoop(px + r + 30, by - r - 22);
    uit += wijs(8, 270, 'begin: midden van het touw', px - 6, by + r + 26, 'start');
    uit += wijs(272, 60, 'eind: platte knoop', px + r + 30, by - r - 26, 'middle');
    uit += wijs(70, 70, 'samen 3× rond', links[1], by - 4, 'middle');
    uit += wijs(332, 236, 'woelen: links- en rechtsom', px + r + 8, by + r + 8, 'end');
    return svg(w, h, 'Japanse kruissjorring: begonnen met het midden van het touw om de staande paal, onder de dwarsbalk; met beide einden samen drie keer rond, dan tegengesteld gewoeld en afgemaakt met een platte knoop', uit);
  }
  if (half) {
    uit += mastworpStaand(px, by - r - 46, d, { staart: -1 });
    uit += mastworpLiggend(rechts[2] + 16, by, d);
    uit += wijs(64, 40, 'begin: mastworp', px - r - 4, by - r - 40, 'middle');
    uit += wijs(8, 238, 'de balk hangt in de lussen', links[1], by + r + 3, 'start');
    uit += wijs(280, 54, 'woelen', px + r + 6, by - r - 8, 'middle');
    uit += wijs(276, 238, 'eind: mastworp', rechts[2] + 22, by + r + 6, 'middle');
    return svg(w, h, 'Halve kruissjorring: de slagen gaan om de balk links en rechts van de paal, en alleen boven de balk achter de paal langs; de balk hangt in de sjorring. Begin met een mastworp boven de balk, woel in de twee bovenste hoeken, eindig met een mastworp op de balk', uit);
  }
  uit += mastworpStaand(px, by + r + 30, d, { staart: -1 });
  uit += mastworpLiggend(rechts[2] + 16, by, d);
  uit += wijs(64, 268, 'begin: mastworp', px - r - 4, by + r + 36, 'middle');
  uit += wijs(64, 66, '3 slagen', links[1], by - 4, 'middle');
  uit += wijs(276, 60, '3 keer woelen', px + r + 6, by - r - 8, 'middle');
  uit += wijs(276, 262, 'eind: mastworp', rechts[2] + 22, by + r + 6, 'middle');
  return svg(w, h, 'Kruissjorring: een staande paal met een dwarsbalk ervoor. Begin met een mastworp om de staande paal onder de balk, drie slagen voor de balk langs en achter de paal om, drie woelslagen tussen de palen in de hoeken, eindig met een mastworp om de balk', uit);
}

// The kruissjorring as a small 3D model, seen from the front: the standing pole behind, the balk in front of it and
// touching it. The rope is one path, from the mastworp on the pole through the slagen and the woelslagen to the
// mastworp on the balk, so the drawing and the piece in ../doe/sjorren/ (kruissjorring.js) show the same lashing.
// What lies behind the pole is drawn before the pole, what lies between pole and balk before the balk, the rest after
// it; within each, from back to front.
const KS_R = 13; const KS_T = 3; const KS_ZB = 2 * KS_R;   // poles 26 thick, rope 6; the balk's axis in front
const graad = (g) => (g * Math.PI) / 180;
const meng3 = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const reeks = (a, b, n, f) => Array.from({ length: n + 1 }, (_, i) => f(a + ((b - a) * i) / n));
/** A point on a circle round the standing pole (phi 0 = in front, 90 = right), at height y (down is +). */
const opPaal = (phi, y, rho) => [rho * Math.sin(graad(phi)), y, rho * Math.cos(graad(phi))];
/** A point on a circle round the balk (psi 0 = in front, 90 = on top), at x. */
const opBalk = (psi, x, rho) => [x, -rho * Math.sin(graad(psi)), KS_ZB + rho * Math.cos(graad(psi))];
/** A mastworp: a turn, the crossing over it in front, a second turn whose end goes under the crossing.
 *  `op(hoek, plek, rho)` puts a point on the pole; a and b are where the two turns lie along it. */
const mastworp3 = (op, a, b) => [
  ...reeks(-70, 290, 36, (f) => op(f, a, KS_R + KS_T)),
  ...reeks(-70, 60, 10, (f) => { const g = (f + 70) / 130; return op(f, a + (b - a) * g, KS_R + KS_T + 1.6 * KS_T * Math.sin(Math.PI * g)); }).slice(1),
  ...reeks(60, 395, 34, (f) => op(f, b, KS_R + KS_T)).slice(1),
];
const KS_MW = [KS_R + 3 * KS_T + 2.4, KS_R + KS_T + 2];               // the mastworp on the pole, just under the balk
const KS_SLAG_X = [0, 1, 2].map((i) => KS_R + KS_T + 1 + (2 - i) * (2 * KS_T + 0.3));   // on the balk: each inside the one before
const KS_SLAG_Y = [0, 1, 2].map((i) => KS_R + KS_T + 1 + i * (2 * KS_T + 0.3));         // on the pole: each outside
const KS_WOEL = 47; const KS_WOEL_STAP = 6.4;                         // the woelslagen: round the corners of the slagen
/** How far out woelslag k lies (k + 0.5: half way round it). */
const h3 = (k) => KS_WOEL + KS_WOEL_STAP * k - KS_R - KS_T;
const KS_EIND = h3(3) + 6;                                            // where the mastworp on the balk starts

/** The rope's path, in parts: mastworp, slagen, woelslagen, mastworp on the balk. */
function kruisDelen() {
  const { [0]: onder, [1]: boven } = KS_MW;
  // the short end lies behind the pole, out of sight
  const begin = [...reeks(-160, -75, 6, (f) => opPaal(f, onder + 6 * (f + 75) / -85, KS_R + KS_T)), ...mastworp3(opPaal, onder, boven)];
  const slagen = [];
  for (let i = 0; i < 3; i++) {
    const x = KS_SLAG_X[i]; const y = KS_SLAG_Y[i]; const hoek = (KS_R + KS_T + y) / 2 + 2;
    // up in front of the balk, back over it to the pole, round behind it, over the balk, down in front, under the balk
    // and round behind the pole below it (outside the mastworp)
    slagen.push(...reeks(-90, 90, 12, (f) => opBalk(f, x, KS_R + KS_T)), [(x + KS_R + KS_T) / 2 + 2, -hoek, KS_ZB * 0.45],
      ...reeks(90, 270, 14, (f) => opPaal(f, -y, KS_R + KS_T)), [-(x + KS_R + KS_T) / 2 - 2, -hoek, KS_ZB * 0.45],
      ...reeks(90, -90, 12, (f) => opBalk(f, -x, KS_R + KS_T)), [-(x + KS_R + 3 * KS_T) / 2 - 1, hoek, KS_ZB * 0.45],
      ...reeks(270, 90, 14, (f) => opPaal(f, y, KS_R + 3 * KS_T)));
    if (i < 2) slagen.push([(KS_SLAG_X[i + 1] + KS_R + 3 * KS_T) / 2 + 1, (KS_R + KS_T + KS_SLAG_Y[i + 1]) / 2 + 2, KS_ZB * 0.45]);
  }
  // three times round between the poles, each outside the one before: behind the balk at the sides, over the front of
  // the pole above and below the balk, and round the corners where the slagen go from the balk to the pole
  const woelen = []; const rb = KS_R + KS_T;
  const hoek = (k, q, [sx, sy], van, tot) => reeks(van, tot, 8, (b) => {
    const f = (b - van) / (tot - van); const r = h3(k + q + f / 8) - rb;
    return [sx * rb + r * Math.cos(graad(b)), sy * rb + r * Math.sin(graad(b)), KS_ZB * (van % 180 === 0 ? 1 - f : f)];
  }).slice(1, -1);
  for (let k = 0; k < 3; k++) {
    woelen.push(...reeks(270, 90, 10, (f) => opBalk(f, h3(k + (270 - f) / 1440), rb)), ...hoek(k, 1 / 8, [1, -1], 0, -90),
      ...reeks(90, -90, 14, (f) => opPaal(f, -h3(k + 2 / 8 + (90 - f) / 1440), rb)), ...hoek(k, 3 / 8, [-1, -1], -90, -180),
      ...reeks(90, 270, 10, (f) => opBalk(f, -h3(k + 4 / 8 + (f - 90) / 1440), rb)), ...hoek(k, 5 / 8, [-1, 1], 180, 90),
      ...reeks(-90, 90, 14, (f) => opPaal(f, h3(k + 6 / 8 + (f + 90) / 1440), rb)), ...hoek(k, 7 / 8, [1, 1], 90, 0));
  }
  const af = mastworp3((f, x, rho) => opBalk(f, x, rho), KS_EIND, KS_EIND + 2 * KS_T + 0.4);
  const e = af.at(-1);
  af.push([e[0] + 5, e[1] - 6, e[2] + 3], [e[0] + 12, e[1] - 14, e[2] + 4]);
  return [begin, slagen, woelen, af];
}
/** Points every `stap` along a path. */
function verdeel3(p, stap) {
  const uit = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]) / stap));
    for (let k = 1; k <= n; k++) uit.push(meng3(p[i - 1], p[i], k / n));
  }
  return uit;
}
const lengte3 = (p) => p.slice(1).reduce((som, q, i) => som + Math.hypot(q[0] - p[i][0], q[1] - p[i][1], q[2] - p[i][2]), 0);
/** The whole path, its corners rounded off (Chaikin), and where each part ends along it. */
const KRUIS = (() => {
  const delen = kruisDelen();
  let p = delen.flat();
  for (let k = 0; k < 2; k++) p = [p[0], ...p.slice(0, -1).flatMap((a, i) => [meng3(a, p[i + 1], 0.25), meng3(a, p[i + 1], 0.75)]), p.at(-1)];
  p = verdeel3(p, 1.5);
  let tot = 0; const grenzen = delen.map((d) => (tot += lengte3(d)));
  const schaal = lengte3(p) / tot;                                    // rounding shortens it a little
  return { p, grenzen: grenzen.map((g) => g * schaal) };
})();

/** The path cut off after length l. */
function tot3(p, l) {
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
    if (d < l) { l -= d; continue; }
    return [...p.slice(0, i), meng3(p[i - 1], p[i], l / d)];
  }
  return p;
}

// Seen a little from the right and from above, so the gap between pole and balk shows.
const KS_DRAAI = graad(-24); const KS_KANT = graad(10);
/** A model point [x, y (down), z (to you)] to the drawing: { x, y, d } (d: larger is nearer). */
function kijk([x, y, z], cx, cy) {
  const x1 = x * Math.cos(KS_DRAAI) + z * Math.sin(KS_DRAAI); const z1 = -x * Math.sin(KS_DRAAI) + z * Math.cos(KS_DRAAI);
  return { x: cx + x1, y: cy + y * Math.cos(KS_KANT) + z1 * Math.sin(KS_KANT), d: z1 * Math.cos(KS_KANT) - y * Math.sin(KS_KANT) };
}
const normaal2 = (u, v) => { const dx = v.x - u.x; const dy = v.y - u.y; const k = Math.hypot(dx, dy) || 1; return [-dy / k, dx / k]; };
/** A pole from a to b (model points), r thick, in short slices to sort among the rope; the end you see shows its cut. */
function paalStukken(a, b, r, cx, cy) {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 4);
  const q = reeks(0, n, n, (i) => kijk(meng3(a, b, i / n), cx, cy));
  const [nx, ny] = normaal2(q[0], q[n]);
  const stukken = [];
  for (let i = 0; i < n; i++) {
    const A = q[i]; const B = q[i + 1];
    const zij = (f) => `M${P(A.x + nx * f, A.y + ny * f)}L${P(B.x + nx * f, B.y + ny * f)}`;
    // a little longer than the slice, so no seam shows between two
    const [ex, ey] = [(B.x - A.x) * 0.15, (B.y - A.y) * 0.15];
    let svg = `<path d="M${P(A.x + nx * r - ex, A.y + ny * r - ey)}L${P(B.x + nx * r + ex, B.y + ny * r + ey)}L${P(B.x - nx * r + ex, B.y - ny * r + ey)}L${P(A.x - nx * r - ex, A.y - ny * r - ey)}Z" class="sj-hout-vul"/>`
      + `<path d="M${P(A.x + nx * r - ex, A.y + ny * r - ey)}L${P(B.x + nx * r + ex, B.y + ny * r + ey)}M${P(A.x - nx * r - ex, A.y - ny * r - ey)}L${P(B.x - nx * r + ex, B.y - ny * r + ey)}" class="sj-hout-rand"/>`;
    if (i % 7 < 4) svg += `<path d="${zij(r * 0.35)}" class="sj-nerf-stuk"/>`;
    if ((i + 3) % 7 < 4) svg += `<path d="${zij(-r * 0.4)}" class="sj-nerf-stuk"/>`;
    stukken.push({ d: (A.d + B.d) / 2 - 0.5, svg });
  }
  // the ends: an ellipse, the circle of the cut seen at an angle (only where its face turns to you)
  for (const [p, o, Q] of [[a, b, q[0]], [b, a, q[n]]]) {
    const l = Math.hypot(p[0] - o[0], p[1] - o[1], p[2] - o[2]); const u = p.map((v, i) => (v - o[i]) / l);
    const t = kijk(u, 0, 0);
    if (t.d <= 0.02) continue;
    const hoek = (Math.atan2(t.y, t.x) * 180) / Math.PI;
    stukken.push({ d: Q.d + 0.5, svg: `<ellipse cx="${r1(Q.x)}" cy="${r1(Q.y)}" rx="${r1(r * t.d)}" ry="${r1(r)}" transform="rotate(${r1(hoek)} ${P(Q.x, Q.y)})" class="sj-kop"/>` });
  }
  return stukken;
}

/**
 * The kruissjorring at point w (0 = the mastworp on the pole, 1 = three slagen, 2 = three woelslagen, 3 = the
 * mastworp on the balk), the crossing at (cx, cy). What is not laid yet hangs from the end you work with.
 */
export function kruissjorringStand(w, cx = 170, cy = 150) {
  const { p, grenzen } = KRUIS;
  const fase = Math.min(2, Math.max(0, Math.floor(w)));
  const gelegd = w >= 3 ? p : tot3(p, grenzen[fase] + (grenzen[fase + 1] - grenzen[fase]) * Math.max(0, w - fase));
  // the free end: on from the last point, away from the poles and towards you, and hanging down
  const los = Math.min(46, grenzen[3] - lengte3(gelegd));
  let pad = gelegd;
  if (los > 0.5) {
    const a = gelegd.at(-2); const b = gelegd.at(-1);
    const eenheid = (v) => { const k = Math.hypot(...v) || 1; return v.map((c) => c / k); };
    const u = eenheid([...eenheid(b.map((c, i) => c - a[i]))].map((c, i) => c * 0.5 + eenheid([b[0], 0, b[2] - KS_ZB / 2 + 24])[i]));
    pad = [...gelegd, ...reeks(0, los, 14, (s) => [b[0] + u[0] * s * (1 - s / 92), b[1] + u[1] * s * (1 - s / 92) + (s * s) / 92, b[2] + u[2] * s * (1 - s / 92)]).slice(1)];
  }
  const stukken = [...paalStukken([0, -136, 0], [0, 140, 0], KS_R, cx, cy), ...paalStukken([-150, 0, KS_ZB], [150, 0, KS_ZB], KS_R, cx, cy)];
  const q = pad.map((v) => kijk(v, cx, cy)); const n = q.length - 1;
  const lijf = KS_T - 1.1; const rand = KS_T - 0.6;
  for (let i = 0; i < n; i++) {
    const A = q[i]; const B = q[i + 1];
    const [ax, ay] = normaal2(q[Math.max(0, i - 1)], B); const [bx, by] = normaal2(A, q[Math.min(n, i + 2)]);
    const zij = (f) => `M${P(A.x + ax * f, A.y + ay * f)}L${P(B.x + bx * f, B.y + by * f)}`;
    stukken.push({ d: (A.d + B.d) / 2, svg: `<path d="${zij(lijf)}L${P(B.x - bx * lijf, B.y - by * lijf)}L${P(A.x - ax * lijf, A.y - ay * lijf)}Z" class="sj-touw-lijfvul"/>`
      + `<path d="${zij(rand)}${zij(-rand)}" class="sj-touw-rand" stroke-width="1.2" stroke-linecap="round"/>`
      + `<path d="M${P(A.x, A.y)}L${P(B.x, B.y)}" class="sj-touw-kern" stroke-width="1.6" stroke-linecap="round"/>` });
  }
  const E = q[n]; const F = q[n - 2];
  stukken.push({ d: E.d + 0.01, svg: eind(E.x, E.y, (Math.atan2(E.y - F.y, E.x - F.x) * 180) / Math.PI) });
  return stukken.sort((s, t) => s.d - t.d).map((s) => s.svg).join('');
}

/** The kruissjorring, finished, with what each part is. */
function kruissjorring() {
  // bigger than the piece: the lashing is what it is about
  const S = 1.4;
  const zie = (pt) => { const { x, y } = kijk(pt, 0, 0); return [170 + x * S, 150 + y * S]; };
  let uit = `<g transform="translate(170 150) scale(${S}) translate(-170 -150)">${kruissjorringStand(3)}</g>`;
  uit += wijs(56, 272, 'begin: mastworp,', ...zie(opPaal(-20, KS_MW[0], KS_R + KS_T)), 'middle') + tekst(56, 286, 'binnen de slagen', { maat: 10.5 });
  uit += wijs(56, 66, '3 slagen', ...zie(opBalk(30, -KS_SLAG_X[1], KS_R + KS_T)), 'middle');
  uit += wijs(284, 40, '3 keer woelen', ...zie(opPaal(30, -h3(1), KS_R + KS_T)), 'middle');
  uit += wijs(284, 268, 'eind: mastworp', ...zie(opBalk(-60, KS_EIND + 3, KS_R + KS_T)), 'middle');
  return svg(340, 300, 'Kruissjorring: een staande paal met een dwarsbalk ervoor. Begin met een mastworp om de staande paal, net onder de balk. Leg drie slagen voor de balk langs en achter de paal om; die liggen om de mastworp heen. Woel drie keer tussen de palen door, om de slagen heen, zodat ze samengetrokken worden. Eindig met een mastworp om de balk', uit);
}

/** Three poles side by side, lashed with figure-eights: the achtsjorring. A small panel above shows the eights alone,
 *  before the woelslagen go round them; the big one below the finished lashing. */
function achtsjorring() {
  const w = 340; const h = 360; const d = 28; const r = d / 2;
  let uit = '';
  /** Three poles at heights ys with the eights at x positions `slagen`; `af` adds woelen and the knots. */
  const tekenAcht = (ys, slagen, d, x0, x1, af) => {
    const r = d / 2; let u = '';
    // a turn in front of the outer poles and behind the middle one (at x), the next the other way round (at x + 10):
    // in the gaps they cross, and the rope makes eights
    const st = d * 0.36;
    const pas = (x, voor) => ys.map((y, i) => [[(i % 2 === 0) === voor ? x : x + st, y - r - 3], [(i % 2 === 0) === voor ? x : x + st, y + r + 3]]);
    for (const x of slagen) for (const voor of [true, false]) u += touw(lijn(pas(x, voor).flat()), af ? 6 : 5);
    for (const y of ys) u += paal(x0, y, x1, y, d, { kop1: true });
    for (const x of slagen) {
      for (const voor of [true, false]) pas(x, voor).forEach((stuk, i) => { if ((i % 2 === 0) === voor) u += touw(lijn(stuk), af ? 6 : 5); });
    }
    if (af) {
      // the frapping, across the turns in the two gaps
      for (const g of [0, 1]) {
        const yg = (ys[g] + ys[g + 1]) / 2;
        u += touw(lijn([[slagen[0] - 10, yg - 4], [slagen[slagen.length - 1] + 18, yg - 3]]), 5) + touw(lijn([[slagen[0] - 10, yg + 3], [slagen[slagen.length - 1] + 18, yg + 4]]), 5);
      }
    }
    return u;
  };
  // 1: the eights alone
  const ysK = [40, 66, 92];
  uit += tekenAcht(ysK, [112, 124, 136], 20, 20, 196, false);
  uit += tekst(214, 54, '1. eerst de achten', { anker: 'start', maat: 12 }) + tekst(214, 70, 'over en onder,', { anker: 'start', maat: 11 }) + tekst(214, 84, 'nog zonder woelen', { anker: 'start', maat: 11 });
  // 2: the finished lashing
  const ys = [180, 226, 272];
  const slagen = [150, 166, 182];
  uit += tekenAcht(ys, slagen, d, 16, w - 16, true);
  uit += timmersteekLiggend(124, ys[0], d);
  uit += mastworpLiggend(222, ys[2], d);
  uit += tekst(16, 132, '2. dan woelen en afmaken', { anker: 'start', maat: 12 });
  uit += wijs(64, 146, 'begin: timmersteek', 112, ys[0] - r - 2, 'middle');
  uit += wijs(234, 146, 'achten, 3 per paal', 168, ys[0] - r - 2, 'middle');
  uit += wijs(186, 346, '2× woelen', 196, (ys[1] + ys[2]) / 2 + 4, 'middle');
  uit += wijs(290, 330, 'eind: mastworp', 238, ys[2] + r + 4, 'middle');
  uit += wijs(64, 330, 'onderkanten gelijk', 20, ys[2] + r, 'middle');
  return svg(w, h, 'Achtsjorring: drie palen naast elkaar, de onderkanten gelijk. Boven: eerst sla je het touw in achten over en onder de palen, drie keer om elke paal. Onder: de hele sjorring, begonnen met een timmersteek om een buitenste paal, met woelslagen tussen elk paar palen, en een mastworp om de andere buitenste paal', uit);
}

/** Two poles in a narrow fork: the vorksjorring. */
function vorksjorring() {
  const w = 320; const h = 300; const d = 22;
  const A = [[100, 290], [192, 22]]; const B = [[220, 290], [128, 22]];
  const xOp = ([[x1, y1], [x2, y2]], y) => x1 + ((x2 - x1) * (y - y1)) / (y2 - y1);
  let uit = paal(B[0][0], B[0][1], B[1][0], B[1][1], d, { kop2: true }) + paal(A[0][0], A[0][1], A[1][0], A[1][1], d, { kop2: true });
  const yk = 118;  // where they cross
  for (let i = 0; i < 6; i++) {
    const y = yk - 14 + i * 5.5;
    uit += touw(lijn([[Math.min(xOp(A, y), xOp(B, y)) - d / 2 - 4, y], [Math.max(xOp(A, y), xOp(B, y)) + d / 2 + 4, y + 2]]));
  }
  for (const x of [156, 162]) uit += touw(lijn([[x, yk - 34], [x + 1, yk + 30]]), 5);
  // begin on one pole, end on the other, both under the lashing
  const ys = 170; const ye = 192;
  uit += touw(lijn([[xOp(B, ys) - d / 2 - 2, ys], [xOp(B, ys) + d / 2 + 2, ys + 3]])) + touw(lijn([[xOp(B, ys + 9) - d / 2 - 2, ys + 9], [xOp(B, ys + 9) + d / 2 + 2, ys + 12]]));
  uit += touw(lijn([[xOp(A, ye) - d / 2 - 2, ye], [xOp(A, ye) + d / 2 + 2, ye + 3]])) + touw(lijn([[xOp(A, ye + 9) - d / 2 - 2, ye + 9], [xOp(A, ye + 9) + d / 2 + 2, ye + 12]]));
  // the crossing part of each mastworp, over its two turns
  uit += touw(lijn([[xOp(B, ys + 11) - d / 2 + 1, ys + 11], [xOp(B, ys + 1) + d / 2 - 1, ys + 1]]));
  uit += touw(lijn([[xOp(A, ye + 11) - d / 2 + 1, ye + 11], [xOp(A, ye + 1) + d / 2 - 1, ye + 1]]));
  uit += wijs(312, 214, 'begin: mastworp', xOp(B, ys) + 10, ys + 6, 'end') + tekst(312, 228, 'met voorslag', { anker: 'end', maat: 10.5 });
  uit += wijs(8, 252, 'eind: mastworp', xOp(A, ye) - 10, ye + 6, 'start');
  uit += wijs(312, 96, 'slagen om beide palen', xOp(A, yk) + 18, yk, 'end');
  uit += wijs(8, 66, 'woelen tussen de palen', 157, yk - 30, 'start');
  return svg(w, h, 'Vorksjorring: twee palen die bovenaan een smalle vork vormen, met slagen om beide palen waar ze kruisen en woelslagen tussen de palen door; begin met een mastworp met voorslag op de ene paal, eindig op de andere paal onder de sjorring', uit);
}

/** Two poles crossing at a slant: the diagonaalsjorring and the Filipijnse. */
function diagonaal(filipijns = false) {
  const w = 320; const h = 280; const d = 24; const cx = 160; const cy = 140;
  let uit = '';
  uit += paal(30, 60, 290, 220, d, { kop1: true, kop2: true });            // behind
  uit += paal(30, 220, 290, 60, d, { kop1: true, kop2: true });            // in front
  for (const dx of [-7, 0, 7]) uit += touw(lijn([[cx + dx, cy - 30], [cx + dx + 1, cy + 30]]));          // 1: through the big angles
  for (const dy of [-7, 0, 7]) uit += touw(lijn([[cx - 32, cy + dy], [cx + 32, cy + dy + 1]]));          // 2: through the small ones
  for (const k of [0, 1]) uit += touw(lijn([[cx + 38 + k * 6, cy - 14], [cx + 34 + k * 6, cy + 16]]), 5);   // 3: woelen
  if (filipijns) {
    uit += touw(`M${P(cx - 4, cy - 30)}c-10 -14 -2 -26 10 -22`, 5) + platteKnoop(cx - 52, cy + 36);
    uit += wijs(84, 28, 'begin: midden van het touw', cx + 2, cy - 44, 'middle');
    uit += wijs(70, 262, 'eind: platte knoop', cx - 52, cy + 44, 'middle');
    uit += wijs(312, 28, 'slagen met beide einden', cx + 7, cy - 22, 'end');
    uit += wijs(312, 262, 'woelen: links- en rechtsom', cx + 44, cy + 12, 'end');
    return svg(w, h, 'Filipijnse diagonaalsjorring: twee schuin kruisende palen; begin met het midden van het touw om beide palen met de einden door de lus, leg de slagen met beide einden samen, woel tegengesteld en maak het af met een platte knoop', uit);
  }
  uit += touw(`M${P(cx - 7, cy - 30)}q-6 -6 -16 -4t-16 -4t-14 -6`, 5, { rond: true }) + eind(cx - 53, cy - 44, 200, 5);
  // the end: a mastworp on the front pole, lower left
  uit += `<g transform="rotate(-31.6 92 187)">${mastworpLiggend(86, 187, d)}</g>`;
  uit += wijs(cx, 24, '1 timmersteek + 3 slagen', cx + 2, cy - 26, 'middle');
  uit += tekst(46, 118, '2 drie slagen', { maat: 10.5 }) + wijs(46, 132, 'de andere kant', cx - 30, cy, 'middle');
  uit += wijs(272, 158, '3 woelen', cx + 44, cy + 8, 'middle');
  uit += wijs(8, 266, '4 eind: mastworp', 96, 196, 'start');
  return svg(w, h, 'Diagonaalsjorring: twee palen die schuin kruisen. 1 een timmersteek met drie slagen door de grootste hoeken, 2 drie slagen de andere kant op door de kleinste hoeken, 3 woelen tussen de palen, 4 eindig met een mastworp', uit);
}

/** Two poles end to end with a spalk beside them and four steigersjorringen with wedges. */
function steigersjorring() {
  const w = 320; const h = 400; const x = 150; const d = 24; const xs = x + 23; const ds = 20;
  let uit = '';
  uit += paal(xs, 160, xs, 282, ds, { kop1: true, kop2: true });
  uit += paal(x, 388, x, 222, d) + paal(x, 220, x, 12, d, { kop2: true });
  uit += `<path d="M${P(x - d / 2, 221)}H${x + d / 2}" style="stroke: var(--sj-hout-rand); stroke-width: 2"/>`;
  for (const y0 of [172, 200, 232, 260]) {
    for (let i = 0; i < 6; i++) {
      const y = y0 + i * 3.6; const s = i % 2 ? -3 : 3;
      uit += touw(lijn([[x - d / 2 - 2, y - s], [xs + ds / 2 + 2, y + s]]), 5);
    }
    uit += touw(`M${P(xs + ds / 2 + 2, y0 + 8)}q8 2 9 9`, 4.5, { rond: true });
    // the wedge, driven in from above between the poles and the turns
    uit += `<path d="M${P(x + d / 2 - 2, y0 - 12)}h9l-4.5 22z" class="sj-hout-licht"/>`;
  }
  uit += pijl(x + 17, 136, x + 17, 158);
  uit += wijs(8, 120, 'wig: van boven', x + 13, 160, 'start') + tekst(8, 134, 'naar beneden', { anker: 'start', maat: 10.5 });
  uit += wijs(36, 200, 'de naad', x - d / 2, 221, 'middle');
  uit += wijs(220, 330, '4 sjorringen', x + d / 2 + 4, 266, 'middle');
  // measures: the whole length and the spalk
  uit += `<path d="M${xs + 40} 160V282M${xs + 34} 160h12M${xs + 34} 282h12" class="sj-maat"/>`;
  uit += tekst(xs + 48, 214, 'spalk ≈ ⅓', { anker: 'start' }) + tekst(xs + 48, 228, 'van het geheel', { anker: 'start' });
  uit += `<path d="M96 12V388M90 12h12M90 388h12" class="sj-maat"/>`;
  uit += `<text x="88" y="300" class="tekst" font-size="10.5" text-anchor="middle" transform="rotate(-90 88 300)">de hele lengte</text>`;
  return svg(w, h, 'Steigersjorring: twee palen in elkaars verlengde met een spalk ernaast van ongeveer een derde van de hele lengte; vier sjorringen, bij elk uiteinde van de spalk en van de palen, elk met wiggen die van boven naar beneden zijn ingeslagen', uit);
}

/** Two poles overlapping side by side, two round lashings. */
function rondsjorring() {
  const w = 340; const h = 170; const d = 24;
  let uit = paal(16, 70, 252, 70, d, { kop1: true, kop2: true }) + paal(88, 94, 324, 94, d, { kop1: true, kop2: true });
  for (const x0 of [116, 206]) {
    for (let i = 0; i < 7; i++) uit += touw(lijn([[x0 + i * 5, 56], [x0 + i * 5 + 2, 108]]), 5);
    uit += touw(`M${P(x0 + 33, 106)}q6 10 14 12`, 4.5, { rond: true }) + eind(x0 + 47, 118, 20, 4.5);
  }
  uit += wijs(70, 148, 'slagen om beide palen', 126, 108, 'middle');
  uit += wijs(268, 148, 'eind: halve steken', 246, 116, 'middle');
  uit += tekst(170, 26, 'geen woelslagen: er is geen ruimte tussen de palen', { maat: 10.5 });
  return svg(w, h, 'Rondsjorring: twee palen die naast elkaar overlappen, met twee sjorringen van slagen om beide palen, zonder woelslagen, afgemaakt met halve steken', uit);
}

/** Two pickets some way apart, joined by a band of turns with the rope slung round it. */
function slingersjorring() {
  const w = 340; const h = 230; const gy = 176;
  let uit = grond(gy, w, 60);
  uit += paal(102, 222, 84, 84, 18, { kop2: true }) + paal(244, 222, 226, 84, 18, { kop2: true });
  uit += `<rect x="0" y="${gy + 1}" width="${w}" height="54" class="sj-grond-over"/>`;
  // the band: from the top of the front picket to the foot of the one behind
  const a = [228, 100]; const b = [96, 168];
  for (const o of [-4, 0, 4]) uit += touw(lijn([[a[0], a[1] + o], [b[0], b[1] + o]]), 4.5);
  // slung round it
  const n = 9; let d = `M${P(a[0] - 6, a[1] - 6)}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n; const x = a[0] + (b[0] - a[0]) * t; const y = a[1] + (b[1] - a[1]) * t;
    d += `L${P(x + (i % 2 ? 5 : -5), y + (i % 2 ? -9 : 9))}`;
  }
  uit += touw(d, 4.5);
  uit += touw(lijn([[219, 92], [237, 98]]), 5) + touw(`M${P(219, 92)}q-12 -2 -12 -12`, 4.5, { rond: true }) + eind(207, 80, -90, 4.5);
  uit += touw(lijn([[88, 160], [106, 166]]), 5) + touw(lijn([[87, 168], [105, 174]]), 5);
  // the pull of the load
  uit += touw(lijn([[244, 170], [336, 162]]), 6) + pijl(296, 146, 332, 143, { kracht: true });
  uit += wijs(196, 34, 'begin: timmersteek', 214, 84, 'middle');
  uit += wijs(8, 112, 'eromheen geslingerd', 160, 130, 'start');
  uit += wijs(52, 212, 'twee halve steken', 96, 172, 'middle');
  uit += tekst(306, 134, 'trek', { maat: 10.5, anker: 'middle' });
  return svg(w, h, 'Slingersjorring: twee piketten een eind uit elkaar; een band van slagen van de kop van de voorste piket naar de voet van de achterste, met het touw er als een spiraal omheen geslingerd en afgemaakt met twee halve steken', uit);
}

/** A floor clamped on its ligger by an opsluitrib, with a twisted loop: the woelsjorring. */
function woelsjorring() {
  const w = 340; const h = 250;
  let uit = '';
  const ly = 182; const ry = 131;
  // the loop, twisted between rib and ligger, drawn first (it goes round behind both)
  const x = 280; let d1 = `M${P(x - 6, ry - 10)}`; let d2 = `M${P(x + 6, ry - 10)}`;
  for (let i = 1; i <= 8; i++) {
    const y = ry - 10 + (i * (ly + 18 - ry + 10)) / 8; const s = i % 2 ? 1 : -1;
    d1 += `L${P(x + s * 6, y)}`; d2 += `L${P(x - s * 6, y)}`;
  }
  uit += touw(d1, 5) + touw(d2, 5);
  uit += paal(16, ly, 324, ly, 26, { kop1: true, kop2: true });
  for (let xx = 32; xx <= 250; xx += 27) uit += kopVanBoven(xx, ly - 13 - 13, 13);
  uit += paal(18, ry, 312, ry, 16, { kop1: true, kop2: true });
  // the turns over the rib and under the ligger, in front
  uit += touw(lijn([[x - 7, ry - 9], [x + 7, ry - 9]]), 5) + touw(lijn([[x - 7, ly + 14], [x + 7, ly + 14]]), 5);
  uit += platteKnoop(x, ly + 26);
  // the woelhout through the loop, and how it turns
  uit += paal(280, 156, 322, 192, 8, { kop2: true });
  uit += `<path d="M${P(296, 204)}a18 8 0 0 0 34 -6" class="sj-pijl"/>` + `<path d="M${P(334, 191)}l-9 4 7 6z" class="sj-pijlpunt"/>`;
  uit += wijs(70, 30, 'opsluitrib', 90, ry - 8, 'middle');
  uit += wijs(70, 238, 'ligger', 90, ly + 13, 'middle');
  uit += wijs(186, 30, 'vloer', 167, ly - 26, 'middle');
  uit += wijs(196, 240, 'platte knoop', x - 12, ly + 28, 'middle');
  uit += wijs(332, 30, 'woelhout: draai rond', 304, 176, 'end');
  return svg(w, h, 'Woelsjorring: een vloer van dunne palen op een ligger, met een opsluitrib erover; een lus touw om rib en ligger, onder de ligger dichtgeknoopt met een platte knoop, wordt met een stok, het woelhout, opgedraaid zodat de rib de vloer vastklemt', uit);
}

/** Four poles seen from above, lashed in a clover: the polypedestrasjorring. */
function polypedestra() {
  const w = 320; const h = 280; const c = [160, 140]; const R = 24;
  const palen = [[118, 98], [202, 98], [202, 182], [118, 182]];  // clockwise on screen
  let uit = '';
  const hoek = ([x, y]) => Math.atan2(y - c[1], x - c[0]);
  const op = ([x, y], r, a) => [x + r * Math.cos(a), y + r * Math.sin(a)];
  for (let k = 2; k >= 0; k--) {
    const r = R + 5 + k * 5;
    let d = '';
    palen.forEach((p, i) => {
      const a = hoek(p); const s = op(p, r, a - 2.15); const e = op(p, r, a + 2.15);
      d += `${i ? 'L' : 'M'}${P(...s)}A${r} ${r} 0 1 1 ${P(...e)}`;
    });
    uit += touw(`${d}Z`, 5);
  }
  for (const p of palen) uit += kopVanBoven(p[0], p[1], R);
  // the frapping: round each bundle, between the pole and the middle
  for (const p of palen) {
    const a = hoek(p) + Math.PI; const m = op(p, R + 13, a);
    for (const o of [-3.5, 3.5]) {
      const q = op(m, o, a);
      uit += touw(lijn([op(q, 12, a + Math.PI / 2), op(q, 12, a - Math.PI / 2)]), 4.5);
    }
  }
  uit += wijs(160, 266, 'in het midden een zuiver vierkant', 160, 140, 'middle');
  uit += wijs(8, 26, 'woel van de paal naar binnen', 143, 123, 'start');
  uit += wijs(256, 26, '3 keer om elke paal', 236, 90, 'middle');
  uit += tekst(160, 46, 'van boven gezien', { maat: 10, klasse: 'stil' });
  return svg(w, h, 'Polypedestrasjorring, van boven gezien: vier palen in een vierkant, het touw drie keer om de buitenkant van elke paal als een klaverblad, in het midden een zuiver vierkant; de woelslagen om elk bundeltje, van de paal naar binnen', uit);
}

/** Two poles side by side: the turns, and the frapping across them between the poles. */
function woelen() {
  const w = 320; const h = 190; const d = 26;
  let uit = paal(16, 68, 304, 68, d, { kop1: true, kop2: true }) + paal(16, 122, 304, 122, d, { kop1: true, kop2: true });
  for (let i = 0; i < 6; i++) uit += touw(lijn([[118 + i * 10, 52], [121 + i * 10, 138]]));
  for (const y of [88, 95, 102]) uit += touw(lijn([[106, y], [188, y + 1]]), 5);
  uit += pijl(152, 24, 152, 46, { kracht: true }) + pijl(152, 168, 152, 146, { kracht: true });
  uit += wijs(60, 30, 'slagen om de palen', 120, 56, 'middle');
  uit += wijs(312, 176, 'woelslagen ertussen, dwars', 186, 100, 'end');
  uit += tekst(196, 30, 'trekt de slagen samen', { maat: 10.5, anker: 'start' });
  return svg(w, h, 'Woelen: twee palen naast elkaar met slagen om beide; de woelslagen liggen tussen de palen, dwars op de slagen, en trekken de slagen samen en strak', uit);
}

// ---- takels ----

/** A block with its parts named; one wang left off, so you see the schijf. */
function blok() {
  const w = 320; const h = 310; const cx = 160; const cy = 150;
  let uit = '';
  uit += `<path d="M${P(cx, 74)}V46q0 -18 18 -18q16 0 16 16" class="sj-metaal-lijn" stroke-width="7" fill="none"/>`;
  uit += `<path d="M${P(cx, 74)}V46q0 -18 18 -18q16 0 16 16" fill="none" style="stroke: var(--sj-metaal); stroke-width: 4"/>`;
  uit += `<rect x="${cx - 48}" y="74" width="96" height="152" rx="44" class="sj-metaal"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="38" class="sj-hout-licht"/><circle cx="${cx}" cy="${cy}" r="32" class="sj-jaar" style="opacity: 0.8"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="6" class="sj-metaal-licht"/>`;
  uit += `<circle cx="${cx}" cy="238" r="9" fill="none" class="sj-metaal-lijn" stroke-width="5"/>`;
  uit += touw(`M${P(cx - 32, 300)}V${cy}A32 32 0 0 1 ${P(cx + 32, cy)}V300`, 7);
  uit += wijs(60, 40, 'haak of oog', cx + 2, 64, 'middle');
  uit += wijs(60, 104, 'wang', cx - 40, 110, 'middle');
  uit += wijs(60, 286, 'loper', cx - 32, 270, 'middle');
  uit += wijs(268, 70, 'spoor', cx + 22, cy - 24, 'middle');
  uit += wijs(268, 130, 'nagel', cx + 6, cy, 'middle');
  uit += wijs(268, 196, 'schijf', cx + 18, cy + 18, 'middle');
  uit += wijs(268, 262, 'hondsvot', cx + 9, 238, 'middle');
  return svg(w, h, 'Een blok met zijn onderdelen: bovenaan de haak of het oog, de wangen die samen het huis vormen, binnenin de schijf met het spoor waar het touw in ligt, de nagel waar de schijf om draait, en onderaan het hondsvot; het touw heet de loper', uit);
}

/** A tackle in a schematic drawing: the sheaves side by side, n parts of rope carrying the lower block (or the load,
 *  for n = 1). The dead end is on the upper block when n is even, on the lower one when n is odd. */
function takel(n, x0, { titel = '', klein = false } = {}) {
  const r = 15; const D = 2 * r; const yT = 74; const yB = 214; const t = (k) => x0 + (k - 1) * D;
  const boven = n % 2 === 0;
  const top = []; const onder = [];
  for (let k = 1; k <= n; k++) ((boven ? k % 2 === 0 : k % 2 === 1) ? top : onder).push(t(k) + r);
  let uit = '';
  // the beam it hangs from, and the upper block
  const tl = Math.min(...top, ...(boven ? [t(1) + r] : [])) - r - 9; const tr = Math.max(...top) + r + 9;
  uit += `<path d="M${P((tl + tr) / 2, 24)}V${yT - r - 10}" class="sj-metaal-lijn" stroke-width="4"/>`;
  uit += `<rect x="${tl}" y="${yT - r - 10}" width="${tr - tl}" height="${2 * r + 20}" rx="12" class="sj-metaal"/>`;
  for (const x of top) uit += `<circle cx="${x}" cy="${yT}" r="${r}" class="sj-hout-licht"/><circle cx="${x}" cy="${yT}" r="3" class="sj-metaal-licht"/>`;
  // the lower block (or only a hook on the load)
  const yLast = n === 1 ? yB + 10 : yB + r + 34;
  if (onder.length) {
    const bl = Math.min(...onder, ...(boven ? [] : [t(1) + r])) - r - 9; const br = Math.max(...onder) + r + 9;
    uit += `<rect x="${bl}" y="${yB - r - 10}" width="${br - bl}" height="${2 * r + 20}" rx="12" class="sj-metaal"/>`;
    for (const x of onder) uit += `<circle cx="${x}" cy="${yB}" r="${r}" class="sj-hout-licht"/><circle cx="${x}" cy="${yB}" r="3" class="sj-metaal-licht"/>`;
    uit += `<path d="M${P((bl + br) / 2, yB + r + 10)}V${yLast}" class="sj-metaal-lijn" stroke-width="4"/>`;
  }
  const lx = n === 1 ? t(1) : (Math.min(...onder, ...(boven ? [] : [t(1) + r])) + Math.max(...onder)) / 2;
  uit += `<rect x="${lx - 26}" y="${yLast}" width="52" height="34" rx="4" class="sj-last"/>` + tekst(lx, yLast + 21, 'last', { maat: 10.5 });
  // the rope: from the hondsvot, along the parts, round the sheaves, out as the haalkant
  let d;
  if (n === 1) d = `M${P(t(1), yLast)}`;
  else if (boven) d = `M${P(t(1), yT + r + 18)}`;
  else d = `M${P(t(1), yB - r - 18)}`;
  for (let k = 1; k <= n; k++) {
    const opTop = boven ? k % 2 === 0 : k % 2 === 1;
    d += opTop ? `L${P(t(k), yT)}A${r} ${r} 0 0 1 ${P(t(k + 1), yT)}` : `L${P(t(k), yB)}A${r} ${r} 0 0 0 ${P(t(k + 1), yB)}`;
  }
  d += `L${P(t(n + 1), 296)}`;
  uit += touw(d, 5);
  if (n > 1) uit += `<circle cx="${t(1)}" cy="${boven ? yT + r + 14 : yB - r - 14}" r="4.5" fill="none" class="sj-metaal-lijn" stroke-width="3"/>`;
  // number the parts that carry
  for (let k = 1; k <= n; k++) uit += nummer(t(k), (yT + yB) / 2 + (k % 2 ? -12 : 12), k);
  uit += pijl(t(n + 1) + 14, 262, t(n + 1) + 14, 296) + tekst(t(n + 1) + 20, 284, 'haalkant', { maat: 10, anker: 'start' });
  if (titel) uit += tekst((tl + tr) / 2 + (klein ? 0 : 0), 14, titel, { maat: 11.5, klasse: 'vet' });
  return uit;
}
const BALK = (w) => paal(10, 24, w - 10, 24, 14, { kop1: true, kop2: true });

function jol() {
  const w = 360; const h = 320;
  let uit = BALK(w) + takel(1, 70, { titel: 'enkele jol' }) + takel(2, 220, { titel: 'dubbele jol' });
  uit += tekst(88, 312, '1 touwpart: 10 kg kost 10 kg', { maat: 10.5 }) + tekst(260, 312, '2 touwparten: je trekt de helft', { maat: 10.5 });
  return svg(w, h, 'Links een enkele jol: één vast blok, het touw over de schijf, één touwpart draagt de last. Rechts een dubbele jol: het hondsend aan het bovenste blok, het touw om de schijf van het onderste blok en over de schijf van het bovenste; twee touwparten dragen de last', uit);
}
function derdehand() {
  const w = 320; const h = 320;
  let uit = BALK(w) + takel(3, 100);
  uit += tekst(160, 312, '3 touwparten: je trekt een derde', { maat: 10.5 });
  return svg(w, h, 'Derdehandtakel: boven een blok met twee schijven, onder een blok met één schijf; het hondsend zit aan het onderste blok, het touw loopt over de eerste schijf boven, om de schijf onder en over de tweede schijf boven naar de haalkant; drie touwparten dragen de last', uit);
}
function vierloper() {
  const w = 320; const h = 320;
  let uit = BALK(w) + takel(4, 86);
  uit += tekst(160, 312, '4 touwparten: je trekt een kwart', { maat: 10.5 });
  return svg(w, h, 'Vierlopertakel: twee blokken met elk twee schijven; het hondsend zit aan het bovenste blok, het touw loopt om en om over de schijven onder en boven naar de haalkant; vier touwparten dragen de last', uit);
}

/** Shackles, a lifting sling and a snatch block. */
function hijsmateriaal() {
  const w = 360; const h = 210;
  let uit = '';
  // D-sluiting
  uit += `<path d="M30 60V122a18 18 0 0 0 36 0V60" fill="none" class="sj-metaal-lijn" stroke-width="8"/><path d="M30 60V122a18 18 0 0 0 36 0V60" fill="none" style="stroke: var(--sj-metaal); stroke-width: 5"/>`;
  uit += `<rect x="20" y="52" width="56" height="10" rx="5" class="sj-metaal"/><circle cx="24" cy="57" r="6" class="sj-metaal"/>`;
  // harpsluiting
  uit += `<path d="M112 60C78 94 88 146 128 148C168 146 178 94 144 60" fill="none" class="sj-metaal-lijn" stroke-width="8"/><path d="M112 60C78 94 88 146 128 148C168 146 178 94 144 60" fill="none" style="stroke: var(--sj-metaal); stroke-width: 5"/>`;
  uit += `<rect x="102" y="52" width="52" height="10" rx="5" class="sj-metaal"/><circle cx="106" cy="57" r="6" class="sj-metaal"/>`;
  // hijsband: a flat loop
  uit += `<rect x="190" y="44" width="40" height="112" rx="20" fill="none" class="sj-band-rand" stroke-width="13"/><rect x="190" y="44" width="40" height="112" rx="20" fill="none" class="sj-band" stroke-width="10"/>`;
  // klapblok: one wang swung open
  uit += `<rect x="270" y="66" width="56" height="84" rx="26" class="sj-metaal"/><circle cx="298" cy="108" r="20" class="sj-hout-licht"/><circle cx="298" cy="108" r="3" class="sj-metaal-licht"/>`;
  uit += `<path d="M298 108L338 74l10 10z" class="sj-metaal" style="opacity: 0.85"/>`;
  uit += `<path d="M298 66V44" class="sj-metaal-lijn" stroke-width="4"/>`;
  uit += wijs(36, 30, 'pen', 26, 54, 'middle');
  uit += pijl(348, 132, 330, 120);
  uit += tekst(48, 182, 'D-sluiting', { maat: 10.5 }) + tekst(128, 182, 'harpsluiting', { maat: 10.5 }) + tekst(210, 182, 'hijsband', { maat: 10.5 }) + tekst(304, 182, 'klapblok', { maat: 10.5 });
  uit += tekst(304, 196, 'wang klapt open', { maat: 9.5, klasse: 'stil' });
  return svg(w, h, 'Hijsmateriaal: een D-sluiting met een rechte beugel en een schroefpen, een harpsluiting met een bolle beugel en pen, een hijsband als platte lus, en een klapblok waarvan een wang openklapt om het touw erin te leggen', uit);
}

// ---- verankeren ----

/** One picket, slanting away from the pull, the rope low. */
function piket() {
  const w = 320; const h = 210; const gy = 128;
  let uit = grond(gy, w);
  uit += paal(152, 196, 126, 54, 18, { kop2: true });
  uit += `<rect x="0" y="${gy + 1}" width="${w}" height="80" class="sj-grond-over"/>`;
  uit += touw(lijn([[312, 116], [146, 120]]), 6);
  uit += touw(lijn([[136, 112], [154, 118]]), 6) + touw(lijn([[137, 120], [155, 126]]), 6);
  uit += pijl(262, 98, 304, 98, { kracht: true }) + tekst(284, 88, 'trek', { maat: 10.5 });
  uit += `<path d="M126 54L118 14" class="sj-maat" stroke-dasharray="3 3"/>`;
  uit += wijs(60, 30, 'kop van de trek af', 128, 60, 'middle');
  uit += wijs(220, 168, 'touw laag, bij de grond', 152, 122, 'middle');
  uit += wijs(64, 186, 'het meeste in de grond', 140, 176, 'middle');
  return svg(w, h, 'Een piket: schuin in de grond geslagen met de kop van de trek af, het meeste in de grond, en het touw laag aan de piket, vlak bij de grond', uit);
}

/** A row of three pickets, each head tied to the foot of the next one. */
function haringenSerie() {
  const w = 360; const h = 220; const gy = 126;
  let uit = grond(gy, w, 94);
  const voet = [[96, 200], [186, 200], [276, 200]]; const kop = [[76, 52], [166, 52], [256, 52]];
  for (let i = 0; i < 3; i++) uit += paal(voet[i][0], voet[i][1], kop[i][0], kop[i][1], 18, { kop2: true });
  uit += `<rect x="0" y="${gy + 1}" width="${w}" height="94" class="sj-grond-over"/>`;
  for (let i = 2; i > 0; i--) {
    const a = [kop[i][0] + 3, kop[i][1] + 14]; const b = [voet[i - 1][0] - 9, gy - 4];
    for (const o of [-3, 3]) uit += touw(lijn([[a[0], a[1] + o], [b[0], b[1] + o]]), 4.5);
    uit += touw(lijn([[a[0] + (b[0] - a[0]) * 0.45 - 4, a[1] + (b[1] - a[1]) * 0.45 - 7], [a[0] + (b[0] - a[0]) * 0.45 + 4, a[1] + (b[1] - a[1]) * 0.45 + 7]]), 4.5);
    uit += touw(lijn([[a[0] + (b[0] - a[0]) * 0.55 - 4, a[1] + (b[1] - a[1]) * 0.55 - 7], [a[0] + (b[0] - a[0]) * 0.55 + 4, a[1] + (b[1] - a[1]) * 0.55 + 7]]), 4.5);
  }
  uit += touw(lijn([[352, 116], [270, 120]]), 6) + touw(lijn([[262, 112], [280, 118]]), 6) + touw(lijn([[263, 120], [281, 126]]), 6);
  uit += pijl(312, 96, 350, 96, { kracht: true }) + tekst(331, 86, 'trek', { maat: 10.5 });
  uit += wijs(352, 30, 'voorste piket: de meeste kracht', 258, 58, 'end');
  uit += wijs(8, 200, 'kop naar de voet van de volgende', 186, 104, 'start');
  uit += wijs(8, 50, 'slingersjorring', 126, 92, 'start');
  return svg(w, h, 'Haringen in serie: drie piketten op een rij, schuin van de trek af; het touw van de last zit laag aan de voorste, en de kop van elke piket is met een slingersjorring verbonden met de voet van de volgende', uit);
}

/** A buried balk as anchor, in section. */
function dodeMan() {
  const w = 340; const h = 230; const gy = 70;
  let uit = `<rect x="0" y="${gy}" width="${w}" height="${h - gy}" class="sj-aarde"/><path d="M0 ${gy}H${w}" class="sj-maaiveld"/>`;
  // the trench, filled again and tamped; the side towards the load stays untouched, and a narrow slot leads the rope
  uit += `<path d="M78 ${gy}V204H138V176L240 ${gy}H218L138 150V${gy}Z" class="sj-grond"/>`;
  uit += `<path d="M78 ${gy}V204H138V176L240 ${gy}M218 ${gy}L138 150V${gy}" class="sj-onder"/>`;
  uit += paal(142, 132, 142, 214, 12, { kop1: true });
  uit += touw(lijn([[116, 184], [229, 72], [330, 34]]), 6);
  uit += kopVanBoven(116, 184, 20);
  uit += pijl(282, 30, 324, 14, { kracht: true }) + tekst(322, 62, 'trek', { maat: 10.5 });
  uit += wijs(8, 30, 'sleuf weer dicht en aangestampt', 100, 100, 'start');
  uit += wijs(8, 222, 'balk, dwars op de trek', 110, 200, 'start');
  uit += wijs(250, 210, 'piket voor de balk', 146, 196, 'middle');
  uit += wijs(332, 124, 'touw door een schuine geul', 196, 112, 'end');
  return svg(w, h, 'Dode man, in doorsnede: een balk ligt dwars op de trek diep in een sleuf, tegen de vaste grond aan de kant van de last, met een piket ervoor in de vaste grond; het touw komt door een smalle schuine geul in de richting van de last naar boven, en de sleuf is weer dichtgegooid en aangestampt', uit);
}

/** A tree as anchor: rope low round the trunk, over a protection. */
function boomanker() {
  const w = 320; const h = 260; const gy = 224;
  let uit = grond(gy, w, 36);
  uit += `<path d="M106 ${gy}Q120 ${gy - 20} 120 ${gy - 60}V10H180V${gy - 60}Q180 ${gy - 20} 196 ${gy}Z" class="sj-stam"/>`;
  for (const [x, y1, y2] of [[132, 24, 90], [150, 60, 150], [166, 20, 110], [140, 120, 150], [160, 180, 190]]) uit += `<path d="M${x} ${y1}V${y2}" class="sj-schors"/>`;
  uit += `<rect x="114" y="160" width="72" height="40" rx="6" class="sj-jute"/>`;
  for (let x = 120; x < 184; x += 8) uit += `<path d="M${x} 162V198" class="sj-jute-lijn"/>`;
  uit += touw(lijn([[116, 178], [184, 182]]), 7) + touw(`M${P(184, 176)}L${P(312, 168)}`, 7) + touw(`M${P(184, 186)}L${P(312, 186)}`, 7);
  uit += pijl(262, 150, 306, 150, { kracht: true }) + tekst(284, 140, 'trek', { maat: 10.5 });
  uit += wijs(60, 120, 'jute of een oude mat', 118, 170, 'middle');
  uit += wijs(256, 236, 'laag bij de grond', 184, 196, 'middle');
  uit += `<path d="M120 46H180M120 40v12M180 40v12" class="sj-maat"/>` + tekst(222, 50, '≥ 30 cm dik', { maat: 10.5 });
  return svg(w, h, 'Een boom als anker: een levende boom van minstens 30 centimeter dik; het touw laag om de stam, vlak bij de grond, over een boombescherming van jute of een oude mat', uit);
}

/** A mast with its tuien to pickets. */
function tuien() {
  const w = 320; const h = 290; const gy = 252;
  let uit = grond(gy, w, 38);
  uit += `<path d="M164 60L184 270" class="sj-wijs" stroke-dasharray="5 4"/>`;
  uit += touw(lijn([[156, 58], [44, 244]]), 4.5) + touw(lijn([[164, 58], [276, 244]]), 4.5);
  uit += paal(160, gy + 8, 160, 18, 18, { kop2: true });
  uit += mastworpStaand(160, 52, 18, { staart: 0 });
  for (const x of [38, 282]) uit += paal(x + (x < 160 ? 6 : -6), gy + 14, x - (x < 160 ? 6 : -6), gy - 18, 9, { kop2: true });
  uit += wijs(8, 30, 'mastworp hoog aan de mast', 150, 58, 'start');
  uit += wijs(268, 112, 'tui', 232, 172, 'middle');
  uit += wijs(312, 230, 'derde tui naar achteren', 182, 262, 'end');
  uit += wijs(56, 280, 'anker', 40, 244, 'middle');
  return svg(w, h, 'Tuien: een mast met touwen van hoog aan de mast schuin naar ankers in de grond, in drie richtingen rondom, met een mastworp aan de mast', uit);
}

/** A tree pulled by a bridge, guyed back to a second tree. */
function bomenTuien() {
  const w = 360; const h = 250; const gy = 214;
  let uit = grond(gy, w, 36);
  const boom = (x, s) => `<circle cx="${x}" cy="${46 * s + 20}" r="${50 * s}" class="sj-kruin"/>`
    + `<path d="M${x - 16 * s} ${gy}Q${x - 10 * s} ${gy - 16} ${x - 10 * s} ${gy - 40}V${60 * s}H${x + 10 * s}V${gy - 40}Q${x + 10 * s} ${gy - 16} ${x + 16 * s} ${gy}Z" class="sj-stam"/>`;
  uit += boom(76, 0.85) + boom(246, 1.1);
  uit += `<rect x="232" y="90" width="28" height="16" rx="3" class="sj-jute"/><rect x="62" y="186" width="28" height="16" rx="3" class="sj-jute"/>`;
  uit += touw(lijn([[236, 98], [86, 194]]), 5);
  uit += touw(lijn([[258, 190], [354, 184]]), 6) + `<rect x="232" y="182" width="28" height="16" rx="3" class="sj-jute"/>`;
  uit += pijl(304, 162, 348, 162, { kracht: true }) + tekst(326, 152, 'brug', { maat: 10.5 });
  uit += wijs(178, 40, 'tui hoog aan de boom', 210, 112, 'middle');
  uit += wijs(60, 240, 'laag aan de tweede boom', 86, 196, 'start');
  return svg(w, h, 'Bomen tuien: de boom waar een brug aan trekt, wordt hoger aan de stam met een tui de andere kant op vastgezet, laag aan een tweede boom; om beide bomen boombescherming', uit);
}

// ---- materiaal ----

function pionierpaal() {
  const w = 360; const h = 160;
  let uit = paal(24, 76, 336, 76, 36, { kop1: true, kop2: true, d2: 24 });
  uit += `<path d="M34 58.6V93.4h8V58.6z" class="sj-verf-a"/><path d="M318 64.3v23.4h8V64.3z" class="sj-verf-a"/>`;
  uit += `<path d="M44 58.9V93.1h6V58.9z" class="sj-verf-b"/><path d="M310 64.5v23h6v-23z" class="sj-verf-b"/>`;
  uit += wijs(70, 132, 'dikke kant: de voet', 30, 92, 'middle');
  uit += wijs(272, 134, 'dunne kant: minstens 8–10 cm', 334, 88, 'middle');
  uit += wijs(178, 30, 'kleurcode: lengte, jaar of groep', 314, 64, 'middle');
  return svg(w, h, 'Een pionierpaal: rond, zonder schors, met een dikke kant (de voet) en een dunne kant die voor een dragende paal minstens 8 tot 10 centimeter dik is, en een kleurcode van verfstreepjes op de uiteinden', uit);
}

function sjortouw() {
  const w = 320; const h = 200;
  // opgeschoten as in the drawing touw-opschieten, the start of the rope out to the right
  let uit = `<g transform="translate(-6 12) scale(0.8)">${opgeschotenBos({ begin: false })}</g>`;
  uit += touw(`M${P(108, 166)}C${P(150, 180)} ${P(200, 154)} ${P(240, 142)}S${P(266, 140)} ${P(276, 146)}`, 6);
  uit += `<path d="M${P(270, 140)}l10 9" class="sj-touw-rand" stroke-width="7.5"/>`;
  uit += eind(282, 150, 40, 6);
  uit += wijs(312, 30, '5 tot 7 meter, opgeschoten', 128, 110, 'end');
  uit += wijs(312, 190, 'eind afgewerkt, met een puntje', 280, 152, 'end');
  uit += wijs(8, 30, '8 tot 12 mm dik', 78, 130, 'start');
  return svg(w, h, 'Een sjortouw van 8 tot 12 millimeter dik en 5 tot 7 meter lang, opgeschoten, met een afgewerkt eind met een puntje', uit);
}

function houtControleren() {
  const w = 360; const h = 220;
  let uit = paal(20, 120, 340, 120, 40, { kop1: true, kop2: true });
  uit += `<path d="M80 101l10 6 -4 6 12 5 -6 5 10 6 -8 6 6 4 -12 -3 4 -6 -10 -5 5 -6 -11 -5z" class="sj-scheur"/>`;
  uit += `<ellipse cx="186" cy="124" rx="34" ry="14" class="sj-rot"/>`;
  // the knock: a hammer on the sound part, and what you hear on each part
  uit += `<path d="M300 86L336 30" style="stroke: var(--sj-hout-rand); stroke-width: 7; stroke-linecap: round"/><path d="M300 86L336 30" style="stroke: var(--sj-hout); stroke-width: 4.5; stroke-linecap: round"/>`;
  uit += `<rect x="284" y="78" width="34" height="18" rx="3" transform="rotate(33 301 87)" class="sj-metaal"/>`;
  uit += tekst(186, 88, 'doef', { maat: 12, klasse: 'vet rood-tekst' }) + tekst(262, 84, 'tok', { maat: 12, klasse: 'vet accent-tekst' });
  uit += wijs(8, 30, 'scheur: past er een vinger in, dan afkeuren', 90, 106, 'start');
  uit += wijs(186, 196, 'rot: zacht en donker, klinkt dof', 186, 132, 'middle');
  uit += wijs(352, 172, 'gezond: klinkt helder', 300, 132, 'end');
  return svg(w, h, 'Pionierhout controleren: een paal met een scheur waar een vinger in past (afkeuren) en een rotte plek die zacht en donker is; kloppen met een hamer: gezond hout klinkt helder (tok), rot klinkt dof (doef)', uit);
}

function houtOpslag() {
  const w = 360; const h = 230; const gy = 200;
  let uit = grond(gy, w, 30);
  for (const x of [74, 286]) uit += paal(x, gy + 6, x, 66, 10);
  uit += `<path d="M44 74L316 50" class="sj-hout" stroke-width="2" style="stroke-width: 10; stroke: var(--sj-hout-rand)"/>`;
  uit += `<path d="M44 74L316 50" style="stroke: var(--sj-hout-licht); stroke-width: 7"/>`;
  for (const x of [110, 250]) uit += `<rect x="${x - 6}" y="168" width="12" height="32" class="sj-hout"/>`;
  for (let rij = 0; rij < 3; rij++) for (let i = 0; i < 9 - rij; i++) uit += kopVanBoven(112 + i * 17 + rij * 8.5, 158 - rij * 16, 8);
  for (let i = 0; i < 7; i++) uit += `<path d="M${16 + i * 6} ${20 + i * 3}l-4 14" class="sj-regen"/><path d="M${326 + (i % 3) * 8} ${20 + i * 6}l-4 14" class="sj-regen"/>`;
  uit += pijl(26, 126, 74, 126) + pijl(26, 142, 74, 142) + pijl(290, 134, 340, 134);
  uit += wijs(180, 22, 'uit de regen: onder een afdak', 180, 60, 'middle');
  uit += wijs(36, 186, 'wind erdoor', 46, 136, 'middle');
  uit += wijs(186, 222, 'van de grond, op dwarsliggers', 110, 180, 'start');
  return svg(w, h, 'Pionierhout opslaan: de palen liggen onder een afdak, uit de regen, op dwarsliggers van de grond, en de wind kan er doorheen waaien', uit);
}

function wig() {
  const w = 300; const h = 260; const d = 30;
  let uit = paal(122, 250, 122, 14, d, { kop2: true }) + paal(152, 250, 152, 14, d, { kop2: true });
  for (let i = 0; i < 7; i++) { const y = 124 + i * 5; const s = i % 2 ? -2 : 2; uit += touw(lijn([[104, y - s], [170, y + s]]), 5); }
  uit += `<path d="M131 92h14l-7 62z" class="sj-hout-licht"/>`;
  uit += pijl(138, 46, 138, 86);
  uit += wijs(234, 60, 'van boven naar beneden', 140, 66, 'middle');
  uit += wijs(234, 112, 'wig', 143, 104, 'middle');
  uit += wijs(292, 196, 'trekt alle slagen strak', 168, 150, 'end');
  return svg(w, h, 'Een wig: een driehoekig stuk hout dat van boven naar beneden tussen de palen en de slagen van een sjorring is geslagen, zodat alle slagen strak staan', uit);
}

function gereedschap() {
  const w = 360; const h = 190;
  let uit = '';
  // moker
  uit += paal(46, 150, 46, 60, 7) + `<rect x="24" y="44" width="44" height="22" rx="3" class="sj-metaal"/>`;
  // grondboor
  uit += `<path d="M110 52H150M130 52V128" class="sj-metaal-lijn" stroke-width="5"/>`;
  uit += `<path d="M130 128l-10 6 20 6 -20 6 20 6 -10 6" fill="none" class="sj-metaal-lijn" stroke-width="3"/>`;
  // spade
  uit += paal(196, 120, 196, 46, 7) + `<path d="M186 46h20M182 120h28v24q-14 12 -28 0z" class="sj-metaal"/>`;
  // wig
  uit += `<path d="M244 70h24l-12 70z" class="sj-hout-licht"/>`;
  // ladder
  uit += `<path d="M300 40L292 150M336 40L344 150" class="sj-metaal-lijn" stroke-width="5"/>`;
  for (let i = 0; i < 5; i++) uit += `<path d="M${299 - i * 1.6} ${56 + i * 22}H${337 + i * 1.6}" class="sj-metaal-lijn" stroke-width="4"/>`;
  uit += tekst(46, 176, 'moker', { maat: 10.5 }) + tekst(130, 176, 'grondboor', { maat: 10.5 }) + tekst(196, 176, 'spade', { maat: 10.5 })
    + tekst(256, 176, 'wig', { maat: 10.5 }) + tekst(318, 176, 'ladder', { maat: 10.5 });
  return svg(w, h, 'Pioniergereedschap: een moker, een grondboor, een spade, een wig en een ladder', uit);
}

// ---- krachten ----

function doorhang() {
  const w = 360; const h = 210;
  let uit = '';
  for (const x of [22, 338]) uit += paal(x, 190, x, 40, 14, { kop2: true });
  uit += `<path d="M22 56L338 56" class="sj-hulp"/>`;
  uit += touw(lijn([[24, 56], [180, 104], [336, 56]]), 5);
  uit += `<path d="M180 104V128" class="sj-metaal-lijn" stroke-width="3"/><rect x="156" y="128" width="48" height="36" rx="4" class="sj-last"/>` + tekst(180, 151, '50 kg', { maat: 11, klasse: 'vet' });
  uit += `<path d="M180 56V104M174 56h12" class="sj-maat"/>` + tekst(174, 80, 'doorhang', { maat: 10.5, anker: 'end' });
  uit += pijl(124, 87, 52, 65, { kracht: true }) + pijl(236, 87, 308, 65, { kracht: true });
  uit += tekst(80, 96, 'kracht in het touw', { maat: 10.5, klasse: 'rood-tekst' });
  uit += tekst(180, 40, 'strakker = veel meer kracht', { maat: 10.5, klasse: 'accent-tekst' });
  uit += pijl(180, 172, 180, 200, { kracht: true });
  return svg(w, h, 'Krachten in een strak touw: een last van 50 kilo in het midden van een gespannen touw tussen twee palen; hoe minder het touw doorhangt, hoe groter de kracht in het touw en op de ankers', uit);
}

// ---- veilig bouwen ----

/** A small person standing with the feet at (x, y), about 56 px tall; `armen` as [[dx, dy], [dx, dy]] for the hands
 *  (from the shoulders), `helm` puts a helmet on. */
function poppetje(x, y, { armen = [[-10, 22], [10, 22]], helm = false, klasse = '' } = {}) {
  const sx = x; const sy = y - 40;
  let uit = `<circle cx="${r1(x)}" cy="${r1(y - 50)}" r="6.5" class="vol ${klasse}"/>`;
  uit += `<path d="M${P(x, y - 43)}V${r1(y - 20)}M${P(x, y - 20)}L${P(x - 7, y)}M${P(x, y - 20)}L${P(x + 7, y)}`
    + armen.map(([dx, dy]) => `M${P(sx, sy)}L${P(sx + dx, sy + dy)}`).join('') + `" class="lijn dik ${klasse}"/>`;
  if (helm) uit += `<path d="M${P(x - 8, y - 50)}a8 8 0 0 1 16 0z" class="accent"/>`;
  return uit;
}
/** A tree from the side: a crown and a trunk standing on the ground at gy, the trunk w wide. */
function boomZij(x, gy, top, w = 22) {
  return `<circle cx="${x}" cy="${top + 4}" r="${w * 1.5}" class="sj-kruin"/><circle cx="${x - w * 0.9}" cy="${top + w * 1.1}" r="${w}" class="sj-kruin"/>`
    + `<circle cx="${x + w * 0.9}" cy="${top + w * 1.1}" r="${w}" class="sj-kruin"/>`
    + `<path d="M${x - w / 2 - 5} ${gy}Q${x - w / 2} ${gy - 8} ${x - w / 2} ${gy - 24}V${top + w}H${x + w / 2}V${gy - 24}Q${x + w / 2} ${gy - 8} ${x + w / 2 + 5} ${gy}Z" class="sj-stam"/>`;
}
/** Jute round a trunk at x (w wide), from y1 to y2. */
const jute = (x, w, y1, y2) => `<rect x="${x - w / 2 - 2}" y="${y1}" width="${w + 4}" height="${y2 - y1}" rx="3" class="sj-jute"/>`;
/** A rope from a to b that hangs through the point m: two straight parts, as a loaded rope does. */
const hangend = (a, m, b, dik = 5) => touw(lijn([a, m, b]), dik);

/** A rope course from the side: two thick trees with protection, a walking rope and a hand rope that both hang a
 *  little, a scout on it, a leader watching, soft ground under it; and from above: never over a road or path. */
function touwbaan() {
  const w = 360; const h = 336; const gy = 224;
  let uit = grond(gy, w, 14);
  uit += boomZij(36, gy, 26, 22) + boomZij(324, gy, 26, 22);
  for (const x of [36, 324]) uit += jute(x, 22, 96, 116) + jute(x, 22, 142, 162);
  const lt = [[47, 152], [180, 178], [313, 152]];
  const ht = [[47, 106], [180, 132], [313, 106]];
  uit += `<path d="M47 152H313" class="sj-hulp"/>`;
  uit += hangend(...lt) + hangend(...ht);
  uit += poppetje(180, 176, { armen: [[-11, 7], [11, 7]] });
  uit += `<path d="M110 152V164.5" class="sj-maat"/><path d="M105 152h10M105 164.5h10" class="sj-maat"/>`;
  uit += wijs(140, 202, 'speling: laat hem doorhangen', 112, 162, 'middle');
  uit += wijs(180, 18, 'dikke, levende boom met boombescherming', 314, 104, 'middle');
  uit += poppetje(244, gy + 12, { armen: [[-8, 22], [8, 22]] });
  uit += tekst(232, 222, 'toezicht', { maat: 10.5, anker: 'end' });
  uit += tekst(180, 246, 'zachte grond, niets eronder', { maat: 10.5, klasse: 'stil' });
  // from above: the rope may not cross a road or path
  uit += `<rect x="16" y="282" width="180" height="26" class="vlak2"/><path d="M16 282H196M16 308H196" class="lijn dun stil"/>`;
  uit += `<path d="M22 295H190" class="lijn dun stil" stroke-dasharray="8 6"/>`;
  uit += `<circle cx="106" cy="268" r="9" class="sj-kruin"/><circle cx="106" cy="322" r="9" class="sj-kruin"/>`;
  uit += `<path d="M106 277V313" class="sj-touw-rand" stroke-width="5"/><path d="M106 277V313" class="sj-touw-lijf" stroke-width="3"/>`;
  uit += fout(106, 295);
  uit += tekst(206, 286, 'nooit over een weg,', { maat: 10.5, anker: 'start' }) + tekst(206, 300, 'fietspad of voetpad', { maat: 10.5, anker: 'start' });
  uit += tekst(206, 314, '(van boven gezien)', { maat: 9.5, anker: 'start', klasse: 'stil' });
  return svg(w, h, 'Een veilige touwbaan van opzij: een looptouw en een handtouw tussen twee dikke, levende bomen met boombescherming; beide touwen hangen wat door en zijn niet snaarstrak; een scout loopt erop, iemand van de leiding houdt toezicht, en eronder is zachte grond zonder obstakels. Van boven gezien: een touwbaan loopt nooit over een weg, fietspad of voetpad', uit);
}

/** A side of a tower as a frame: two poles from a to b, d apart, with three rungs and a brace. */
function raam([ax, ay], [bx, by], d = 22) {
  const l = Math.hypot(bx - ax, by - ay); const nx = (-(by - ay) / l) * d / 2; const ny = ((bx - ax) / l) * d / 2;
  let uit = paal(ax + nx, ay + ny, bx + nx, by + ny, 7) + paal(ax - nx, ay - ny, bx - nx, by - ny, 7);
  for (const f of [0.1, 0.5, 0.9]) {
    const x = ax + (bx - ax) * f; const y = ay + (by - ay) * f;
    uit += paal(x + nx * 1.5, y + ny * 1.5, x - nx * 1.5, y - ny * 1.5, 5);
  }
  const p = (f, s) => [ax + (bx - ax) * f + nx * s, ay + (by - ay) * f + ny * s];
  uit += paal(...p(0.1, 1), ...p(0.5, -1), 4) + paal(...p(0.5, 1), ...p(0.9, -1), 4);
  return uit;
}
/** High objects: build them lying on the ground, pull them upright with nobody underneath, then guy them, with sand
 *  at the foot. */
function hoogBouwen() {
  const w = 360; const h = 262; const gy = 206;
  let uit = grond(gy, w, 24);
  for (const x of [120, 240]) uit += `<path d="M${x} 30V${gy - 4}" class="lijn haar"/>`;
  // 1: lying
  uit += nummer(16, 24, 1) + raam([12, gy - 12], [108, gy - 12], 18);
  // 2: being raised round its foot, pulled to an anchor, held back by a second line
  uit += `<path d="M203 ${gy}L145 ${gy}L150 115Z" class="cirkel"/><path d="M203 ${gy}L145 ${gy}L150 115" class="lijn rood-lijn" stroke-dasharray="4 3"/>`;
  uit += raam([200, gy - 6], [150, 115], 16);
  uit += touw(lijn([[150, 110], [232, gy - 4]]), 4) + touw(lijn([[146, 112], [128, gy - 4]]), 3.5);
  uit += paal(236, gy + 8, 230, gy - 12, 6, { kop2: true }) + paal(126, gy + 8, 130, gy - 12, 6, { kop2: true });
  uit += pijl(214, 172, 228, 188) + nummer(136, 24, 2);
  // 3: upright, with guys and sand
  uit += `<path d="M268 ${gy}Q300 ${gy - 18} 332 ${gy}Z" class="sj-zand"/>`;
  uit += raam([300, gy - 2], [300, 70], 16);
  uit += touw(lijn([[296, 74], [250, gy - 4]]), 3.5) + touw(lijn([[304, 74], [350, gy - 4]]), 3.5);
  uit += paal(254, gy + 8, 248, gy - 12, 6, { kop2: true }) + paal(346, gy + 8, 352, gy - 12, 6, { kop2: true });
  uit += nummer(256, 24, 3);
  uit += tekst(60, 228, 'liggend bouwen,', { maat: 10.5 }) + tekst(60, 242, 'op de grond', { maat: 10.5 });
  uit += tekst(180, 228, 'overeind trekken,', { maat: 10.5 }) + tekst(180, 242, 'niemand eronder', { maat: 10.5 });
  uit += tekst(300, 228, 'tuien vast,', { maat: 10.5 }) + tekst(300, 242, 'zand eronder', { maat: 10.5 });
  return svg(w, h, 'Hoog bouwen in drie stappen: 1, de zijkant van een toren liggend op de grond bouwen; 2, hem om zijn voet overeind trekken met een touw naar een anker, met een tweede touw dat tegenhoudt, en niemand in de strook waar hij kan vallen; 3, staand, met tuien naar ankers en zand onder de voet', uit);
}

/** Temporary and permanent: a pioneered swing for a camp (no inspection, but zorgplicht) next to a playground climbing
 *  frame that stays (inspected, a logbook, at most 3 m free fall). */
function tijdelijkVast() {
  const w = 360; const h = 238; const gy = 168;
  let uit = grond(gy, w, 14);
  uit += `<path d="M180 20V${gy - 4}" class="lijn haar"/>`;
  // left: two A-frames with a top beam and a swing, in pioneer wood
  for (const x of [40, 140]) uit += paal(x - 22, gy, x + 4, 46, 8, { kop2: true }) + paal(x + 22, gy, x - 4, 46, 8, { kop2: true });
  uit += paal(26, 58, 154, 58, 9, { kop1: true, kop2: true });
  uit += `<path d="M76 62V128M104 62V128" class="sj-touw-rand" stroke-width="3.6"/><path d="M76 62V128M104 62V128" class="sj-touw-lijf" stroke-width="2"/>`;
  uit += `<rect x="70" y="128" width="40" height="7" rx="2" class="sj-hout-licht"/>`;
  uit += tekst(90, 20, 'op kamp gepionierd', { maat: 11, klasse: 'vet' });
  uit += tekst(90, 194, 'tijdelijk: geen keuring,', { maat: 10.5 }) + tekst(90, 208, 'wel zorgplicht', { maat: 10.5, klasse: 'vet' });
  // right: a fixed climbing frame with a platform, its free fall height marked
  uit += `<path d="M216 ${gy}V60M300 ${gy}V60M216 92H300M216 60H300" class="lijn dik stil"/>`;
  for (let y = 112; y < gy; y += 18) uit += `<path d="M216 ${y}H236" class="lijn stil"/>`;
  uit += `<path d="M300 92L344 ${gy}" class="lijn dik stil"/>`;
  uit += `<path d="M206 92V${gy}M201 92h10M201 ${gy}h10" class="sj-maat"/>`;
  uit += tekst(200, 134, 'max.', { maat: 9.5, anker: 'end' }) + tekst(200, 146, '3 m', { maat: 10.5, anker: 'end', klasse: 'vet' });
  uit += `<rect x="252" y="112" width="30" height="38" rx="2" class="vlak"/><rect x="252" y="112" width="30" height="38" rx="2" class="lijn dun"/>`;
  for (let y = 122; y < 146; y += 7) uit += `<path d="M257 ${y}h20" class="lijn haar"/>`;
  uit += tekst(267, 108, 'logboek', { maat: 9.5, klasse: 'stil' });
  uit += tekst(270, 20, 'vast speeltoestel', { maat: 11, klasse: 'vet' });
  uit += tekst(270, 194, 'blijft staan: gekeurd,', { maat: 10.5 }) + tekst(270, 208, 'met een logboek', { maat: 10.5 });
  uit += tekst(180, 230, 'die 3 meter komt uit de regels voor vaste speeltoestellen', { maat: 9.5, klasse: 'stil' });
  return svg(w, h, 'Tijdelijk of vast. Links een schommel die op kamp is gepionierd: tijdelijk, dus geen keuring, wel zorgplicht. Rechts een vast speeltoestel dat blijft staan: dat moet gekeurd zijn, de beheerder houdt een logboek bij, en iemand mag er niet meer dan 3 meter vrij vanaf kunnen vallen', uit);
}

/** A small block (as in blok()) at (cx, cy), r the sheave; `soort` the fault shown. */
function blokje(cx, cy, soort) {
  const r = 20;
  let uit = '';
  const haak = soort === 'krom'
    ? `M${P(cx, cy - r - 12)}V${r1(cy - r - 20)}l14 -12l12 -2`
    : `M${P(cx, cy - r - 12)}V${r1(cy - r - 26)}q0 -10 9 -10q8 0 8 8`;
  uit += `<path d="${haak}" class="sj-metaal-lijn" stroke-width="5" fill="none"/><path d="${haak}" fill="none" style="stroke: var(--sj-metaal); stroke-width: 2.6"/>`;
  uit += `<rect x="${cx - r - 8}" y="${cy - r - 12}" width="${2 * r + 16}" height="${2 * r + 24}" rx="${r + 6}" class="sj-metaal"/>`;
  uit += `<circle cx="${cx}" cy="${cy}" r="${r}" class="sj-hout-licht"/><circle cx="${cx}" cy="${cy}" r="3.5" class="sj-metaal-licht"/>`;
  if (soort === 'scheur') uit += `<path d="M${P(cx + 3, cy - r)}l-5 7 4 4 -6 7" style="fill: none; stroke: #2a1a0b; stroke-width: 2.2"/>`;
  const dik = soort === 'dik' ? 13 : 6;
  uit += touw(`M${P(cx - r + dik / 2 - 3, cy + r + 30)}V${cy}A${r - dik / 2 + 3} ${r - dik / 2 + 3} 0 0 1 ${P(cx + r - dik / 2 + 3, cy)}V${r1(cy + r + 30)}`, dik);
  return uit;
}
/** Checking blocks: a good one, a cracked sheave, a bent hook, a rope too thick for the sheave. */
function blokKeuren() {
  const w = 360; const h = 200;
  let uit = '';
  const soorten = [['goed', 'draait soepel,', 'touw past'], ['scheur', 'scheur in', 'de schijf'], ['krom', 'kromme haak', ''], ['dik', 'touw te dik', 'voor het spoor']];
  soorten.forEach(([soort, a, b], i) => {
    const cx = 45 + i * 90;
    uit += blokje(cx, 86, soort);
    uit += soort === 'goed' ? goed(cx, 22) : fout(cx, 20);
    uit += tekst(cx, 166, a, { maat: 10.5 }) + (b ? tekst(cx, 180, b, { maat: 10.5 }) : '');
  });
  return svg(w, h, 'Blokken keuren: een goed blok dat soepel draait en waarvan het touw in het spoor past; afkeuren bij een scheur in de schijf of een kromme haak; en een touw dat te dik is voor het spoor slijt snel', uit);
}

/** A heavy anchor from above: more pickets side by side in front, more in a row behind; and the chain from rope to
 *  anchor, of which the weakest part decides. */
function grondanker() {
  const w = 360; const h = 250;
  let uit = `<rect x="0" y="0" width="${w}" height="164" class="sj-grond"/>`;
  uit += tekst(10, 18, 'van boven gezien', { maat: 9.5, anker: 'start', klasse: 'stil' });
  const voor = [[244, 62], [244, 106]]; const mid = [174, 84]; const achter = [104, 84];
  // the band from the bridge round both front pickets
  uit += touw(`M352 80L${P(256, 58)}A10 10 0 0 0 ${P(246, 52)}`, 5) + touw(`M352 88L${P(256, 110)}A10 10 0 0 1 ${P(246, 116)}`, 5);
  uit += touw(lijn([[236, 56], [234, 112]]), 5);
  // lashings back to the next picket, and on to the last one
  for (const [x, y] of voor) for (const o of [-2.5, 2.5]) uit += touw(lijn([[x - 8, y + o], [mid[0] + 8, mid[1] + o]]), 3.5);
  for (const o of [-2.5, 2.5]) uit += touw(lijn([[mid[0] - 8, mid[1] + o], [achter[0] + 8, achter[1] + o]]), 3.5);
  for (const [x, y] of [...voor, mid, achter]) uit += kopVanBoven(x, y, 9);
  uit += pijl(300, 132, 346, 132, { kracht: true }) + tekst(322, 150, 'naar de brug', { maat: 10.5 });
  uit += wijs(244, 34, 'voorop meer naast elkaar', 244, 53, 'middle');
  uit += wijs(70, 136, 'erachter in serie', 104, 93, 'middle');
  // the chain
  const delen = ['touw', 'knoop', 'sluiting', 'takel', 'anker'];
  delen.forEach((d, i) => {
    const x = 38 + i * 71;
    if (i) uit += `<path d="M${x - 45} 196H${x - 26}" class="lijn dik stil"/>`;
    uit += `<rect x="${x - 26}" y="182" width="52" height="28" rx="14" class="vlak2"/><rect x="${x - 26}" y="182" width="52" height="28" rx="14" class="lijn dun"/>`;
    uit += tekst(x, 200, d, { maat: 10.5 });
  });
  uit += tekst(180, 234, 'het zwakste deel bepaalt wat het geheel houdt', { maat: 10.5, klasse: 'vet' });
  return svg(w, h, 'Een zwaar grondanker van boven gezien: het touw van de brug loopt om twee piketten naast elkaar voorop, die allebei vastzitten aan een piket erachter, en die weer aan een piket daarachter. Daaronder de keten touw, knoop, sluiting, takel en anker: het zwakste deel bepaalt wat het geheel houdt', uit);
}

/** Your own safety: helmet, gloves and sturdy shoes; and from above, how a long pole sweeps round when you turn. */
function eigenVeiligheid() {
  const w = 360; const h = 230; const gy = 188;
  let uit = grond(gy, 170, 14);
  // the scout at twice the size of the others
  let pop = poppetje(0, 0, { armen: [[-14, 20], [14, 20]], helm: true });
  for (const x of [-14, 14]) pop += `<circle cx="${x}" cy="-20" r="4.5" class="accent"/>`;
  for (const x of [-7, 7]) pop += `<rect x="${x - 6}" y="-5" width="12" height="6" rx="2" class="vol"/>`;
  uit += `<g transform="translate(70 ${gy}) scale(2)">${pop}</g>`;
  uit += wijs(26, 34, 'helm', 62, 82, 'middle');
  uit += wijs(166, 112, 'handschoenen', 100, 148, 'end');
  uit += wijs(166, 214, 'stevige schoenen', 86, 184, 'end');
  // from above: one person turns with a long pole, the other end sweeps round
  uit += `<path d="M180 20V${h - 10}" class="lijn haar"/>`;
  uit += tekst(270, 18, 'van boven gezien', { maat: 9.5, klasse: 'stil' });
  uit += `<circle cx="250" cy="110" r="78" class="cirkel"/><circle cx="250" cy="110" r="78" class="lijn rood-lijn" stroke-dasharray="5 4"/>`;
  uit += paal(204, 128, 312, 86, 8, { kop1: true, kop2: true });
  uit += `<path d="M${P(250 + 78 * Math.cos(-0.37), 110 + 78 * Math.sin(-0.37))}A78 78 0 0 1 ${P(250 + 78 * Math.cos(0.5), 110 + 78 * Math.sin(0.5))}" class="sj-pijl"/>`;
  uit += `<circle cx="250" cy="110" r="9" class="vol"/>`;
  uit += `<circle cx="306" cy="168" r="9" class="vol"/>` + fout(330, 186);
  uit += tekst(270, 212, 'je draait: de paal draait mee', { maat: 10.5 });
  return svg(w, h, 'Je eigen veiligheid. Links een scout met een helm, werkhandschoenen en stevige schoenen. Rechts van boven gezien: wie met een lange paal draait, zwaait de andere kant van de paal rond, en raakt wie daar staat', uit);
}

/** An example bouwplan for a bok: a sketch with measures, the materials, the tasks and the safety. */
function bouwplan() {
  const w = 360; const h = 262;
  let uit = `<rect x="8" y="8" width="344" height="246" rx="6" class="vlak"/><rect x="8" y="8" width="344" height="246" rx="6" class="lijn dun"/>`;
  uit += tekst(20, 30, 'Bouwplan: bok', { maat: 12, anker: 'start', klasse: 'vet' });
  // the sketch
  const gy = 214;
  uit += `<path d="M24 ${gy}H166" class="lijn dun stil"/>`;
  uit += `<path d="M58 ${gy}L102 62M146 ${gy}L94 62M64 192H140" class="lijn dik"/>`;
  uit += `<path d="M30 ${gy}L98 84L166 ${gy}" class="lijn dun stil" stroke-dasharray="4 3"/>`;
  uit += `<circle cx="98" cy="80" r="7" class="lijn accent-lijn"/><circle cx="69" cy="192" r="5" class="lijn accent-lijn"/><circle cx="135" cy="192" r="5" class="lijn accent-lijn"/>`;
  uit += tekst(112, 72, 'vorksjorring', { maat: 9.5, anker: 'start' });
  uit += tekst(102, 232, '2 × kruissjorring', { maat: 9.5 });
  uit += tekst(26, 140, 'tui', { maat: 9.5, anker: 'start', klasse: 'stil' });
  uit += `<path d="M50 ${gy - 6}L92 58" class="sj-maat"/>` + tekst(56, 110, '4 m', { maat: 10.5, anker: 'end' });
  // the lists
  const lijst = (x, y, kop, regels) => tekst(x, y, kop, { maat: 10.5, anker: 'start', klasse: 'vet' })
    + regels.map((r, i) => tekst(x, y + 14 * (i + 1), r, { maat: 10, anker: 'start' })).join('');
  uit += `<path d="M184 44V240" class="lijn haar"/>`;
  uit += lijst(194, 54, 'Materiaal', ['2 palen van 4 m', '1 paal: dwarsbalk', '3 sjortouwen', '2 tuien, 2 ankers']);
  uit += lijst(194, 138, 'Taken', ['wie heeft de leiding', 'wie sjort wat']);
  uit += lijst(194, 194, 'Veiligheid', ['EHBO-kist, telefoon', 'max. tegelijk: ...']);
  return svg(w, h, 'Een voorbeeld van een bouwplan voor een bok: een schets met twee palen van 4 meter, een vorksjorring bovenaan, een dwarsbalk met twee kruissjorringen en twee tuien; een materiaallijst; wie wat doet; en de veiligheid, zoals de EHBO-kist en hoeveel mensen er tegelijk op mogen', uit);
}

export default {
  'sj-kruissjorring': kruissjorring,
  'sj-halve-kruissjorring': () => kruisFamilie('half'),
  'sj-japanse-kruissjorring': () => kruisFamilie('japans'),
  'sj-achtsjorring': achtsjorring,
  'sj-vorksjorring': vorksjorring,
  'sj-diagonaalsjorring': () => diagonaal(false),
  'sj-filipijnse-diagonaalsjorring': () => diagonaal(true),
  'sj-steigersjorring': steigersjorring,
  'sj-rondsjorring': rondsjorring,
  'sj-slingersjorring': slingersjorring,
  'sj-woelsjorring': woelsjorring,
  'sj-polypedestrasjorring': polypedestra,
  'sj-woelen': woelen,
  'sj-blok': blok,
  'sj-jol': jol,
  'sj-derdehand': derdehand,
  'sj-vierloper': vierloper,
  'sj-hijsmateriaal': hijsmateriaal,
  'sj-piket': piket,
  'sj-haringen-serie': haringenSerie,
  'sj-dode-man': dodeMan,
  'sj-boomanker': boomanker,
  'sj-tuien': tuien,
  'sj-bomen-tuien': bomenTuien,
  'sj-pionierpaal': pionierpaal,
  'sj-sjortouw': sjortouw,
  'sj-hout-controleren': houtControleren,
  'sj-hout-opslag': houtOpslag,
  'sj-wig': wig,
  'sj-gereedschap': gereedschap,
  'sj-doorhang': doorhang,
  'sj-touwbaan': touwbaan,
  'sj-hoog-bouwen': hoogBouwen,
  'sj-tijdelijk-vast': tijdelijkVast,
  'sj-blok-keuren': blokKeuren,
  'sj-grondanker': grondanker,
  'sj-eigen-veiligheid': eigenVeiligheid,
  'sj-bouwplan': bouwplan,
  'tb-touwbrug-varianten': touwbrugVarianten,
  'tb-buikschuif': buikschuifHouding,
  'tb-spanknoop': spanknoop,
  'tb-valgebied': valgebied,
  'bw-scharnier': scharnier,
  'bw-oprichten': oprichten,
};

// for the piece that lets you check material (../doe/vuur/veiligkeuren.js)
export { touw, paal, eind };

// ---- touwbanen (ronde 2): tb- ----
// Function declarations below the export are hoisted, so the map above can name them.

/** One small rope bridge between two posts, in a panel at (x, y) of 180 × 118: the variants of the Scoutpedia list. */
function brugPaneel(x, y, soort) {
  const L = x + 16; const R = x + 164; const gy = y + 106; const top = y + 30;
  let uit = `<path d="M${x + 4} ${gy}H${x + 176}" class="sj-maaiveld"/>`;
  uit += paal(L, gy, L, top, 7, { kop2: true }) + paal(R, gy, R, top, 7, { kop2: true });
  const zak = (a, b, d) => `M${P(a[0], a[1])}Q${P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * d)} ${P(b[0], b[1])}`;
  /** a point on the rope from a to b sagging d, at t */
  const op = (a, b, d, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 4 * d * t * (1 - t)];
  const boven = [[L + 3, y + 38], [R - 3, y + 38]];
  const naam = { ladder: 'ladderbrug', schommel: 'schommelbrug', lussen: 'lussenbrug', banden: 'bandenbrug', x: 'X-brug', kruip: 'kruip-/paardenbrug', net: 'netbrug', touwladder: 'touwladderbrug' }[soort];
  const ts = [0.25, 0.5, 0.75];
  if (soort === 'ladder' || soort === 'schommel' || soort === 'lussen' || soort === 'banden') {
    // two boventouwen side by side (seen a little from the side); what you walk on hangs from them, no rope under it
    uit += touw(zak([L + 3, y + 35], [R - 3, y + 35], 6), 3) + touw(zak(...boven, 6), 3.5);
    for (const t of ts) {
      const [px, py] = op(...boven, 6, t);
      if (soort === 'ladder') {
        uit += `<path d="M${P(px - 7, py)}V${r1(py + 40)}M${P(px + 7, py)}V${r1(py + 40)}" class="sj-touw-rand" stroke-width="2.6"/>`;
        for (const dy of [16, 28, 40]) uit += paal(px - 9, py + dy, px + 9, py + dy, 4);
      } else if (soort === 'schommel') {
        uit += `<path d="M${P(px - 2, py)}L${P(px - 9, py + 40)}M${P(px + 2, py)}L${P(px + 9, py + 40)}" class="sj-touw-rand" stroke-width="2.4"/>`;
        uit += `<rect x="${r1(px - 13)}" y="${r1(py + 40)}" width="26" height="5" rx="1" class="sj-hout"/>`;
      } else if (soort === 'lussen') {
        uit += touw(`M${P(px - 6, py)}C${P(px - 10, py + 40)} ${P(px + 10, py + 40)} ${P(px + 6, py)}`, 3);
      } else {
        uit += `<path d="M${P(px, py)}V${r1(py + 26)}" class="sj-touw-rand" stroke-width="2.4"/>`;
        uit += `<ellipse cx="${r1(px)}" cy="${r1(py + 36)}" rx="12" ry="5" fill="none" class="lijn" stroke-width="5.5"/>`;
      }
    }
  } else if (soort === 'x') {
    uit += touw(lijn([[L + 3, y + 40], [x + 90, y + 64], [R - 3, y + 84]]), 3.5);
    uit += touw(lijn([[L + 3, y + 84], [x + 90, y + 66], [R - 3, y + 40]]), 3.5);
  } else if (soort === 'kruip') {
    uit += touw(zak([L + 3, y + 74], [R - 3, y + 74], 4), 3.5) + touw(zak([L + 3, y + 84], [R - 3, y + 84], 4), 3.5);
  } else if (soort === 'net') {
    // a net lying flat between the posts, seen a little from above: a band between two ropes
    const a = [L + 3, y + 70]; const b = [R - 3, y + 70]; const c = [L + 3, y + 86]; const d = [R - 3, y + 86];
    for (let i = 1; i < 12; i++) { const t = i / 12; const p = op(a, b, 4, t); const q = op(c, d, 4, t); uit += `<path d="M${P(...p)}L${P(...q)}" class="lijn dun stil"/>`; }
    for (const f of [0.33, 0.66]) uit += `<path d="${zak([L + 3, y + 70 + 16 * f], [R - 3, y + 70 + 16 * f], 4)}" class="lijn dun stil"/>`;
    uit += touw(zak(a, b, 4), 3) + touw(zak(c, d, 4), 3);
  } else if (soort === 'touwladder') {
    const a = [L + 3, y + 72]; const b = [R - 3, y + 72]; const c = [L + 3, y + 84]; const d = [R - 3, y + 84];
    uit += touw(zak(a, b, 4), 3);
    for (let i = 1; i < 10; i++) { const t = i / 10; uit += paal(...op(a, b, 4, t), ...op(c, d, 4, t), 3.5); }
    uit += touw(zak(c, d, 4), 3);
  }
  uit += tekst(x + 90, y + 18, naam, { maat: 11, klasse: 'vet' });
  return uit;
}
function touwbrugVarianten() {
  const w = 360; const h = 4 * 118 + 4;
  const soorten = ['ladder', 'schommel', 'lussen', 'banden', 'x', 'kruip', 'net', 'touwladder'];
  let uit = `<path d="M180 6V${h - 4}" class="lijn haar"/>`;
  for (let r = 1; r < 4; r++) uit += `<path d="M6 ${r * 118}H354" class="lijn haar"/>`;
  soorten.forEach((s, i) => { uit += brugPaneel((i % 2) * 180, Math.floor(i / 2) * 118, s); });
  return svg(w, h, 'Acht soorten touwbruggen van opzij, elk tussen twee palen. Ladderbrug: laddertjes die aan twee boventouwen hangen, zonder touw eronder. Schommelbrug: plankjes als schommeltjes aan twee boventouwen. Lussenbrug: lussen aan twee boventouwen om in te stappen. Bandenbrug: autobanden aan de boventouwen. X-brug: een looptouw en een handtouw die elkaar in het midden kruisen. Kruipbrug of paardenbrug: alleen twee looptouwen naast elkaar. Netbrug: een net plat tussen de palen. Touwladderbrug: een plat gespannen touwladder', uit);
}

/** A person lying on a rope (buikschuif) and one hanging under it (apenhang), from the side, moving to the right. */
function buikschuifHouding() {
  const w = 360; const h = 268;
  const lijf = (d, b = 8) => `<path d="${d}" class="lijn dik" stroke-width="${b}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let uit = '';
  // buikschuif: on top of the rope, one leg hooked over it, the other hanging for balance
  const r = 74;
  uit += tekst(14, 22, 'buikschuif: bovenop het touw', { maat: 11.5, anker: 'start', klasse: 'vet' });
  uit += pijl(262, 18, 312, 18);
  uit += touw(`M6 ${r - 4}Q180 ${r + 8} 354 ${r - 4}`, 6);
  uit += lijf(`M134 ${r - 4}L120 ${r + 30}L114 ${r + 60}`, 6);
  uit += lijf(`M132 ${r - 7}L200 ${r - 9}`, 9);
  uit += lijf(`M198 ${r - 9}L222 ${r - 5}L238 ${r - 1}M194 ${r - 8}L214 ${r + 3}L230 ${r + 2}`, 5);
  uit += `<circle cx="214" cy="${r - 17}" r="9" class="vol"/>`;
  uit += lijf(`M134 ${r - 8}L100 ${r - 18}L84 ${r - 3}`, 6);
  uit += touw(`M74 ${r - 2.4}L96 ${r - 2}`, 6);
  uit += wijs(50, r + 30, 'been over het touw', 86, r - 3, 'middle', 10);
  uit += wijs(150, r + 58, 'ander been hangt: evenwicht', 118, r + 44, 'start', 10);
  // apenhang: under the rope, hands and crossed legs round it
  const a = 196;
  uit += `<path d="M8 ${a - 52}H352" class="lijn haar"/>`;
  uit += tekst(14, a - 32, 'apenhang: onder het touw', { maat: 11.5, anker: 'start', klasse: 'vet' });
  uit += pijl(262, a - 36, 312, a - 36);
  uit += lijf(`M148 ${a + 34}L124 ${a + 14}L104 ${a - 1}M148 ${a + 35}L130 ${a + 18}L114 ${a + 1}`, 6);
  uit += touw(`M6 ${a - 2}Q180 ${a + 10} 354 ${a - 2}`, 6);
  uit += lijf(`M146 ${a + 34}L204 ${a + 34}`, 9);
  uit += lijf(`M204 ${a + 32}L224 ${a + 14}L238 ${a + 2}M200 ${a + 33}L214 ${a + 14}L226 ${a + 2}`, 5);
  uit += `<circle cx="218" cy="${a + 46}" r="9" class="vol"/>`;
  uit += wijs(70, a + 52, 'benen gekruist over het touw', 108, a + 2, 'middle', 10);
  uit += wijs(298, a + 46, 'handen om het touw', 236, a + 4, 'middle', 10);
  return svg(w, h, 'Boven: buikschuif. Iemand ligt op de buik bovenop een strak touw, trekt zich met de handen vooruit, heeft één been over het touw gehaakt en laat het andere been omlaag hangen voor het evenwicht. Onder: apenhang. Iemand hangt onder het touw, met de handen om het touw en de benen gekruist over het touw', uit);
}

/** The spanknoop of Scoutpedia (Touw opspannen): a loop in the rope, the end round the tree and back through the
 *  loop, pulled tight; then wound round all the parts and finished with half hitches. */
function spanknoop() {
  const w = 360; const h = 290;
  let uit = '';
  for (const [y0, n] of [[0, 1], [146, 2]]) {
    const gy = y0 + 138; const ry = y0 + 82;
    uit += grond(gy, w, 4);
    uit += boomZij(330, gy, y0 + 34, 20) + jute(330, 20, ry - 14, ry + 14);
    uit += nummer(16, y0 + 16, n);
    const lx = 150; // the loop
    uit += touw(`M4 ${ry}H${lx - 8}`, 5);
    uit += touw(`M${lx - 8} ${ry}c6 0 10 -12 16 -12s8 8 2 12`, 5);
    // from the loop to the tree (upper part), round the tree, back to the loop (lower part)
    uit += touw(`M${lx + 9} ${ry}L319 ${ry - 9}`, 5);
    uit += touw(`M319 ${ry + 9}L${lx + 6} ${ry + 5}`, 5);
    if (n === 1) {
      // through the loop and pulled back towards the tree side
      uit += touw(`M${lx + 6} ${ry + 5}Q${lx - 6} ${ry + 6} ${lx - 2} ${ry - 8}Q${lx + 4} ${ry - 16} ${lx + 24} ${ry + 30}L${lx + 44} ${ry + 46}`, 5, { rond: true }) + eind(lx + 44, ry + 46, 40);
      uit += pijl(lx + 52, ry + 50, lx + 76, ry + 50, { kracht: true });
      uit += tekst(lx + 82, ry + 54, 'trek', { maat: 10.5, anker: 'start', klasse: 'rood-tekst' });
      uit += wijs(lx - 40, ry + 40, 'lus', lx - 4, ry + 4, 'middle', 10);
      uit += wijs(50, ry + 34, 'vaste kant', 50, ry + 3, 'middle', 10);
      uit += tekst(32, y0 + 20, 'eind om de boom en terug door de lus:', { maat: 10.5, anker: 'start' }) + tekst(32, y0 + 34, 'de lus werkt als een katrol', { maat: 10.5, anker: 'start' });
    } else {
      // the end wound round all the parts between the loop and the tree, then half hitches
      uit += touw(`M${lx + 6} ${ry + 5}Q${lx - 6} ${ry + 6} ${lx - 2} ${ry - 8}Q${lx + 4} ${ry - 14} ${lx + 16} ${ry - 2}`, 5);
      for (let i = 0; i < 8; i++) {
        const x = lx + 56 + i * 14; const sp = 8 - i * 0.2;
        uit += touw(`M${x} ${ry - sp - 4}L${x + 8} ${ry + sp + 4}`, 4.5);
      }
      for (const dx of [20, 32, 44]) uit += `<circle cx="${lx + dx}" cy="${ry + 1}" r="5" fill="none" class="sj-touw-rand" stroke-width="4.5"/><circle cx="${lx + dx}" cy="${ry + 1}" r="5" fill="none" class="sj-touw-lijf" stroke-width="2.4"/>`;
      uit += touw(`M${lx + 46} ${ry + 6}q6 10 -2 20`, 4.5, { rond: true }) + eind(lx + 44, ry + 26, 100, 4.5);
      uit += tekst(32, y0 + 20, 'houd vast, wikkel het eind om alle touwparten', { maat: 10.5, anker: 'start' }) + tekst(32, y0 + 34, 'en zet het vast', { maat: 10.5, anker: 'start' });
      uit += wijs(lx - 60, ry + 44, 'minstens 3 halve steken', lx + 32, ry + 7, 'start', 10);
    }
  }
  return svg(w, h, 'De spanknoop in twee stappen. Eén: het touw komt van de vaste kant, een eind voor de boom zit een lus in het touw; het eind gaat om de boom met jute, terug door de lus, en je trekt eraan: de lus werkt als een katrol. Twee: houd de spanning vast, wikkel het eind om alle touwparten tussen de lus en de boom, en zet het vast met minstens drie halve steken', uit);
}

/** The impact area under a structure you can fall from: soft ground, room round it, nothing in it, and someone watching. */
function valgebied() {
  const w = 360; const h = 250; const gy = 182; const m = 40; // 40 px a metre
  let uit = grond(gy, w, 30);
  // the impact area: 2/3 × 2,4 + 0,5 = 2,1 m round the structure
  const x0 = 140; const x1 = 220; const uitP = 2.1 * m;
  uit += `<rect x="${x0 - uitP}" y="${gy - 6}" width="${x1 - x0 + 2 * uitP}" height="12" rx="3" class="sj-zand"/>`;
  // a frame of 2 m wide and 2,4 m high with a bar to hang from
  uit += paal(x0, gy, x0, gy - 2.6 * m, 8, { kop2: true }) + paal(x1, gy, x1, gy - 2.6 * m, 8, { kop2: true });
  uit += paal(x0 - 12, gy - 2.4 * m, x1 + 12, gy - 2.4 * m, 7, { kop1: true, kop2: true });
  uit += poppetje(182, gy - 2.4 * m + 58, { armen: [[-4, -18], [4, -18]] });
  // measures
  uit += `<path d="M${x1 + 24} ${gy}V${gy - 2.4 * m}M${x1 + 19} ${gy}h10M${x1 + 19} ${gy - 2.4 * m}h10" class="sj-maat"/>`;
  uit += tekst(x1 + 30, gy - 1.2 * m + 4, '2,4 m', { maat: 10.5, anker: 'start' });
  uit += `<path d="M${x0 - uitP} ${gy + 18}H${x0}M${x0 - uitP} ${gy + 13}v10M${x0} ${gy + 13}v10" class="sj-maat"/>`;
  uit += `<path d="M${x1} ${gy + 18}H${x1 + uitP}M${x1 + uitP} ${gy + 13}v10M${x1} ${gy + 13}v10" class="sj-maat"/>`;
  uit += tekst(x0 - uitP / 2, gy + 34, '2,1 m', { maat: 10.5 }) + tekst(x1 + uitP / 2, gy + 34, '2,1 m', { maat: 10.5 });
  uit += tekst(180, gy + 56, 'valgebied: 2/3 × 2,4 + 0,5 = 2,1 m rondom', { maat: 10.5, klasse: 'vet' });
  uit += wijs(56, gy - 96, 'zand of houtsnippers', 64, gy - 4, 'middle', 10);
  // no peg or stone in the impact area; someone watching
  uit += paal(x1 + 102, gy + 4, x1 + 98, gy - 12, 5, { kop2: true }) + fout(x1 + 100, gy - 26);
  uit += tekst(x1 + 102, gy - 54, 'niets in', { maat: 10 }) + tekst(x1 + 102, gy - 42, 'het valgebied', { maat: 10 });
  uit += poppetje(x0 - 28, gy - 2, { armen: [[8, 14], [12, 10]] });
  uit += tekst(x0 - 28, gy - 66, 'toezicht', { maat: 10.5 });
  return svg(w, h, 'Een rek van 2,4 meter hoog met iemand die aan de bovenste balk hangt. Eronder ligt zand of houtsnippers, tot 2,1 meter rondom: het valgebied, twee derde van 2,4 plus 0,5 meter. In het valgebied ligt niets, zoals een haring. Iemand van de leiding houdt toezicht', uit);
}

// ---- bouwwerken (ronde 2): bw- ----

/** A loop of rope round centre (cx, cy), rx by ry, turned by `hoek` degrees. */
const lus = (cx, cy, rx, ry, hoek = 0, dik = 4) =>
  `<g transform="rotate(${hoek} ${P(cx, cy)})">${touw(`M${P(cx - rx, cy)}A${rx} ${ry} 0 1 1 ${P(cx + rx, cy)}A${rx} ${ry} 0 1 1 ${P(cx - rx, cy)}Z`, dik)}</g>`;
/** A curved arrow round (cx, cy): turning. */
function draaipijl(cx, cy, r, van, tot) {
  const p = (g) => [cx + r * Math.cos((g * Math.PI) / 180), cy + r * Math.sin((g * Math.PI) / 180)];
  const [x1, y1] = p(van); const [x2, y2] = p(tot); const [x0, y0] = p(tot - Math.sign(tot - van) * 14);
  return `<path d="M${P(x1, y1)}A${r} ${r} 0 0 ${tot > van ? 1 : 0} ${P(x0, y0)}" class="sj-pijl"/>` + pijl(x0, y0, x2, y2);
}

/** Three joints that may move: a loose strop round an as and an arm, an as lying loose between klosjes, a strop round
 *  a mast resting on a kraag of tight turns. */
function scharnier() {
  const w = 360; const h = 236;
  let uit = '';
  for (const x of [120, 240]) uit += `<path d="M${x} 16V196" class="lijn haar"/>`;
  // 1: the arm on the as (seen from the end of the as), a loose figure of eight round both
  uit += `<circle cx="60" cy="112" r="19" class="sj-kop"/><circle cx="60" cy="112" r="12" class="sj-jaar"/><circle cx="60" cy="112" r="5" class="sj-jaar"/>`;
  uit += lus(60, 101, 12, 31, -18) + paal(6, 86, 114, 86, 14, { kop1: true, kop2: true }) + lus(60, 101, 12, 31, 18);
  uit += draaipijl(60, 100, 46, 200, 250);
  uit += tekst(60, 168, 'arm op een as', { maat: 10.5, klasse: 'stil' });
  // 2: a short thick as lying on a dwarsligger, held by two klosjes; the balk lashed on top tilts with it
  uit += paal(130, 150, 230, 150, 14, { kop1: true, kop2: true });
  uit += `<rect x="156" y="130" width="9" height="13" rx="2" class="sj-hout-licht"/><rect x="195" y="130" width="9" height="13" rx="2" class="sj-hout-licht"/>`;
  uit += `<circle cx="180" cy="129" r="14" class="sj-kop"/><circle cx="180" cy="129" r="8" class="sj-jaar"/>`;
  uit += paal(126, 120, 234, 101, 12, { kop1: true, kop2: true });
  for (const dx of [-5, 0, 5]) uit += touw(lijn([[180 + dx, 102], [180 + dx, 141]]), 3.2);
  uit += wijs(150, 66, 'balk en as', 168, 106, 'middle', 10);
  uit += wijs(212, 182, 'klosjes', 200, 140, 'middle', 10);
  // 3: a mast, a kraag of tight turns, and a loose strop above it that can turn
  uit += paal(300, 200, 300, 26, 15, { kop2: true });
  for (const y of [98, 103, 108]) uit += touw(lijn([[292, y], [308, y]]), 4);
  uit += lus(300, 88, 13, 4, 0, 4);
  uit += touw(lijn([[289, 90], [258, 170]]), 3.2) + touw(lijn([[311, 90], [342, 170]]), 3.2);
  uit += `<path d="M282 56A18 6 0 1 0 318 56" class="sj-pijl"/>` + pijl(310, 61, 318, 56);
  uit += wijs(256, 76, 'strop', 288, 87, 'middle', 10);
  uit += wijs(344, 124, 'kraag', 308, 104, 'middle', 10);
  uit += tekst(60, 216, 'losse strop', { maat: 11, klasse: 'vet' }) + tekst(180, 216, 'losse as', { maat: 11, klasse: 'vet' }) + tekst(300, 216, 'strop om een mast', { maat: 11, klasse: 'vet' });
  uit += tekst(60, 230, 'blijde, ophaalbrug', { maat: 9.5, klasse: 'stil' }) + tekst(180, 230, 'wip', { maat: 9.5, klasse: 'stil' }) + tekst(300, 230, 'zweefmolen, draaibrug', { maat: 9.5, klasse: 'stil' });
  return svg(w, h, 'Drie verbindingen die mogen bewegen. Een: een arm op een dikke as, met een losse strop in een acht om allebei, zodat de arm om de as kan draaien, zoals bij een blijde of een ophaalbrug. Twee: een korte dikke as die los op een dwarsligger ligt, tussen twee klosjes; de balk erop is aan de as vastgesjord en kantelt met de as mee, zoals bij een wip. Drie: een mast met een kraag van strakke slagen touw, en daarboven een losse strop die rond de mast kan draaien, met touwen eraan, zoals bij een zweefmolen of draaibrug', uit);
}

/** Raising with a hulpbok: the hijstouw from the top of the lying mast over the head of a bok near the foot, to a
 *  takel at an anker; a tegenhoudtouw on the other side, the foot held. Beside it the killicksteek on a hoisted paal. */
function oprichten() {
  const w = 360; const h = 250; const gy = 196;
  let uit = grond(gy, w, 54);
  uit += `<path d="M240 16V${gy - 4}" class="lijn haar"/>`;
  // the mast lies with its foot at the pivot and its top away from the pull; the zone it could fall back into is kept free
  const voet = [98, gy - 7]; const top = [98 + 128 * Math.cos(0.42), gy - 7 - 128 * Math.sin(0.42)];
  uit += `<path d="M98 ${gy}L236 ${gy}L${r1(top[0])} ${r1(top[1] - 8)}Z" class="cirkel"/><path d="M236 ${gy}L${P(top[0], top[1] - 8)}" class="lijn rood-lijn" stroke-dasharray="4 3"/>`;
  uit += paal(...voet, ...top, 13, { kop2: true });
  uit += paal(108, gy + 8, 104, gy - 12, 6, { kop2: true });
  // the hulpbok on the other side of the foot: the side you pull towards
  const bok = [52, 84];
  uit += paal(46, gy, bok[0], bok[1], 9, { kop2: true }) + paal(62, gy, bok[0] + 4, bok[1] + 2, 9);
  // hijstouw: mast top → over the head of the hulpbok → down to a takel at an anker behind it
  uit += touw(lijn([top, [bok[0] + 2, bok[1] - 2], [16, gy - 52]]), 3.6);
  uit += `<circle cx="16" cy="${gy - 46}" r="6" class="sj-metaal"/><circle cx="14" cy="${gy - 22}" r="6" class="sj-metaal"/>`;
  uit += touw(lijn([[13, gy - 42], [11, gy - 26]]), 2.6) + touw(lijn([[19, gy - 42], [17, gy - 26]]), 2.6);
  uit += paal(12, gy + 8, 16, gy - 12, 6, { kop2: true });
  uit += pijl(120, 74, 92, 74);
  // tegenhoudtouw to the far side
  uit += touw(lijn([[top[0] + 3, top[1] + 2], [232, gy - 4]]), 3);
  uit += paal(234, gy + 8, 230, gy - 12, 6, { kop2: true });
  uit += wijs(100, 40, 'hulpbok', bok[0] + 2, bok[1] + 6, 'middle', 10);
  uit += tekst(150, 70, 'trekken', { maat: 10, klasse: 'stil' });
  uit += wijs(166, 100, 'hijstouw', 140, 114, 'middle', 10);
  uit += wijs(4, 232, 'takel naar anker', 16, gy - 22, 'start', 10);
  uit += wijs(212, 54, 'tegenhoudtouw', 226, 150, 'middle', 10);
  uit += wijs(124, 232, 'voet vast', 104, gy - 6, 'start', 10);
  uit += tekst(176, 186, 'niemand hier', { maat: 10, klasse: 'stil' });
  // the killicksteek: a paal hanging from the rope, a halve steek near the top, a timmersteek lower down
  const px = 302;
  uit += touw(lijn([[px, 18], [px, 60]]), 3.6);
  uit += paal(px, 56, px, 186, 15, { kop1: true, kop2: true });
  uit += touw(lijn([[px - 1, 60], [px - 2, 150]]), 3.2);
  uit += lus(px, 72, 11, 4, 0, 3.4);
  uit += lus(px, 150, 11, 4, 0, 3.4) + lus(px, 157, 11, 4, 0, 3.4) + lus(px, 164, 11, 4, 0, 3.4);
  uit += touw(lijn([[px + 10, 166], [px + 14, 176]]), 3.2) + eind(px + 15, 178, 70, 3.2);
  uit += wijs(288, 108, 'halve steek', px - 9, 74, 'end', 10);
  uit += wijs(288, 216, 'timmersteek', px - 9, 162, 'end', 10);
  uit += tekst(302, 236, 'killicksteek', { maat: 11, klasse: 'vet' });
  return svg(w, h, 'Links: een mast wordt opgericht. Hij ligt met zijn voet bij het draaipunt en zijn top van de trekkers af. Aan de andere kant van de voet staat een hulpbok; het hijstouw loopt van de top van de mast over de kop van de hulpbok omlaag naar een takel aan een anker daarachter, en de top komt naar die kant omhoog. Aan de andere kant houdt een tegenhoudtouw de mast tegen, de voet staat vast tegen een haring, en in de strook waar de mast kan vallen staat niemand. Rechts: de killicksteek, waarmee je een paal rechtop hijst: een halve steek vlak bij het eind dat voorop gaat, en verder naar beneden een timmersteek', uit);
}

