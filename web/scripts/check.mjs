// Checks the data before a build (`pnpm check`, and the first step of `pnpm build`): every id once, every blad in
// a groep its category has, every link to a blad that exists, and the insignelaag pointing only at bladen that
// are there. A mistake stops the build with a list of what is wrong.
import { BLAD, BLADEN } from '../src/data/bladen/index.js';
import { CATEGORIE } from '../src/data/categorieen.js';
import { INSIGNES, NIVEAUS } from '../src/data/insignes.js';
import { UPDATES } from '../src/data/updates.js';

const fouten = [];
const fout = (waar, wat) => fouten.push(`${waar}: ${wat}`);

const gezien = new Set();
for (const b of BLADEN) {
  const waar = `blad ${b.id ?? '(zonder id)'}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.id ?? '')) fout(waar, 'id moet uit kleine letters, cijfers en streepjes bestaan');
  if (gezien.has(b.id)) fout(waar, 'id komt twee keer voor');
  gezien.add(b.id);
  if (!b.naam) fout(waar, 'geen naam');
  if (!CATEGORIE[b.categorie]?.groepen.some(([g]) => g === b.groep)) fout(waar, `groep "${b.groep}" bestaat niet in ${b.categorie}`);
  for (const n of b.naar ?? []) {
    if (n.blad && !BLAD[n.blad]) fout(waar, `naar een blad dat er niet is: ${n.blad}`);
    if (n.blad === b.id) fout(waar, 'verwijst naar zichzelf');
  }
  for (const v of b.verwijs ?? []) if (!/^https:\/\//.test(v.url ?? '') || !v.naam) fout(waar, 'verwijs heeft een naam en een https-adres nodig');
  if (b.letterlijk && (!b.bron || !b.bronDatum)) fout(waar, 'een regel toont zijn bron en datum: geef ze allebei');
  if (b.tabel && b.tabel.rijen.some((r) => r.length !== b.tabel.kop.length)) fout(waar, 'een rij van de tabel heeft niet evenveel cellen als de kop');
  for (const veld of ['niveau', 'insigne', 'insignes', 'verzamelingen', 'klasse']) {
    if (veld in b) fout(waar, `"${veld}" hoort niet bij een blad: de insignelaag staat in src/data/insignes.js`);
  }
}

for (const i of INSIGNES) {
  for (const [nr, n] of Object.entries(i.niveaus)) {
    if (!NIVEAUS.some((x) => String(x.niveau) === nr)) fout(`insigne ${i.id}`, `onbekend niveau ${nr}`);
    for (const d of n.delen) for (const id of d.bladen) if (!BLAD[id]) fout(`insigne ${i.id} niveau ${nr}`, `blad bestaat niet: ${id}`);
  }
  if (i.compleet && NIVEAUS.some(({ niveau }) => !i.niveaus[niveau]?.kort)) fout(`insigne ${i.id}`, 'compleet, maar niet elk niveau heeft een korte omschrijving');
}

if (UPDATES.some((u, k) => k > 0 && u.datum > UPDATES[k - 1].datum)) fout('updates', 'de nieuwste datum hoort bovenaan');

if (fouten.length) {
  console.error(`De data klopt niet (${fouten.length}):\n${fouten.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
const inLaag = new Set(INSIGNES.flatMap((i) => Object.values(i.niveaus).flatMap((n) => n.delen.flatMap((d) => d.bladen))));
console.log(`Data in orde: ${BLADEN.length} bladen in ${new Set(BLADEN.map((b) => b.categorie)).size} categorieën, ${inLaag.size} ervan in de insignelaag.`);
