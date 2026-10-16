// Checks the links of the public pages (web/site/): every link and file on a page has to exist, every #anchor has
// to be on its page, and every link into the app has to point at a page, category, blad, piece or insigne the app
// has. With --extern it also asks every outside link (it needs internet then). Exit code 1 if something is wrong.
//
//   cd web && node site/controleer.mjs [--extern]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(SITE, '..');
// the pages of the app, read from src/router.js (it needs a browser to import)
const PAGINAS = JSON.parse(readFileSync(join(WEB, 'src', 'router.js'), 'utf8').match(/PAGINAS = (\[[^\]]*\])/)[1].replaceAll("'", '"'));
const { CATEGORIE } = await import(join(WEB, 'src', 'data', 'categorieen.js'));
const { BLAD } = await import(join(WEB, 'src', 'data', 'bladen', 'index.js'));
const { DOE } = await import(join(WEB, 'src', 'doe', 'index.js'));
const { INSIGNE } = await import(join(WEB, 'src', 'data', 'insignes.js'));

const paginas = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? paginas(p) : f.endsWith('.html') ? [p] : [];
});
/** Files of the app that only the build writes (vite.config.js), so they are not in web/ in dev. */
const GEBOUWD = new Set(['/licenties.txt']);
const ids = new Map();
const idsVan = (bestand) => {
  if (!ids.has(bestand)) ids.set(bestand, new Set([...readFileSync(bestand, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(bestand);
};

/** A path on the dev server (as the browser asks it) to a file in web/, or null. */
function bestandVan(pad) {
  let p = decodeURIComponent(pad);
  if (p.endsWith('/')) p += 'index.html';
  for (const basis of [WEB, join(WEB, 'public')]) {
    const f = join(basis, p);
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

/** A place in the app (#/zoeken?c=…): what is wrong with it, or null. */
function appFout(hash) {
  const [pad, query = ''] = hash.replace(/^#\/?/, '').split('?');
  if (pad && !PAGINAS.includes(pad)) return `geen pagina ${pad}`;
  const q = new URLSearchParams(query);
  if (q.has('c') && !CATEGORIE[q.get('c')]) return `geen categorie ${q.get('c')}`;
  if (q.has('blad') && !BLAD[q.get('blad')]) return `geen blad ${q.get('blad')}`;
  if (q.has('doe') && !DOE[q.get('doe')]) return `geen oefening ${q.get('doe')}`;
  if (q.has('i') && !INSIGNE[q.get('i')]) return `geen insigne ${q.get('i')}`;
  return null;
}

const fouten = [];
const extern = new Map();       // url -> pages
let aantal = 0;
for (const pagina of paginas(SITE)) {
  const naam = relative(WEB, pagina).split('\\').join('/');
  const html = readFileSync(pagina, 'utf8');
  const basis = new URL(`http://x/${naam}`);
  for (const [, attr, waarde] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    aantal++;
    if (/^(mailto:|tel:|data:)/.test(waarde)) continue;
    if (/^https?:/.test(waarde)) { extern.set(waarde, [...(extern.get(waarde) ?? []), naam]); continue; }
    if (waarde === '') { fouten.push(`${naam}: lege ${attr}`); continue; }
    const url = new URL(waarde, basis);
    if (GEBOUWD.has(url.pathname)) continue;
    const bestand = bestandVan(url.pathname);
    if (!bestand) { fouten.push(`${naam}: ${waarde} bestaat niet`); continue; }
    if (url.hash.startsWith('#/')) {
      if (bestand !== join(WEB, 'index.html')) fouten.push(`${naam}: ${waarde} is een plek in de app, maar wijst niet naar de app`);
      const f = appFout(url.hash);
      if (f) fouten.push(`${naam}: ${waarde}: ${f}`);
    } else if (url.hash.length > 1 && bestand.endsWith('.html') && !idsVan(bestand).has(decodeURIComponent(url.hash.slice(1)))) {
      fouten.push(`${naam}: ${waarde}: geen id ${url.hash} op die pagina`);
    }
  }
  // two the same ids on one page break an anchor
  const alle = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const dubbel of new Set(alle.filter((id, i) => alle.indexOf(id) !== i))) fouten.push(`${naam}: id ${dubbel} staat er meer dan eens`);
}

if (process.argv.includes('--extern')) {
  await Promise.all([...extern].map(async ([url, waar]) => {
    try {
      const antwoord = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (linkcheck)' } });
      if (!antwoord.ok) fouten.push(`${url}: HTTP ${antwoord.status} (op ${[...new Set(waar)].join(', ')})`);
    } catch (e) { fouten.push(`${url}: ${e.cause?.code ?? e.name} (op ${[...new Set(waar)].join(', ')})`); }
  }));
}

console.log(`${aantal} links en bestanden op ${paginas(SITE).length} pagina's, ${extern.size} naar buiten${process.argv.includes('--extern') ? ' (nagevraagd)' : ' (niet nagevraagd: --extern)'}`);
for (const f of fouten) console.log(`  FOUT ${f}`);
process.exit(fouten.length ? 1 : 0);
