// The recoil of a tight rope, step by step (./speler.js): a rope tensioned between two posts is cut close to one of
// them, and the long part shoots back along its own length, past the other post and far beyond it, before it drops.
// The rope moves as a DisMech simulation computed it (knopen-editor, scenario terugslag; ./terugslag-opname.js); the
// rest is drawn here, with the rope of the drawings in ../../plaatjes/touw.js.
import { pijl, stukTouw } from '../../plaatjes/touw.js';
import opname from './terugslag-opname.js';
import { speler } from './speler.js';

const W = 320; const H = 168;
const S = 38;                                  // px per metre
const X0 = 20; const G = 150;                  // post A (x 0) and the ground (z 0)
const px = (x) => X0 + x * S; const py = (z) => G - z * S;
const XA = px(0); const XB = px(opname.palen.afstand); const TOP = py(opname.palen.hoogte);
const XP = px(5.9);                            // where the person stands: in the line of the rope, past post B
const KNIP = 0.35;                             // where on the stappenbalk (in step 2) the knife goes through

const STAPPEN = ['Gespannen', 'Doorgesneden', 'Terugslag', 'Valt neer'];
const TEKST = [
  'Stap 1: een touw staat strak tussen twee palen. Door de spanning is het een stukje uitgerekt, net als een elastiek. Achter de rechterpaal staat iemand, in de lijn van het touw.',
  'Stap 2: vlak bij de linkerpaal gaat het touw kapot, hier met een mes. Het lange stuk veert in één klap terug: in de lengte van het touw, recht op de andere paal af.',
  'Stap 3: het touw schiet langs de rechterpaal en zwiept daar ver voorbij, in dezelfde lijn: precies waar die persoon staat. In het echt duurt dit maar een fractie van een seconde.',
  'Stap 4: pas daarna valt het touw neer. Sta dus nooit in de lijn van een gespannen touw, ook niet achter een paal of anker: sta ernaast.',
];

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const r = (n) => Math.round(n * 10) / 10;

// The recording: per frame, x and z of the nodes of the short piece (from post A to the cut) and the long piece (from
// the cut to post B), in units of eenheid_mm. The steps after the first start at these times (ms after the cut).
const M = opname.eenheid_mm / 1000;
const T = opname.t_ms;
const GRENS = [...opname.stappen.map((s) => s.start_ms), T.at(-1)];
const X_KNIP = px(opname.frames[0][0].at(-2) * M);     // where it is cut: the end of the short piece

/** The rope at t ms after the cut: both pieces as SVG points, between the two frames around t. */
function touwOp(t) {
  let i = 0;
  while (i < T.length - 2 && T[i + 1] <= t) i++;
  const f = klem((t - T[i]) / (T[i + 1] - T[i]));
  return opname.frames[i].map((a, k) => {
    const b = opname.frames[i + 1][k]; const pts = [];
    for (let j = 0; j < a.length; j += 2) pts.push([px((a[j] + (b[j] - a[j]) * f) * M), py((a[j + 1] + (b[j + 1] - a[j + 1]) * f) * M)]);
    return pts;
  });
}

/** Time after the cut (ms) at place w on the stappenbalk; below 0 the rope is not cut yet. */
function tijd(w) {
  if (w < KNIP) return -1;
  if (w < 1) return ((w - KNIP) / (1 - KNIP)) * GRENS[1];
  const k = Math.min(Math.floor(w), GRENS.length - 2);
  return GRENS[k] + (GRENS[k + 1] - GRENS[k]) * klem(w - k);
}

function paal(x) {
  return `<rect x="${r(x - 4.5)}" y="${r(TOP - 5)}" width="9" height="${r(G - TOP + 7)}" rx="2" class="tw-hout"/>`
    + `<path d="M${r(x - 1.5)} ${r(TOP + 6)}V${G - 6}M${r(x + 2)} ${r(TOP + 14)}V${G - 14}" class="tw-nerf"/>`;
}
/** The turns of the rope round a post, just below the top. */
const vast = (x) => stukTouw([[x - 6, TOP - 2], [x + 6, TOP + 2]], 'a', 3.6) + stukTouw([[x - 6, TOP + 2], [x + 6, TOP + 6]], 'a', 3.6);

