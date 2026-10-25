// What the pieces share. Chips for a choice: one out of a few (aria-pressed on the chosen one), or one that turns
// something on and off; a chip names an option or a state. And buttons for an action: a command with an icon, in a
// row of their own below a line (acties), so they never look like one of the choices.
import { h } from '../dom.js';
import { icoon } from '../iconen.js';

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

/**
 * A button that does something: a short command ("Kijk na", "Steek aan"), with an icon from src/iconen.js when one
 * fits (start, stop, opnieuw, vink, verder, terug, oog, wis, geluid, klok) or null.
 * @param opties { hoofd: the main action of the piece, klein, hidden, disabled }
 */
export function actie(tekst, ico, onclick, { hoofd = false, klein = false, ...rest } = {}) {
  const knop = h(`button.knop${hoofd ? '.hoofd' : ''}${klein ? '.klein' : ''}`, { type: 'button', onclick, ...rest });
  zetActie(knop, tekst, ico);
  return knop;
}

/** Give an action button another command and icon (as a start button that becomes a stop button). */
export function zetActie(knop, tekst, ico) {
  knop.replaceChildren(...(ico ? [icoon(ico, 'icoon klein')] : []), tekst);
}

/** The row of actions of a piece: below the choices, apart from them by a line. */
export const acties = (...knoppen) => h('div.knop-rij.acties', knoppen);
