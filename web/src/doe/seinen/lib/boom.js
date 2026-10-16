// The morseboom: from the top, a punt goes left and a streep goes right, and where you stop is the letter. Four
// steps deep, as far as the letters go. As an SVG string, with a path lit (`pad`: '.-'), for the drawing and the
// piece. Classes (mb-*) in src/plaatjes/seinen.css.
import { MORSE } from '../../codes.js';

const TERUG = Object.fromEntries(Object.entries(MORSE).filter(([l]) => /[A-Z]/.test(l)).map(([l, c]) => [c, l]));
export const BOOM_BREED = 360;
export const BOOM_HOOG = 244;

/** Where a code sits in the tree. */
export function plek(code) {
  const d = code.length;
  const index = [...code].reduce((n, s) => n * 2 + (s === '-' ? 1 : 0), 0);
  const breed = BOOM_BREED / 2 ** d;
  return [Math.round((index + 0.5) * breed * 10) / 10, 22 + d * 52];
}

/** The tree as SVG elements; `pad` the code typed so far, lit from the top. */
export function boom(pad = '') {
  const codes = [''];
  for (let d = 1; d <= 4; d++) for (const c of codes.filter((x) => x.length === d - 1)) codes.push(`${c}.`, `${c}-`);
  let lijnen = '';
  let knopen = '';
  for (const c of codes) {
    const [x, y] = plek(c);
    const op = pad.startsWith(c) && pad.length >= c.length;
    if (c) {
      const [px, py] = plek(c.slice(0, -1));
      lijnen += `<line x1="${px}" y1="${py}" x2="${x}" y2="${y}" class="mb-tak${op ? ' op' : ''}${c.at(-1) === '-' ? ' streep' : ''}"/>`;
    }
    const letter = c ? TERUG[c] : 'start';
    const nu = c === pad;
    knopen += c
      ? `<circle cx="${x}" cy="${y}" r="${c.length === 4 ? 9 : 12}" class="mb-knoop${op ? ' op' : ''}${nu ? ' nu' : ''}${letter ? '' : ' leeg'}"/>`
        + (letter ? `<text x="${x}" y="${y}" class="mb-letter${nu ? ' nu' : ''}" font-size="${c.length === 4 ? 11 : 13}" text-anchor="middle" dominant-baseline="central">${letter}</text>` : '')
      : `<circle cx="${x}" cy="${y}" r="6" class="mb-knoop start${nu ? ' nu' : ''}"/>`;
  }
  const uitleg = `<text x="8" y="16" class="mb-uitleg" font-size="11">← punt</text><text x="${BOOM_BREED - 8}" y="16" class="mb-uitleg" font-size="11" text-anchor="end">streep →</text>`;
  return uitleg + lijnen + knopen;
}

/** The letter of a code in the tree, or undefined. */
export const letterVan = (code) => TERUG[code];