/** Someone standing, facing the rope (to the left), about 1.7 m. */
function persoon(x) {
  const hoofd = py(1.58); const schouder = py(1.42); const heup = py(0.86);
  return `<circle cx="${r(x)}" cy="${r(hoofd)}" r="7" class="vol"/>`
    + `<path d="M${r(x)} ${r(hoofd + 7)}V${r(heup)}M${r(x)} ${r(heup)}L${r(x - 7)} ${G}M${r(x)} ${r(heup)}L${r(x + 6)} ${G}`
    + `M${r(x)} ${r(schouder)}L${r(x - 9)} ${r(schouder + 20)}M${r(x)} ${r(schouder)}L${r(x + 5)} ${r(schouder + 21)}" class="lijn dik"/>`;
}

/** A knife coming down on the rope at x; f 0 = above, 1 = through it; it fades as it goes back up (gaat 0..1). */
function mes(x, f, gaat = 0) {
  const tip = TOP + 3 - (1 - f) * 34 - gaat * 26;
  return `<g opacity="${r(1 - gaat)}"><path d="M${r(x - 2.6)} ${r(tip - 15)}H${r(x + 2.6)}V${r(tip - 4)}L${r(x)} ${r(tip)}L${r(x - 2.6)} ${r(tip - 6)}Z" class="tw-metaal"/>`
    + `<rect x="${r(x - 3.2)}" y="${r(tip - 29)}" width="6.4" height="14" rx="2" class="tw-hout"/></g>`;
}

/** The drawing at place w on the stappenbalk (0 = step 1 done ... 3 = step 4 done). */
export function tekening(w) {
  const t = tijd(w);
  const [kort, lang] = touwOp(Math.max(t, 0));

  // the ground, and past post B the line of the rope: where it whips to
  let uit = `<rect x="0" y="${G}" width="${W}" height="${H - G}" class="tw-zand"/>`;
  uit += `<rect x="${r(XB + 8)}" y="${r(py(2.05))}" width="${r(W - XB - 12)}" height="${r(G - py(2.05) - 3)}" rx="4" class="tw-gevaar"/>`;
  uit += `<text x="${r((XB + W) / 2 + 2)}" y="${r(py(2.05) - 6)}" class="tekst rood-tekst" font-size="10.5" text-anchor="middle">in de lijn van het touw</text>`;
  uit += persoon(XP);
  uit += paal(XA) + paal(XB);

  if (t < 0) uit += stukTouw([...kort, ...lang.slice(1)], 'a', 4.6);
  else uit += stukTouw(kort, 'a', 4.6, { eind: 'eind' }) + stukTouw(lang, 'a', 4.6, { begin: 'eind' });
  uit += vast(XA) + vast(XB);

  // the knife: down onto the rope, through it, and away
  if (w < KNIP + 0.3) uit += mes(X_KNIP, w < KNIP ? Math.sin((w / KNIP) * Math.PI / 2) : 1, klem((w - KNIP) / 0.3));
  if (w < 1) {
    uit += `<path d="M${r(XA + 26)} 44L${r(X_KNIP + 4)} ${r(TOP - 4)}" class="tw-wijs"/><circle cx="${r(X_KNIP + 4)}" cy="${r(TOP - 4)}" r="1.8" class="tw-wijs-punt"/>`;
    uit += `<text x="${r(XA + 22)}" y="40" class="tekst stil" font-size="10.5">vlak bij de paal doorgesneden</text>`;
  }
  // which way it goes: along the rope
  if (w > KNIP && w < 2) {
    const zicht = klem((w - KNIP) / 0.15) * klem((2 - w) / 0.3);
    uit += `<g opacity="${r(zicht)}">${pijl([px(1.2), TOP - 16], [px(3.4), TOP - 16], 'rood')}`
      + `<text x="${r(px(2.3))}" y="${r(TOP - 22)}" class="tekst rood-tekst" font-size="10.5" text-anchor="middle">terugslag</text></g>`;
  }
  if (w > KNIP) uit += `<text x="${W - 6}" y="${H - 5}" class="tekst stil" font-size="9" text-anchor="end">vertraagd</text>`;
  return uit;
}

export default function terugslag() {
  return speler({ stappen: STAPPEN, teksten: TEKST, tekening, viewBox: `0 0 ${W} ${H}`, label: 'De terugslag van een gespannen touw', tempo: 3000 });
}
