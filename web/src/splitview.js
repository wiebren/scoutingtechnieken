// A list with a card, as Zoeken and Insignes have it. On a phone the card covers the list when it is open,
// and the list keeps its place underneath (it stays laid out, so its scroll position is not lost). On a wide
// screen (style.css, 1100px) the two stand side by side, and the card pane says what to do when it is empty.
import { bladKaart } from './bladkaart.js';
import { h, vul } from './dom.js';
import { icoon } from './iconen.js';

/** Wide enough for the list and the card side by side: the same width as in style.css. */
export const NAAST = matchMedia('(min-width: 1100px)');

/**
 * @param leeg what the card pane says on a wide screen when no blad is open
 * @param opTerug what Terug on the card does
 * @param linkNaar (id) => the address of a blad in this view
 */
export function splitView({ leeg, opTerug, linkNaar }) {
  const lijstBalk = h('header.balk');
  const lijstInhoud = h('div.scroll');
  const kaartTitel = h('span.balk-titel');
  const kaartInhoud = h('div.scroll');
  const kaart = h('section.paneel.kaartpaneel', { 'aria-label': 'Onderwerp' },
    h('header.balk.kaartbalk',
      h('button.terug', { type: 'button', onclick: () => opTerug() }, icoon('terug'), h('span', 'Terug')),
      kaartTitel),
    kaartInhoud);
  const el = h('div.view.split', h('section.paneel.lijstpaneel', lijstBalk, lijstInhoud), kaart);
  let open = null;

  /** Show a blad on the card, or none. */
  function toonBlad(blad) {
    if (blad?.id === open) return;
    open = blad?.id ?? null;
    el.classList.toggle('met-kaart', !!blad);
    kaartTitel.textContent = blad?.naam ?? '';
    vul(kaartInhoud, blad ? bladKaart(blad, { linkNaar }) : h('div.leeg-kaart', icoon('zoeken', 'icoon groot'), h('p', leeg)));
    kaartInhoud.scrollTop = 0;
    // for a screen reader and the keyboard: the card's name, when the card covers the list (side by side the
    // focus stays in the list, to go on from there)
    if (blad && !NAAST.matches) requestAnimationFrame(() => kaartInhoud.querySelector('h2')?.focus({ preventScroll: true }));
  }

  return { el, lijstBalk, lijstInhoud, toonBlad, get open() { return open; } };
}
