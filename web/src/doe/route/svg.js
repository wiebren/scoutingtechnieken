// Two small SVG helpers for the route drawings, the same as in ../kompasdelen.js (which also pulls in all the
// drawings of plaatjes.js; the route walker does not need those).
const NS = 'http://www.w3.org/2000/svg';

/** An SVG element with attributes and children. */
export function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids.flat());
  return el;
}
/** A point at a distance and a direction (degrees from up, clockwise) from cx, cy, in screen coordinates. */
export const pol = (cx, cy, r, g) => [cx + r * Math.sin((g * Math.PI) / 180), cy - r * Math.cos((g * Math.PI) / 180)];
