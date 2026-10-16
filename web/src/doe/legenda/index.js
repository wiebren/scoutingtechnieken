// The groups of the legenda, in the order of the chips. Each file draws one group again from the Kadaster legenda
// TOP25raster (reference/vakbronnen/kadaster-legenda-top25raster.png, CC BY 4.0):
//   export default { id, titel, tekens: [{ naam, teken, h? }] }
// `teken` is the inside of an SVG with viewBox "0 0 64 h" (h is 24 unless given), drawn on white in the colours of
// the map. A line runs across the full width at y = h/2; an area fills a block; a point sign sits in the middle.
// One name per sign: where the Kadaster puts a, b, c under one picture, each letter is a sign of its own here.
import bodemgebruik from './bodemgebruik.js';
import wegen from './wegen.js';
import tekens from './tekens.js';
import water from './water.js';
import relief from './relief.js';
import spoorwegen from './spoorwegen.js';
import bebouwing from './bebouwing.js';
import grenzen from './grenzen.js';

export const GROEPEN = [bodemgebruik, wegen, tekens, water, relief, spoorwegen, bebouwing, grenzen];
