// The choice of niveau in the menu: Niveau 1, 2, 3 and Extra, as in the insignes, any number of them at once.
// Zoeken, Oefenen and Insignes then show only what belongs to it (src/data/niveaus.js); a link to a blad still
// opens. In the sidebar (from 1100px) the four switches stand under the pages; in the bottom bar and the rail one
// button shows the choice and opens them in a popover. None on (the start) is no filter; tap one to see only that.
import { alles, inWoorden, KEUZES } from './data/niveaus.js';
import { h } from './dom.js';
import { niveauKeuze, volgNiveauKeuze, zetNiveauKeuze } from './opslag.js';

/** The four switches; each set of them follows the choice by itself. */
function schakelaars() {
  const knoppen = KEUZES.map(({ key, naam, kort }) => h('button.niveau-schakel', {
    type: 'button', 'data-niveau': key,
    onclick: () => {
      const keuze = new Set(niveauKeuze());
      if (keuze.has(key)) keuze.delete(key); else keuze.add(key);
      zetNiveauKeuze([...keuze]);
    },
  }, h('span.niveau-stip', { 'aria-hidden': 'true' }, kort), h('span', naam)));
  const allesKnop = h('button.knop.klein.niveau-alles', { type: 'button', onclick: () => zetNiveauKeuze([]) }, 'Alles tonen');
  const el = h('div.niveau-schakelaars', h('div.niveau-rij', { role: 'group', 'aria-label': 'Niveau' }, knoppen), allesKnop);
  const toon = (keuze) => {
    for (const k of knoppen) k.setAttribute('aria-pressed', String(keuze.has(k.dataset.niveau)));
    allesKnop.hidden = keuze.size === 0;
  };
  toon(niveauKeuze());
  volgNiveauKeuze(toon);
  return el;
}

export function niveauMenu() {
  const stippen = h('span.nav-icoon.niveau-stippen', { 'aria-hidden': 'true' },
    KEUZES.map(({ key, kort }) => h('span.niveau-stip', { 'data-niveau': key }, kort)));
  const knop = h('button.nav-item.niveau-knop', { type: 'button', popovertarget: 'niveau-keuze' }, stippen, h('span.nav-naam', 'Niveau'));
  const samenvatting = h('p.niveau-nu');
  const pop = h('div.niveau-pop', { id: 'niveau-keuze', popover: 'auto', role: 'dialog', 'aria-labelledby': 'niveau-pop-titel' },
    h('h2', { id: 'niveau-pop-titel' }, 'Welk niveau?'),
    h('p.niveau-uitleg', 'Tik een of meer niveaus aan. Dan zie je alleen wat bij die niveaus van de insignes hoort. Extra is alles wat in geen insigne zit. Niets aangetikt? Dan zie je alles.'),
    schakelaars(), samenvatting);
  const zij = h('section.niveau-zij', { 'aria-labelledby': 'niveau-zij-titel' },
    h('h2.niveau-zij-kop', { id: 'niveau-zij-titel' }, 'Niveau'), schakelaars());

  // the popover stands next to its button: above it in the bottom bar, beside it in the rail
  pop.addEventListener('beforetoggle', (e) => {
    if (e.newState !== 'open') return;
    const r = knop.getBoundingClientRect();
    const naast = r.left < 120 && innerWidth >= 760;
    Object.assign(pop.style, naast
      ? { left: `${Math.round(r.right + 8)}px`, top: `${Math.round(Math.max(8, Math.min(r.top, innerHeight - 340)))}px`, bottom: 'auto', right: 'auto' }
      : { right: '8px', bottom: `${Math.round(innerHeight - r.top + 8)}px`, left: 'auto', top: 'auto' });
  });

  const toon = (keuze) => {
    for (const s of stippen.children) s.classList.toggle('uit', !alles(keuze) && !keuze.has(s.dataset.niveau));
    const woorden = inWoorden(keuze);
    knop.setAttribute('aria-label', `Niveau kiezen. Nu: ${woorden}`);
    knop.classList.toggle('gefilterd', !alles(keuze));
    samenvatting.textContent = alles(keuze) ? 'Je ziet nu alles.' : `Je ziet nu: ${woorden.toLowerCase()}.`;
  };
  toon(niveauKeuze());
  volgNiveauKeuze(toon);

  return { knop, pop, zij };
}
