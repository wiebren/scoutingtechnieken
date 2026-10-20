// Words in the text of a blad that are the name of another blad become a link to it, so you can read on where the
// text mentions it. Only names, not the other names in `ook`: those are often ordinary words ("over", "punt"). A
// one-word name also matches its plural in -en or -s (mastworpen). Each blad is linked once per card, the first time
// it comes up, and never to itself.
import { BLADEN } from './data/bladen/index.js';
import { h } from './dom.js';

/** Names that in the text are nearly always an ordinary word: "teken" is a sign there, the blad is about ticks. */
const NIET = new Set(['teken']);

let patroon = null;
let naarId = null;

function maak() {
  naarId = new Map(BLADEN.map((b) => [b.naam.toLowerCase(), b.id]).filter(([naam]) => naam.length >= 4 && !NIET.has(naam)));
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const namen = [...naarId.keys()].sort((a, b) => b.length - a.length)
    .map((n) => (/^\p{L}+$/u.test(n) && n.length >= 6 ? `${esc(n)}(?:en|s)?` : esc(n)));
  patroon = new RegExp(`(?<![\\p{L}\\p{N}])(${namen.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
}

/** The id a matched word stands for: the name itself, or the name without its plural ending. */
function idVan(woord) {
  const w = woord.toLowerCase();
  return naarId.get(w) ?? naarId.get(w.replace(/(en|s)$/, ''));
}

/**
 * A function that turns a piece of text into text with links, for one card.
 * @param eigen the id of the blad on the card
 * @param linkNaar (id) => the address of that blad
 */
export function termLinks(eigen, linkNaar) {
  if (!patroon) maak();
  const al = new Set([eigen]);
  return (tekst) => {
    const uit = [];
    let i = 0;
    for (const m of tekst.matchAll(patroon)) {
      const id = idVan(m[1]);
      if (!id || al.has(id)) continue;
      al.add(id);
      uit.push(tekst.slice(i, m.index), h('a.term', { href: linkNaar(id) }, m[1]));
      i = m.index + m[1].length;
    }
    return i === 0 ? tekst : [...uit, tekst.slice(i)];
  };
}
