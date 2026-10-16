// Hydrografie, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
// The Kadaster puts most of these in one lettered water picture; here each gets its own small sign, with a bit of
// water and bank around it where that makes it recognisable.
const WATER = '#ADDAF0'; const LAND = '#DEE9AF'; const OEVER = '#4D513C'; const LIJN = '#3FB6DF';
const TEKST = 'font-family="sans-serif"';

/** A watercourse wider than 6 m: a light blue band with blue edges from x1 to x2, centred on y. */
const band = (x1, x2, y = 12) => `<path d="M${x1} ${y - 2.4}H${x2}V${y + 2.4}H${x1}Z" fill="${WATER}"/>`
  + `<path d="M${x1} ${y - 2.4}H${x2}M${x1} ${y + 2.4}H${x2}" stroke="${LIJN}" stroke-width=".6"/>`;
/** A narrow watercourse as a thin blue line. */
const loop = (d) => `<path d="${d}" stroke="${LIJN}" stroke-width=".9"/>`;
/** The black chevrons that mark where a watercourse goes under something: '>' at x pointing right, or '<'. */
const punt = (x, rechts, y = 12) => `<path d="M${x + (rechts ? -1.5 : 1.5)} ${y - 1.5}L${x} ${y}L${x + (rechts ? -1.5 : 1.5)} ${y + 1.5}" fill="none" stroke="#000" stroke-width=".6"/>`;
/** A river running up the page between two banks; signs on it sit at x 32. */
const rivier = `<path d="M0 0H64V24H0Z" fill="${LAND}"/><path d="M18 0H46V24H18Z" fill="${WATER}"/>`
  + `<path d="M18 0V24M46 0V24" stroke="${OEVER}" stroke-width=".6"/>`;
/** Water on the left, a bank on the right; signs on the bank sit at x 38. */
const oever = `<path d="M0 0H64V24H0Z" fill="${LAND}"/><path d="M0 0H22V24H0Z" fill="${WATER}"/>`
  + `<path d="M22 0V24" stroke="${OEVER}" stroke-width=".6"/>`;
const vlak = (kleur, h = 24) => `<path d="M0 0H64V${h}H0Z" fill="${kleur}"/>`;
const veerlijn = '<path d="M14 12H50" stroke="#4E5E66" stroke-width=".7" stroke-dasharray="2 1.3"/>';

// The tidal picture: high water (black), low water (orange dots), LAT and depth lines (blue dashes).
const DROOG = '#C5E5F4'; const ONDIEP = '#D1EAF6'; const ZEE = '#E2F1F9'; const DIEPTE = '#0096D2';
const twee = (boven, onder) => `<path d="M0 0H64V12H0Z" fill="${boven}"/><path d="M0 12H64V24H0Z" fill="${onder}"/>`;
const stippen = Array.from({ length: 16 }, (_, i) => `<circle cx="${2 + 4 * i}" cy="12" r=".7"/>`).join('');
/** A dashed blue depth line with its number in a gap in the middle. */
const dieptelijn = (getal) => `<path d="M0 12H24M40 12H64" stroke="${DIEPTE}" stroke-width=".7" stroke-dasharray="2 1"/>`
  + `<text x="32" y="14.6" font-size="7" text-anchor="middle" fill="${DIEPTE}" ${TEKST}>${getal}</text>`;

