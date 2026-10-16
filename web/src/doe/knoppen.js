// Chips the pieces share: one choice out of a few (aria-pressed on the chosen one), and a chip that turns
// something on and off.
import { h } from '../dom.js';

/** Chips for a choice: lijst = [[waarde, tekst]], `nu` chosen; zet(waarde) when another is tapped. */
export function keuze(lijst, nu, zet) {
  const chips = lijst.map(([waarde, tekst]) => h('button.chip', { type: 'button', 'aria-pressed': String(waarde === nu),
    onclick: () => { chips.forEach((c, j) => c.setAttribute('aria-pressed', String(lijst[j][0] === waarde))); zet(waarde); } }, tekst));
  return chips;
}

/** A chip that is on or off; zet(aan) when tapped. */
export function schakel(tekst, aan, zet) {
  const chip = h('button.chip', { type: 'button', 'aria-pressed': String(aan),
    onclick: () => { aan = !aan; chip.setAttribute('aria-pressed', String(aan)); zet(aan); } }, tekst);
  return chip;
}
