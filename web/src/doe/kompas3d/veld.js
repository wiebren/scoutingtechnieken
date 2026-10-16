// The field for the spiegelkompas piece: the world of the tochten (a road network from ../route/netwerk.js, built
// in 3D by ../route/wereld3d.js), a junction near its middle to stand on, and four landmarks at known bearings and
// distances from there. Shared by the 3D landscape (landschap3d.js), the flat fallback (landschap2d.js) and the piece.
// Bearings are compass degrees (magnetic): what the needle measures, so no declination is involved.
import { maakNetwerk, afstandTotLijn, SOORTEN, peiling as peilingVan, punt } from '../route/netwerk.js';

/** The landmarks: name, height and width in metres (for the label and to keep the view free), distance range. */
export const BAKENS = {
  kerk: { naam: 'kerktoren', de: 'de kerktoren', hoogte: 29, breed: 10, afstand: [160, 230] },
  molen: { naam: 'molen', de: 'de molen', hoogte: 27, breed: 20, afstand: [140, 210] },
  eik: { naam: 'grote eik', de: 'de grote eik', hoogte: 14, breed: 13, afstand: [70, 105] },
  watertoren: { naam: 'watertoren', de: 'de watertoren', hoogte: 33, breed: 15, afstand: [180, 250] },
};

/** A small seeded random generator (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** a minus b as the shortest turn, -180..180 (positive: a lies clockwise of b). */
export const zijde = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;
export const graden = (g) => ((Math.round(g) % 360) + 360) % 360;
const RAD = Math.PI / 180;

/**
 * A new field: the network without its own church and big oaks (they would look like the landmarks of the task),
 * the junction to stand on, and the four landmarks at least 55° apart, off the roads, and not hidden behind a house.
 */
export function maakVeld(seed) {
  const heel = maakNetwerk(seed);
  const net = { ...heel, bakens: heel.bakens.filter((b) => b.soort !== 'kerk' && b.soort !== 'boom') };
  const r = rng(seed * 13 + 5);
  const xs = net.levend.map((k) => k.x); const ys = net.levend.map((k) => k.y);
  const midden = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  // a junction near the middle, without a landmark of its own right next to you
  const plekken = net.levend.filter((k) => k.wegen.length >= 3 && !net.bakens.some((b) => b.knoop === k.id));
  const ver = (k) => Math.hypot(k.x - midden.x, k.y - midden.y);
  const stand = [...(plekken.length ? plekken : net.levend)].sort((a, b) => ver(a) - ver(b))[0];

  const wegen = net.wegenLijst.map((w) => [net.knopen[w.a], net.knopen[w.b], SOORTEN[w.soort].breed / 2]);
  const naastWeg = (q, m) => wegen.some(([a, b, half]) => afstandTotLijn(q, a, b) < half + m);
  // a house (or another small landmark of the network) between you and the landmark
  const verstopt = (lm) => net.bakens.some((b) => {
    const d = Math.hypot(b.x - stand.x, b.y - stand.y);
    if (d > lm.afstand) return false;
    const half = Math.atan((b.soort === 'huis' ? 6 : 2.5) / d) / RAD + Math.atan(BAKENS[lm.soort].breed / 2 / lm.afstand) / RAD + 1;
    return Math.abs(zijde(peilingVan(stand, b), lm.peiling)) < half;
  });

  const soorten = Object.keys(BAKENS);
  let bakens = null; let beste = null;
  for (let t = 0; t < 800 && !bakens; t++) {
    const p = soorten.map(() => Math.floor(r() * 360));
    if (!p.every((a, i) => p.every((b, j) => i === j || Math.abs(zijde(a, b)) >= 55))) continue;
    const lijst = soorten.map((soort, i) => {
      const [a, b] = BAKENS[soort].afstand; const afstand = Math.round(a + r() * (b - a));
      return { soort, peiling: p[i], afstand, ...punt(stand, afstand, p[i]) };
    });
    beste ??= lijst;
    if (lijst.every((lm) => !naastWeg(lm, BAKENS[lm.soort].breed / 2 + 3) && !verstopt(lm)
      && net.bakens.every((b) => Math.hypot(b.x - lm.x, b.y - lm.y) > 25))) bakens = lijst;
  }
  // (hardly ever) no luck: evenly spread
  beste ??= soorten.map((soort, i) => {
    const g = (i * 90 + 20) % 360; const afstand = BAKENS[soort].afstand[0];
    return { soort, peiling: g, afstand, ...punt(stand, afstand, g) };
  });
  return { seed, net, stand: { x: stand.x, y: stand.y }, bakens: bakens ?? beste };
}

/** The landmark closest to a direction, if it is within `tol` degrees of it; else null. */
export function inVizier(veld, richting, tol) {
  let beste = null;
  for (const b of veld.bakens) {
    const d = Math.abs(zijde(b.peiling, richting));
    if (d <= tol && (!beste || d < beste.d)) beste = { ...b, d };
  }
  return beste;
}
