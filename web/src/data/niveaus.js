// The niveaus of a blad, for the choice of niveau in the menu: a blad is at every niveau of every insigne it is in
// (src/data/insignes.js), and "extra" when it is in no insigne at all. Worked out once, from the insignelaag; the
// bladen themselves know nothing of niveaus.
import { INSIGNES, NIVEAUS } from './insignes.js';

/** What can be chosen: the three niveaus of the insignes, and extra. */
export const KEUZES = [
  ...NIVEAUS.map(({ niveau, naam }) => ({ key: String(niveau), naam, kort: String(niveau) })),
  { key: 'extra', naam: 'Extra', kort: '+' },
];
export const ALLE = KEUZES.map((k) => k.key);

/** Whether a choice (a Set of keys) shows everything: nothing chosen (the start), or all four. */
export const alles = (keuze) => keuze.size === 0 || keuze.size >= ALLE.length;

const PER_BLAD = new Map();
for (const i of INSIGNES) {
  for (const [niveau, n] of Object.entries(i.niveaus)) {
    for (const d of n.delen) for (const id of d.bladen) {
      if (!PER_BLAD.has(id)) PER_BLAD.set(id, new Set());
      PER_BLAD.get(id).add(niveau);
    }
  }
}

/** The niveaus of a blad, ['1', '3'], or ['extra']. */
export const niveausVan = (id) => (PER_BLAD.has(id) ? [...PER_BLAD.get(id)].sort() : ['extra']);

/** Whether a choice (a Set of keys) shows this blad: everything is shown when nothing or all are chosen. */
export const inKeuze = (id, keuze) => alles(keuze) || niveausVan(id).some((k) => keuze.has(k));

/** The niveaus of the insignes (1, 2, 3) a choice has; all three when it has none of them (only extra). */
export const insigneNiveaus = (keuze) => {
  const gekozen = NIVEAUS.map((n) => n.niveau).filter((n) => keuze.has(String(n)));
  return gekozen.length ? gekozen : NIVEAUS.map((n) => n.niveau);
};

/** A choice in words: "Alle niveaus", "Niveau 1 en 2", "Niveau 3 en extra", "Alleen extra". */
export function inWoorden(keuze) {
  if (alles(keuze)) return 'Alle niveaus';
  const en = (lijst) => (lijst.length > 1 ? `${lijst.slice(0, -1).join(', ')} en ${lijst.at(-1)}` : lijst[0]);
  const nrs = NIVEAUS.map((n) => String(n.niveau)).filter((k) => keuze.has(k));
  if (!nrs.length) return 'Alleen extra';
  return keuze.has('extra') ? `Niveau ${nrs.join(', ')} en extra` : `Niveau ${en(nrs)}`;
}
