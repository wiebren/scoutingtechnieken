// What the natuur pieces share: shuffling, and a link to another blad that stays in the view the card is in
// (Zoeken or Insignes).
import { h } from '../../dom.js';
import { href, huidige } from '../../router.js';

export const schud = (lijst) => {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uit[i], uit[j]] = [uit[j], uit[i]]; }
  return uit;
};

/** A link to a blad, in the page the card is shown on. */
export function bladLink(id, tekst) {
  const { pagina, params } = huidige();
  const adres = pagina === 'zoeken' || pagina === 'insignes' ? href(pagina, { ...params, blad: id }) : href('zoeken', { c: 'natuur', blad: id });
  return h('a.nt-link', { href: adres }, tekst);
}

/** An SVG string as an element. */
export const beeld = (svg, klasse = '') => h(`div.nt-beeld${klasse ? `.${klasse}` : ''}`, { html: svg });
