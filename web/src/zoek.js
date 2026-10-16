// Searching the bladen: every word of the question has to be found in the name, the other names, the English
// name, the category and groep, or the text. A hit in the name counts most - the whole name or a whole word of it
// more than a piece of a word - then the other names, then English, then the groep, then the text. Accents and
// case do not matter: "coordinaten" finds Coördinaten. A plural finds the singular: "tenten" finds Tent,
// "bomen" Boom. Words in `zoekOok` count as other names but are not shown on the card: brand names, so that
// "recta" finds the spiegelpeilkompas.
import { BLADEN } from './data/bladen/index.js';
import { CATEGORIE, groepNaam } from './data/categorieen.js';

export const normaal = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tekst = (v) => (Array.isArray(v) ? v.join(' ') : v ?? '');
const woordenVan = (s) => new Set(s.split(/[^a-z0-9]+/).filter(Boolean));

const INDEX = BLADEN.map((blad) => {
  const naam = normaal(blad.naam);
  const ook = normaal(tekst([...(blad.ook ?? []), ...(blad.zoekOok ?? [])]));
  return {
    blad,
    naam, naamWoorden: woordenVan(naam),
    ook, ookWoorden: woordenVan(ook),
    en: normaal(blad.en),
    groep: normaal(`${CATEGORIE[blad.categorie]?.naam ?? ''} ${groepNaam(blad.categorie, blad.groep)}`),
    tekst: normaal([tekst(blad.uitleg), blad.waarvoor, blad.letOp, ...(blad.tabel?.rijen.flat() ?? []), ...(blad.soorten?.flatMap((s) => [s.naam, s.bij]) ?? [])].join(' ')),
  };
});

const begintWoord = (veld, w) => veld.startsWith(w) || veld.includes(` ${w}`) || veld.includes(`-${w}`);

/** How well one word fits a blad; 0 when it is not there. */
function score(item, w) {
  return item.naam === w || item.naam.startsWith(w) ? 100 : item.naamWoorden.has(w) ? 90 : begintWoord(item.naam, w) ? 70
    : item.ookWoorden.has(w) ? 60 : item.naam.includes(w) ? 45
      : begintWoord(item.ook, w) ? 35 : item.ook.includes(w) ? 25
        : begintWoord(item.en, w) ? 20 : item.en.includes(w) ? 12
          : item.groep.includes(w) ? 8
            : item.tekst.includes(w) ? 5 : 0;
}

/** The singular of a Dutch plural, as far as a few rules go: tenten > tent, bomen > boom, sterren > ster, vogels > vogel. */
function enkelvoud(w) {
  const uit = [];
  if (w.length >= 5 && w.endsWith('en')) {
    const stam = w.slice(0, -2);
    uit.push(stam);
    if (/([^aeiou])\1$/.test(stam)) uit.push(stam.slice(0, -1));                     // sterren > ster
    else if (/[^aeiou][aeiou][^aeiouwj]$/.test(stam)) uit.push(stam.replace(/([aeiou])([^aeiou])$/, '$1$1$2'));   // bomen > boom
  } else if (w.length >= 5 && w.endsWith('s')) uit.push(w.slice(0, -1).replace(/'$/, ''));
  return uit.filter((v) => v.length >= 4);                   // not regen > reg, wegen > weg
}

/** The bladen that match `vraag`, best first; within a category when one is given. */
export function zoek(vraag, { categorie } = {}) {
  const woorden = normaal(vraag).split(/[\s,]+/).filter(Boolean);
  if (!woorden.length) return [];
  const varianten = woorden.map(enkelvoud);
  const hits = [];
  for (const item of INDEX) {
    if (categorie && item.blad.categorie !== categorie) continue;
    let totaal = 0;
    for (const [k, w] of woorden.entries()) {
      // the singular counts less than a piece of a name that has the word itself ("tekens": Spoortekens before
      // Teken), and only in the names, not in the text
      const s = Math.max(score(item, w), ...varianten[k].map((v) => (score(item, v) >= 20 ? Math.round(score(item, v) * 0.4) : 0)));
      if (!s) { totaal = 0; break; }
      totaal += s;
    }
    if (totaal) hits.push([totaal, item.blad]);
  }
  return hits.sort((a, b) => b[0] - a[0] || a[1].naam.localeCompare(b[1].naam, 'nl')).map(([, blad]) => blad);
}
