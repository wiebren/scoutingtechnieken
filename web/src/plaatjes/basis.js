// What the drawings share: rounding, a point on a circle, the <svg> around a drawing, and a line of text. The
// classes (vlak, lijn, accent, tekst, ...) are in src/style.css under .plaatje; a category may add its own in
// ./<categorie>.css, which src/main.js and plaatjes.html load.

/** Rounded to one decimal, to keep the SVG short. */
export const r1 = (n) => Math.round(n * 10) / 10;
/** The point at `graden` (clockwise from up) on a circle of radius r around (cx, cy). */
export const pol = (cx, cy, r, graden) => [r1(cx + r * Math.sin((graden * Math.PI) / 180)), r1(cy - r * Math.cos((graden * Math.PI) / 180))];
/** A drawing: width, height, what it shows (for a screen reader), and the inside. */
export const svg = (w, h, titel, inhoud) =>
  `<svg class="plaatje" viewBox="0 0 ${w} ${h}" role="img" aria-label="${titel}" xmlns="http://www.w3.org/2000/svg">${inhoud}</svg>`;
/** A line of text in the drawing. */
export const tekst = (x, y, t, { maat = 11, anker = 'middle', klasse = '' } = {}) =>
  `<text x="${x}" y="${y}" class="tekst ${klasse}" font-size="${maat}" text-anchor="${anker}">${t}</text>`;
