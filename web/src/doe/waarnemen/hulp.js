// What the pieces of waarnemen and veiligheid share: the SVG helper, a pointer position in SVG coordinates, a drag
// on an SVG that cleans up after itself, numbers in Dutch, and a shuffle.
import { s } from '../kompasdelen.js';

export { s };

/** A number the Dutch way: 1.234,5 */
export const getal = (n, cijfers = 0) => n.toLocaleString('nl-NL', { maximumFractionDigits: cijfers, minimumFractionDigits: 0 });

/** A whole number between a and b (both included). */
export const tussen = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/** The list in a random order (a copy). */
export function schud(lijst) {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uit[i], uit[j]] = [uit[j], uit[i]]; }
  return uit;
}

/** The pointer of event e in the coordinates of svg. */
export function naarSvg(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

/**
 * Drag on an SVG (or on an element in it): beweeg({x, y}) while the pointer is down, klaar() when it lets go.
 * Pointer capture keeps the events on the element, so nothing is left behind on window or document.
 */
export function sleep(el, svg, beweeg, klaar) {
  let aan = false;
  el.addEventListener('pointerdown', (e) => { aan = true; el.setPointerCapture?.(e.pointerId); e.preventDefault(); beweeg(naarSvg(svg, e)); });
  el.addEventListener('pointermove', (e) => { if (aan) beweeg(naarSvg(svg, e)); });
  const los = () => { if (aan) { aan = false; klaar?.(); } };
  el.addEventListener('pointerup', los);
  el.addEventListener('pointercancel', los);
}

/** True when the reader asked for less motion. */
export const rustig = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
