// What the star pieces share (sterrenkaart, poolster-zoeken, sterrenbeelden): the stars with their figures, where
// they stand at a moment, how bright they are drawn, and how dark the sky is.
import { BEELDEN, NAMEN, PLEJADEN, STERREN } from './sterren-data.js';
import { naarHorizon, richtingTekst, zon } from './hemel.js';

export { BEELDEN, NAMEN, PLEJADEN, STERREN };

/** For every star: the figure it is part of (its id), if any. */
export const IN_BEELD = new Map();
for (const b of BEELDEN) for (const keten of b.lijnen) for (const i of keten) if (!IN_BEELD.has(i)) IN_BEELD.set(i, b);
export const BEELD = Object.fromEntries(BEELDEN.map((b) => [b.id, b]));

/** The stars of a figure, each once. */
export const sterrenVan = (b) => [...new Set(b.lijnen.flat())];

/** The radius of a star in the picture by its magnitude: brighter is bigger. */
export const straal = (mag, schaal = 1) => Math.max(0.55, (3.7 - 0.6 * mag) * schaal);

/** A colour by the colour index B-V: blue-white, white, yellowish, orange. */
export const kleur = (bv) => (bv < 0 ? '#d8e5ff' : bv < 0.9 ? '#ffffff' : bv < 1.4 ? '#fff1d8' : '#ffc890');

/** Where every star stands at t for a place: [{ hoogte, richting }], in the order of STERREN. */
export const posities = (t, breedte, lengte) => STERREN.map((x) => naarHorizon(x.ra, x.dec, t, breedte, lengte));

/** The middle of a figure: { hoogte, richting } at t, from the mean of its stars on the sphere. */
export function midden(b, t, breedte, lengte) {
  let x = 0; let y = 0; let z = 0;
  for (const i of sterrenVan(b)) {
    const ra = STERREN[i].ra * 15 * (Math.PI / 180); const dec = STERREN[i].dec * (Math.PI / 180);
    x += Math.cos(dec) * Math.cos(ra); y += Math.cos(dec) * Math.sin(ra); z += Math.sin(dec);
  }
  const ra = Math.atan2(y, x) / (Math.PI / 180) / 15; const dec = Math.atan2(z, Math.hypot(x, y)) / (Math.PI / 180);
  return naarHorizon((ra + 24) % 24, dec, t, breedte, lengte);
}

/**
 * How dark it is by the height of the sun: the colour of the sky and the faintest star you see (magnitude).
 * Day, then civil, nautical and astronomical twilight, then night.
 */
export function donker(t, breedte, lengte) {
  const h = zon(t, breedte, lengte).hoogte;
  if (h > -1) return { h, lucht: '#6f9fd0', grens: -2, naam: 'het is licht: overdag zie je geen sterren' };
  if (h > -6) return { h, lucht: '#3a5f8f', grens: 0.6, naam: 'schemer: alleen de helderste sterren' };
  if (h > -12) return { h, lucht: '#1d3150', grens: 2.6, naam: 'het wordt donker' };
  if (h > -18) return { h, lucht: '#111d33', grens: 3.8, naam: 'bijna helemaal donker' };
  return { h, lucht: '#0b1322', grens: 4.3, naam: 'donker' };
}

/** "laag in het noordoosten" for a height and direction. */
export const waarTekst = ({ hoogte, richting }) =>
  `${hoogte > 65 ? 'hoog boven je' : hoogte > 35 ? 'halfhoog' : 'laag'}${hoogte > 65 ? '' : ` in ${richtingTekst(richting)}`}`;

const ZONDER_DE = new Set(['Cassiopeia', 'Orion', 'Perseus', 'Pegasus', 'Andromeda']);
/** "de Grote Beer", but "Orion". */
export const metDe = (b) => (ZONDER_DE.has(b.naam) ? b.naam : `de ${b.naam}`);
