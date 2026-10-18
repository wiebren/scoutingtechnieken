// The app's mark: a plain windroos on scouting green - no emblem or logo of an organisation (not yet, see the
// README). One drawing for the app icons (scripts/icons.mjs) and the mark at the top of the menu (main.js), so the
// two are the same picture.
export const MERK_GROEN = '#00803f';   // --groen in style.css: the scouting green, dark enough for white on it

/** The mark at 512 units. A maskable icon is cut to a circle or a squircle by the launcher: there the background
 *  fills the square and the star stays inside the safe zone (the middle 80 %). */
export function merkSvg({ size = 512, maskable = false } = {}) {
  const s = maskable ? 0.62 : 0.78;                               // the star's share of the square
  const star = (r, w) => `M256 ${256 - r} L${256 + w} ${256 - w} L${256 + r} 256 L${256 + w} ${256 + w} L256 ${256 + r} L${256 - w} ${256 + w} L${256 - r} 256 L${256 - w} ${256 - w}Z`;
  const R = 256 * s; const r2 = R * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${maskable ? `<rect width="512" height="512" fill="${MERK_GROEN}"/>` : `<rect x="16" y="16" width="480" height="480" rx="108" fill="${MERK_GROEN}"/>`}
  <g transform="rotate(45 256 256)" opacity="0.45"><path d="${star(r2, r2 * 0.2)}" fill="#fff"/></g>
  <path d="${star(R, R * 0.17)}" fill="#fff"/>
  <circle cx="256" cy="256" r="${R * 0.09}" fill="${MERK_GROEN}"/>
</svg>`;
}
