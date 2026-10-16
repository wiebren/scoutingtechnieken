// Spoorwegen, drawn again from the Kadaster legenda TOP25raster (CC BY 4.0). See ./index.js.
const ROOD = '#e3231d';
const LETTER = 'font-family="Arial,Helvetica,sans-serif" font-weight="bold" text-anchor="middle"';

/** A railway: a black band with white pieces inside; `stuk` is the length of one black or white piece. */
const spoor = (stuk, wit) =>
  `<rect y="10.5" width="64" height="3" fill="#111"/>` +
  `<path d="M0 12H64" stroke="#fff" stroke-width="${wit}" stroke-dasharray="${stuk} ${stuk}" stroke-dashoffset="${2 * stuk - 6.7}"/>`;
/** The line of a sneltram or metro, with the black block of a stop at x. */
const lijn = (boven, midden, onder, x = 30.3) =>
  `<rect y="10.6" width="64" height="0.95" fill="${boven}"/><rect y="11.55" width="64" height="0.9" fill="${midden}"/>` +
  `<rect y="12.45" width="64" height="0.95" fill="${onder}"/><rect x="${x}" y="10.6" width="3.4" height="2.8" fill="#111"/>`;
const sneltram = (x) => lijn('#a09f9f', '#fff', '#111', x);
const metro = (x) => lijn('#5b5b5a', '#bbbbba', '#5b5b5a', x);
const letter = (l, fs) => `<text x="32" y="${12 + fs * 0.36}" ${LETTER} font-size="${fs}" fill="${ROOD}">${l}</text>`;

export default {
  id: 'spoorwegen', titel: 'Spoor',
  tekens: [
    { naam: 'spoorweg: enkelspoor', teken: spoor(10.5, 1.6) },
    { naam: 'spoorweg: meersporig', teken: spoor(14.3, 1) },
    { naam: 'station', teken: spoor(10.5, 1.6) + '<rect x="27.85" y="7.85" width="8.3" height="8.3" fill="#fff" stroke="#111" stroke-width="1.7"/>' },
    { naam: 'spoorweg in tunnel', teken: '<path d="M0 10.7H64M0 13.3H64" stroke="#808080" stroke-width="0.9" stroke-dasharray="4.6 3.8"/>' },
    { naam: 'tramweg', teken: '<rect y="11.15" width="64" height="1.7" fill="#9d9d9d"/><path d="M17.7 10.3V13.7M46.3 10.3V13.7" stroke="#7a7a7a" stroke-width="1.6"/>' },
    { naam: 'sneltram', teken: sneltram(30.3) },
    { naam: 'sneltramhalte', teken: sneltram(27.6) + letter('S', 11) },
    { naam: 'metro bovengronds', teken: metro(30.3) },
    { naam: 'metrostation', teken: metro(27.2) + letter('M', 11) },
  ],
};
