// Grenzen, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
const ZWART = '#111';
const GEEL = '#c8ba1c';
/** A dashed line across the width at y = 12. */
const streep = (kleur, reeks, begin = 0) =>
  `<path d="M0 12H64" stroke="${kleur}" stroke-width="2.6" stroke-dasharray="${reeks}" stroke-dashoffset="${begin}"/>`;

export default {
  id: 'grenzen', titel: 'Grenzen',
  tekens: [
    // long dash, dot
    { naam: 'rijksgrens', teken: streep(ZWART, '12 3.8 3.4 3.8') },
    // black dash, yellow dot
    { naam: 'provinciegrens', teken: streep(ZWART, '8 11.6') + streep(GEEL, '4 15.6', -11.4) },
    // yellow and black dashes in turn, with wide gaps
    { naam: 'gemeentegrens', teken: streep(GEEL, '8.5 26.5') + streep(ZWART, '9 26', -17) },
  ],
};
