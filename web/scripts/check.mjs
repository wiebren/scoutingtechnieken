// Checks the data before a build (`pnpm check`, and the first step of `pnpm build`): every id once, every blad in
// a groep its category has, every link to a blad that exists (also from a tile of `soorten`, with its drawing),
// the insignelaag pointing only at bladen that are there, every zonderBlad key once and every old key
// (oude-sleutels.js) leading to one, and no interactive piece hiding another of the same name. A mistake stops the build with a list of what is wrong; what is only odd (a piece
// or a drawing no blad uses) is listed, and the build goes on. At the end: how many bladen each niveau of the menu
// shows (src/data/niveaus.js).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { BEELDEN, BRONNEN } from '../src/data/beelden.js';
import { BLAD, BLADEN } from '../src/data/bladen/index.js';
import { DOE } from '../src/doe/index.js';
import { CATEGORIE } from '../src/data/categorieen.js';
import { GROEPEN } from '../src/doe/legenda/index.js';
import { insigneBeeld, INSIGNES, NIVEAUS } from '../src/data/insignes.js';
import { KEUZES, niveausVan } from '../src/data/niveaus.js';
import { nuGeldig, OUDE_SLEUTELS } from '../src/data/oude-sleutels.js';
import { PLAATJES } from '../src/plaatjes.js';
import { UPDATES } from '../src/data/updates.js';

const fouten = [];
const fout = (waar, wat) => fouten.push(`${waar}: ${wat}`);
const opmerkingen = [];

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
  if (b.plaatje && !PLAATJES[b.plaatje]) fout(waar, `plaatje bestaat niet: ${b.plaatje}`);
  for (const x of b.soorten ?? []) {
    if (!x.naam || !x.plaatje) fout(waar, 'een soort heeft een naam en een plaatje nodig');
    if (x.plaatje && !PLAATJES[x.plaatje]) fout(waar, `soort ${x.naam}: plaatje bestaat niet: ${x.plaatje}`);
    if (x.blad && !BLAD[x.blad]) fout(waar, `soort ${x.naam}: naar een blad dat er niet is: ${x.blad}`);
    if (x.blad === b.id) fout(waar, `soort ${x.naam} verwijst naar zichzelf`);
  }
  if (b.doe && !DOE[b.doe]) fout(waar, `doe bestaat niet: ${b.doe} (src/doe/index.js)`);
  for (const x of b.beelden ?? []) if (!BEELDEN[x.beeld]) fout(waar, `beeld bestaat niet: ${x.beeld}`);
  if (b.beelden?.some((x) => x.titel) && !b.beelden.every((x) => x.titel)) fout(waar, 'geef elk beeld een titel, of geen enkel');
  if (b.tabel && b.tabel.rijen.some((r) => r.length !== b.tabel.kop.length)) fout(waar, 'een rij van de tabel heeft niet evenveel cellen als de kop');
  for (const veld of ['niveau', 'insigne', 'insignes', 'verzamelingen', 'klasse']) {
    if (veld in b) fout(waar, `"${veld}" hoort niet bij een blad: de insignelaag staat in src/data/insignes.js`);
  }
}

for (const [id, x] of Object.entries(BEELDEN)) {
  if (!existsSync(new URL(`../public/${x.src}`, import.meta.url))) fout(`beeld ${id}`, `bestand ontbreekt: public/${x.src}`);
  if (!x.alt || !BRONNEN[x.bron]) fout(`beeld ${id}`, 'een beeld heeft een alt-tekst en een bron uit BRONNEN nodig');
}

for (const i of INSIGNES) {
  for (const [nr, n] of Object.entries(i.niveaus)) {
    if (!NIVEAUS.some((x) => String(x.niveau) === nr)) fout(`insigne ${i.id}`, `onbekend niveau ${nr}`);
    for (const d of n.delen) for (const id of d.bladen) if (!BLAD[id]) fout(`insigne ${i.id} niveau ${nr}`, `blad bestaat niet: ${id}`);
  }
  for (const { niveau } of NIVEAUS) {
    if (!existsSync(new URL(`../public/${insigneBeeld(i.id, niveau)}`, import.meta.url))) fout(`insigne ${i.id}`, `geen badge voor niveau ${niveau} (pnpm insignes)`);
  }
  if (i.compleet && NIVEAUS.some(({ niveau }) => !i.niveaus[niveau]?.kort)) fout(`insigne ${i.id}`, 'compleet, maar niet elk niveau heeft een korte omschrijving');
}