export default {
  id: 'water', titel: 'Water',
  tekens: [
    { naam: 'waterloop: smaller dan 3 m', teken: loop('M0 12H64') },
    { naam: 'waterloop: 3-6 m breed', teken: '<path d="M0 12H64" stroke="#0088CD" stroke-width="1.2"/>' },
    { naam: 'waterloop: breder dan 6 m', teken: band(0, 64) },
    {
      naam: 'schutsluis',
      teken: `<path d="M0 9.6H14L17 10.7H43L46 9.6H64V14.4H46L43 13.3H17L14 14.4H0Z" fill="${WATER}"/>`
        + `<path d="M0 9.6H14L17 10.7H43L46 9.6H64M0 14.4H14L17 13.3H43L46 14.4H64" fill="none" stroke="${LIJN}" stroke-width=".6"/>`
        + `${punt(24, false)}${punt(34, false)}<text x="14" y="7" font-size="5.5" ${TEKST}>Sch sl</text>`,
    },
    {
      naam: 'stuwen',
      teken: `${band(0, 28)}<path d="M20 8.6V15.4" stroke="#555" stroke-width="1.2"/>${loop('M28 12H64')}`
        + '<path d="M46 10V14" stroke="#333" stroke-width=".7"/>',
    },
    { naam: 'koedam', teken: `${loop('M0 12H64')}<path d="M30.5 10.4V13.6M33.5 10.4V13.6" stroke="#333" stroke-width=".6"/>` },
    { naam: 'duiker', teken: `${loop('M0 12H26.4M37.6 12H64')}${punt(26.6, true)}${punt(37.4, false)}` },
    {
      naam: 'grondduiker', h: 28,
      teken: `${band(0, 64, 14)}${loop('M30 0V10M30 18V28')}`
        + '<path d="M28.6 8.4L30 10L31.4 8.4M28.6 19.6L30 18L31.4 19.6" fill="none" stroke="#000" stroke-width=".6"/>'
        + `<text x="34" y="8" font-size="6" ${TEKST}>Gd</text>`,
    },
    {
      naam: 'afsluitbare duiker',
      teken: `${loop('M0 10H26.4M37.6 10H64')}${punt(26.6, true, 10)}${punt(37.4, false, 10)}`
        + `<text x="37" y="20" font-size="6" ${TEKST}>Sl</text>`,
    },
    { naam: 'bron, wel', teken: `<text x="18" y="11" font-size="6.5" ${TEKST}>Bron</text><circle cx="36" cy="15" r="1.2" fill="#0096D2"/>` },
    {
      naam: 'afvalwaterzuiveringsbekkens',
      teken: `<g fill="${WATER}" stroke="#E8312A" stroke-width=".6"><circle cx="22" cy="12" r="3.8"/><ellipse cx="38" cy="12" rx="6.4" ry="3.6"/></g>`,
    },
    { naam: 'pontveer', teken: `${rivier}${veerlijn}<path d="M27.5 10.3H36.5V13.7H27.5Z" fill="#181717"/>` },
    { naam: 'fiets- en voetveer', teken: `${rivier}${veerlijn}<ellipse cx="32" cy="12" rx="1.6" ry="1.1" fill="#fff" stroke="#181717" stroke-width=".5"/>` },
    {
      naam: 'peilschaal',
      teken: `${oever}<path d="M36.4 2H39.6V14H36.4Z" fill="#fff" stroke="#000" stroke-width=".6"/>`
        + '<path d="M36.4 5.6H39.6M36.4 9.6H39.6" stroke="#8C8C8C" stroke-width="1"/><path d="M38 14V22" stroke="#000" stroke-width=".6"/>',
    },
    {
      naam: 'kilometerraaibord',
      teken: `${oever}<path d="M33.5 4.4H42.5V8H33.5Z" fill="#181717"/><path d="M35 5.6H41V6.8H35Z" fill="#ddd"/>`
        + '<path d="M38 8V19.5" stroke="#000" stroke-width="1"/>',
    },
    {
      naam: 'baak',
      teken: `${oever}<path d="M38 4V21" stroke="#000" stroke-width=".8"/><path d="M37.1 5L38 2.8L38.9 5Z" fill="#000"/>`
        + '<path d="M38 6.6L40.2 10L38 13.4L35.8 10Z" fill="#000"/><path d="M38 8.8L38.8 10L38 11.2L37.2 10Z" fill="#bbb"/>',
    },
    { naam: 'dok', teken: `${vlak(WATER)}<path d="M29.8 7.4H34.2V16.6H29.8Z" fill="#fff" stroke="#D9A2A5" stroke-width=".7"/>` },
    { naam: 'dukdalf', teken: `${vlak(WATER)}<circle cx="32" cy="12" r="1.1" fill="#fff" stroke="#8A9AA5" stroke-width=".6"/>` },
    {
      naam: 'scheepsvaartlicht',
      teken: `${oever}<path d="M38 3.4V10.6M34.4 7H41.6M35.5 4.5L40.5 9.5M40.5 4.5L35.5 9.5" stroke="#000" stroke-width=".6"/>`
        + '<circle cx="38" cy="7" r="1.6"/><circle cx="38" cy="7" r=".6" fill="#ccc"/><path d="M38 8.6V19" stroke="#000" stroke-width=".8"/>'
        + '<path d="M35 19.6H41M36.4 19.6L38 17.2L39.6 19.6Z" stroke="#000" stroke-width=".8"/>',
    },
    {
      naam: 'aanlegsteigers',
      teken: `${vlak(WATER)}<path d="M44 0H64V24H44Z" fill="${LAND}"/><path d="M44 0V24" stroke="${OEVER}" stroke-width=".6"/>`
        + '<path d="M44 6.5H34M34 3.8V9.2" stroke="#000" stroke-width=".6"/>'
        + '<path d="M44 14.6H30V21H32.4V17H44" fill="#fff" stroke="#8F8A88" stroke-width=".6"/>',
    },
    {
      naam: 'versterkt talud',
      teken: `<path d="M0 0H64V9.8H0Z" fill="${WATER}"/><path d="M0 14.2H64V24H0Z" fill="${LAND}"/>`
        + '<path d="M0 9.8H64V14.2H0Z" fill="#D4D3D3"/>'
        + `<path d="${Array.from({ length: 15 }, (_, i) => `M${4.4 * i} 9.8l4.4 4.4m0 -4.4l-4.4 4.4`).join('')}" stroke="#8D8C8C" stroke-width=".45"/>`
        + `<path d="M0 9.8H64M0 14.2H64" stroke="${OEVER}" stroke-width=".5"/>`,
    },
    { naam: 'dieptegetal', teken: `${vlak(WATER)}<text x="32" y="15" font-size="8" text-anchor="middle" fill="${DIEPTE}" ${TEKST}>-3</text>` },
    { naam: 'hoogwaterlijn', teken: `${twee(LAND, DROOG)}<path d="M0 12H64" stroke="#000" stroke-width=".9"/>` },
    { naam: 'laagwaterlijn', teken: `${twee(DROOG, ONDIEP)}<g fill="#B64200">${stippen}</g>` },
    { naam: 'LAT (laagste astronomisch getij)', teken: `${twee(ONDIEP, ZEE)}${dieptelijn('-0.7')}` },
    { naam: 'dieptelijnen', teken: `${vlak(ZEE)}${dieptelijn('10')}` },
    { naam: 'droogvallende grond', teken: `<path d="M4 3H60V21H4Z" fill="${ONDIEP}"/><path d="M4 3H46C36 10 22 15 4 17Z" fill="${DROOG}"/>` },
    {
      naam: 'krib, golfbreker',
      teken: `<path d="M0 0H64V7H0Z" fill="${LAND}"/><path d="M0 7H64V24H0Z" fill="${DROOG}"/>`
        + '<path d="M0 7H64" stroke="#000" stroke-width=".9"/><path d="M28 7L38 21" stroke="#000" stroke-width="1.1"/>',
    },
  ],
};
