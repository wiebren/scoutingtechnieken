// Searching the bladen: every word of the question has to be found in the name, the other names, the English
// name or the text. A hit in the name counts most, at the start of the name more than halfway, then the other
// names, then English, then the text. Accents and case do not matter: "coordinaten" finds Coördinaten.
import { BLADEN } from './data/bladen/index.js';

export const normaal = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tekst = (v) => (Array.isArray(v) ? v.join(' ') : v ?? '');

const INDEX = BLADEN.map((blad) => ({
  blad,
  naam: normaal(blad.naam),
  ook: normaal(tekst(blad.ook)),
  en: normaal(blad.en),
  tekst: normaal([tekst(blad.uitleg), blad.waarvoor, blad.letOp].join(' ')),
}));

const begintWoord = (veld, w) => veld.startsWith(w) || veld.includes(` ${w}`) || veld.includes(`-${w}`);

/** The bladen that match `vraag`, best first; within a category when one is given. */
export function zoek(vraag, { categorie } = {}) {
  const woorden = normaal(vraag).split(/[\s,]+/).filter(Boolean);
  if (!woorden.length) return [];
  const hits = [];
  for (const item of INDEX) {
    if (categorie && item.blad.categorie !== categorie) continue;
    let score = 0;
    for (const w of woorden) {
      const s = item.naam.startsWith(w) ? 100 : begintWoord(item.naam, w) ? 70 : item.naam.includes(w) ? 45
        : begintWoord(item.ook, w) ? 35 : item.ook.includes(w) ? 25
          : begintWoord(item.en, w) ? 20 : item.en.includes(w) ? 12
            : item.tekst.includes(w) ? 5 : 0;
      if (!s) { score = 0; break; }
      score += s;
    }
    if (score) hits.push([score, item.blad]);
  }
  return hits.sort((a, b) => b[0] - a[0] || a[1].naam.localeCompare(b[1].naam, 'nl')).map(([, blad]) => blad);
}