// the zonderBlad lines: a tick is stored under the key, so every key once, and never the id of a blad
const eisen = new Set();
for (const i of INSIGNES) {
  for (const [nr, n] of Object.entries(i.niveaus)) for (const d of n.delen) for (const regel of d.zonderBlad ?? []) {
    const waar = `insigne ${i.id} niveau ${nr}, ${d.titel}`;
    const { k, t } = typeof regel === 'object' ? regel : {};
    if (!t) { fout(waar, 'een zonderBlad-regel is { k, t }: een sleutel en een tekst'); continue; }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k ?? '') || !k.startsWith(`${i.id}-`)) fout(waar, `sleutel "${k}" moet beginnen met "${i.id}-" en uit kleine letters, cijfers en streepjes bestaan`);
    if (eisen.has(k)) fout(waar, `sleutel komt twee keer voor: ${k}`);
    if (BLAD[k]) fout(waar, `sleutel is ook de id van een blad: ${k}`);
    if (Object.hasOwn(OUDE_SLEUTELS, k)) fout(waar, `sleutel ${k} staat ook in OUDE_SLEUTELS: een regel is weg of hij blijft`);
    eisen.add(k);
  }
}
// the old keys (src/data/oude-sleutels.js): each one ends at a line or a blad that is there, without going round
for (const [oud, doel] of Object.entries(OUDE_SLEUTELS)) {
  if (BLAD[oud]) fout(`oude sleutel ${oud}`, 'is de id van een blad: dan verdwijnt een vinkje bij dat blad');
  if (![doel].flat().length) fout(`oude sleutel ${oud}`, 'wijst nergens naar');
  for (const k of nuGeldig(oud)) {
    if (Object.hasOwn(OUDE_SLEUTELS, k)) fout(`oude sleutel ${oud}`, `komt via ${k} weer bij zichzelf uit`);
    else if (!eisen.has(k) && !BLAD[k]) fout(`oude sleutel ${oud}`, `wijst naar ${k}: geen regel en geen blad`);
  }
}

for (const g of GROEPEN) {
  if (g.tekens.length < 3) fout(`legenda ${g.id}`, 'te weinig tekens om uit te raden');
  const namen = g.tekens.map((x) => x.naam);
  if (new Set(namen).size !== namen.length) fout(`legenda ${g.id}`, 'twee tekens met dezelfde naam');
  if (g.tekens.some((x) => !x.naam || !x.teken)) fout(`legenda ${g.id}`, 'een teken zonder naam of tekening');
}

// src/doe/index.js spreads the lists of its folders into DOE: a name in two of them hides one without a word
const doeIndex = readFileSync(new URL('../src/doe/index.js', import.meta.url), 'utf8');
const doeNamen = [...doeIndex.matchAll(/^ {2}'?([a-z0-9-]+)'?: \{/gm)].map((m) => m[1]);
for (const map of readdirSync(new URL('../src/doe/', import.meta.url), { withFileTypes: true })) {
  if (!map.isDirectory() || !existsSync(new URL(`../src/doe/${map.name}/index.js`, import.meta.url))) continue;
  const lijst = (await import(`../src/doe/${map.name}/index.js`)).default;
  if (lijst && typeof lijst === 'object' && !Array.isArray(lijst) && !('tekens' in lijst)) doeNamen.push(...Object.keys(lijst));
}
for (const naam of new Set(doeNamen.filter((n, k) => doeNamen.indexOf(n) !== k))) fout(`doe ${naam}`, 'deze naam staat in twee lijsten van src/doe/');

const gebruikt = (veld) => new Set(BLADEN.map((b) => b[veld]).filter(Boolean));
const doeGebruikt = gebruikt('doe');
const plaatjeGebruikt = new Set([...gebruikt('plaatje'), ...BLADEN.flatMap((b) => (b.soorten ?? []).map((x) => x.plaatje))]);
const beeldGebruikt = new Set(BLADEN.flatMap((b) => (b.beelden ?? []).map((x) => x.beeld)));
// a piece another piece opens inside itself (`binnen`) is used when that one is
for (const [naam, x] of Object.entries(DOE)) if (x.binnen && !DOE[x.binnen]) fout(`doe ${naam}`, `binnen een doe dat er niet is: ${x.binnen}`);
for (const [naam, x] of Object.entries(DOE)) {
  if (!doeGebruikt.has(naam) && !doeGebruikt.has(x.binnen)) opmerkingen.push(`doe ${naam}: geen blad gebruikt het${x.binnen ? ` (en ook ${x.binnen} niet)` : ''}`);
}
for (const naam of Object.keys(PLAATJES)) if (!plaatjeGebruikt.has(naam)) opmerkingen.push(`plaatje ${naam}: geen blad gebruikt het`);
for (const naam of Object.keys(BEELDEN)) if (!beeldGebruikt.has(naam)) opmerkingen.push(`beeld ${naam}: geen blad gebruikt het`);

if (UPDATES.some((u, k) => k > 0 && u.datum > UPDATES[k - 1].datum)) fout('updates', 'de nieuwste datum hoort bovenaan');

if (fouten.length) {
  console.error(`De data klopt niet (${fouten.length}):\n${fouten.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
const inLaag = new Set(INSIGNES.flatMap((i) => Object.values(i.niveaus).flatMap((n) => n.delen.flatMap((d) => d.bladen))));
console.log(`Data in orde: ${BLADEN.length} bladen in ${new Set(BLADEN.map((b) => b.categorie)).size} categorieën, ${inLaag.size} ervan in de insignelaag.`);
console.log(`Per niveau in het menu: ${KEUZES.map((k) => `${k.naam} ${BLADEN.filter((b) => niveausVan(b.id).includes(k.key)).length}`).join(', ')}.`);
if (opmerkingen.length) console.log(`Om na te kijken (${opmerkingen.length}):\n${opmerkingen.map((o) => `  - ${o}`).join('\n')}`);
