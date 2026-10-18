// The public pages (web/site/): the homepage and the handleiding, plain static HTML. This script fills in the parts
// that come from the app, so they stay the same as the app, and writes them back into the pages. Run it after a
// change to the app's colours, drawings, icons or categories, or to the pages' header, footer or handleiding list:
//
//   cd web && node site/maak.mjs
//
// For publication (scripts/pages.mjs) the app sits in app/ next to the pages, and the pages go to another folder:
//   SITE_APP=app/ SITE_UIT=<folder> node site/maak.mjs
//
// The pages work without running it (what it writes is in them); it only brings them up to date. It does:
// - app.css: the app's colours (light, dark and data-theme, from src/style.css) and the classes of the drawings
//   (src/style.css .plaatje and src/plaatjes/*.css), so the drawings here look as they do in the app;
// - between <!-- maak:soort arg --> and <!-- /maak -->: the header (kop), the footer (voet), the list of the
//   handleiding (handleiding) and the way on (volgende), a drawing (plaatje naam), an icon (icoon naam), the
//   categories (categorieen, mockup) and counts (aantal: the bladen, doen: the pieces on them,
//   oefeningen: the exercises in Oefenen);
// - every link into the app: <a data-app="#/zoeken"> gets href = the way up to web/site/ + APP + "#/zoeken".
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { merkSvg } from '../src/merk.js';

const SITE = dirname(fileURLToPath(import.meta.url));
const SRC = join(SITE, '..', 'src');

/** Where the app is, seen from web/site/. Now the app is web/index.html, one folder up. When the homepage moves to
 *  the root at publication and the app to /app/, this becomes 'app/' (notities/todo.md, Voor publicatie). */
const APP = process.env.SITE_APP ?? '../';
/** Where the pages are written: here, or (for publication) another folder. */
const UIT = process.env.SITE_UIT ? resolve(process.env.SITE_UIT) : SITE;

/** The pages of the handleiding, in order: [file, title in the list]. */
const HANDLEIDING = [
  ['index.html', 'Beginnen'],
  ['zoeken.html', 'Zoeken'],
  ['onderwerp.html', 'Een onderwerp'],
  ['oefenen.html', 'Oefenen'],
  ['insignes.html', 'Insignes'],
  ['instellingen.html', 'Instellingen'],
  ['melden.html', 'Melden'],
  ['leiding.html', 'Voor leiding'],
  ['bronnen.html', 'Bronnen en licentie'],
];

const { PLAATJES } = await import(join(SRC, 'plaatjes.js'));
const { CATEGORIEEN } = await import(join(SRC, 'data', 'categorieen.js'));
const { BLADEN } = await import(join(SRC, 'data', 'bladen', 'index.js'));
const { DOE } = await import(join(SRC, 'doe', 'index.js'));

// the icons: PADEN in src/iconen.js is not exported (icoon() needs a DOM), so it is read from the source
const iconen = readFileSync(join(SRC, 'iconen.js'), 'utf8');
const PADEN = new Function(`${iconen.match(/const PADEN = \{[\s\S]*?\n\};/)[0]}; return PADEN;`)();
const icoon = (naam, klasse = 'icoon') => {
  if (!PADEN[naam]) throw new Error(`geen icoon ${naam}`);
  return `<svg class="${klasse}" viewBox="0 0 24 24" aria-hidden="true">${PADEN[naam]}</svg>`;
};

// -- app.css
const stijl = readFileSync(join(SRC, 'style.css'), 'utf8');
const tokens = stijl.match(/:root \{[\s\S]*?\[data-niveau="extra"\][^\n]*\n/);
if (!tokens) throw new Error('src/style.css: de kleuren (van :root tot [data-niveau="extra"]) niet gevonden');
const tekenregels = stijl.split('\n').filter((r) => r.startsWith('.plaatje')).join('\n');
const categorieCss = readdirSync(join(SRC, 'plaatjes')).filter((f) => f.endsWith('.css')).sort()
  .map((f) => `/* src/plaatjes/${f} */\n${readFileSync(join(SRC, 'plaatjes', f), 'utf8').trim()}`).join('\n\n');
mkdirSync(UIT, { recursive: true });
writeFileSync(join(UIT, 'app.css'), `/* Made by site/maak.mjs from src/style.css and src/plaatjes/*.css: do not edit, run the script again.
   The colours of the app (light, dark, and data-theme to force one), and the classes of its drawings. */
${tokens[0]}
/* the drawings (src/style.css) */
${tekenregels}

${categorieCss}
`);

// -- the parts
const ommetje = (hrefVanSite, diepte) => '../'.repeat(diepte) + hrefVanSite;
const appHref = (pad, diepte) => (/^(\/|https?:)/.test(APP) ? APP : '../'.repeat(diepte) + APP) + pad;
const omlaag = (n) => Math.floor(n / 50) * 50;
const omlaag10 = (n) => Math.floor(n / 10) * 10;

function kop(bestand, diepte) {
  const thuis = bestand === 'index.html' && diepte === 0;
  const handleiding = bestand.startsWith('handleiding/');
  const huidig = (ja) => (ja ? ' aria-current="page"' : '');
  return `
  <a class="overslaan" href="#inhoud">Naar de inhoud</a>
  <header class="kop">
    <nav class="kop-nav" aria-label="Site">
      <a class="merk" href="${ommetje('./', diepte)}"><span class="merk-teken" aria-hidden="true">${merkSvg({ size: 36 })}</span><span>Scoutingtechnieken</span></a>
      <a class="kop-link" href="${ommetje('./', diepte)}"${huidig(thuis)}>Home</a>
      <a class="kop-link" href="${ommetje('handleiding/', diepte)}"${huidig(handleiding)}>Handleiding</a>
      <a class="knop hoofd klein" data-app="" href="">Open de app</a>
    </nav>
  </header>
  `;
}

function voet(bestand, diepte) {
  return `
  <footer class="voet">
    <div class="voet-binnen">
      <p><a href="${ommetje('./', diepte)}">Scoutingtechnieken</a> · <a href="${ommetje('handleiding/', diepte)}">Handleiding</a> · <a href="${ommetje('handleiding/melden.html', diepte)}">Melden</a> · <a href="${ommetje('handleiding/bronnen.html', diepte)}">Bronnen en licentie</a> · <a data-app="" href="">Open de app</a></p>
      <p>© 2026 Wiebren Braakman, onder <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.nl">CC BY-NC-SA 4.0</a>. Geen app van Scouting Nederland: een eigen project, gemaakt voor scouts en leiding.</p>
    </div>
  </footer>
  `;
}

function handleidingNav(bestand) {
  const hier = bestand.replace('handleiding/', '');
  return `
      <ol>
${HANDLEIDING.map(([f, t]) => `        <li><a href="${f}"${f === hier ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n')}
      </ol>
      `;
}

function volgende(bestand) {
  const i = HANDLEIDING.findIndex(([f]) => `handleiding/${f}` === bestand);
  const vorige = HANDLEIDING[i - 1];
  const na = HANDLEIDING[i + 1];
  return `
      <nav class="verder" aria-label="Verder lezen">
        ${vorige ? `<a href="${vorige[0]}" rel="prev">‹ ${vorige[1]}</a>` : '<span></span>'}
        ${na ? `<a href="${na[0]}" rel="next">${na[1]} ›</a>` : '<span></span>'}
      </nav>
      `;
}

/** The categories as tiles, each a link to it in the app, with its groepen. */
const categorieen = () => `
      <ul class="tegels">
${CATEGORIEEN.map((c) => `        <li><a class="tegel" data-familie="${c.kleur}" data-app="#/zoeken?c=${c.id}" href="">
          <span class="tegel-icoon">${icoon(c.icoon)}</span>
          <span class="tegel-naam">${c.naam}</span>
          <span class="tegel-sub">${c.groepen.map(([, g]) => g).join(' · ')}</span></a></li>`).join('\n')}
      </ul>
      `;

/** The first categories as the app's Zoeken shows them, for the drawing of a phone. */
const mockup = () => `
          <ul class="m-tegels">
${CATEGORIEEN.slice(0, 6).map((c) => `            <li class="m-tegel" data-familie="${c.kleur}"><span class="m-tegel-icoon">${icoon(c.icoon)}</span><span>${c.naam}</span><small>${BLADEN.filter((b) => b.categorie === c.id).length} onderwerpen</small></li>`).join('\n')}
          </ul>
          `;

function plaatje(naam) {
  if (!PLAATJES[naam]) throw new Error(`geen plaatje ${naam}`);
  return PLAATJES[naam]();
}

/** The pieces the bladen show (src/doe/), and of those the exercises that Oefenen lists: the ones without `bekijk`
 *  (src/oefenen.js). */
const stukken = [...new Set(BLADEN.map((b) => b.doe).filter((d) => d && DOE[d]))];
const oefeningen = stukken.filter((d) => !DOE[d].bekijk);

const MAKERS = {
  kop: (_, b, d) => kop(b, d),
  voet: (_, b, d) => voet(b, d),
  handleiding: (_, b) => handleidingNav(b),
  volgende: (_, b) => volgende(b),
  plaatje: (naam) => plaatje(naam),
  icoon: (arg) => { const [naam, ...klasse] = arg.split(/\s+/); return icoon(naam, klasse.join(' ') || 'icoon'); },
  categorieen,
  mockup,
  aantal: () => `ruim ${omlaag(BLADEN.length)}`,
  oefeningen: () => `ruim ${omlaag10(oefeningen.length)}`,
  doen: () => `ruim ${omlaag10(stukken.length)}`,
};

// -- every page
const paginas = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? paginas(p) : f.endsWith('.html') ? [p] : [];
});

for (const pad of paginas(SITE)) {
  const bestand = relative(SITE, pad).split('\\').join('/');
  const diepte = bestand.split('/').length - 1;
  const oud = readFileSync(pad, 'utf8');
  let nieuw = oud.replace(/<!-- maak:([a-z-]+)\s*([^>]*?)\s*-->[\s\S]*?<!-- \/maak -->/g, (heel, soort, arg) => {
    if (!MAKERS[soort]) throw new Error(`${bestand}: onbekend stuk maak:${soort}`);
    const tussen = MAKERS[soort](arg, bestand, diepte);
    // a value inside a line (a count) stays on that line; a block gets its own lines
    return `<!-- maak:${soort}${arg ? ` ${arg}` : ''} -->${tussen}<!-- /maak -->`;
  });
  nieuw = nieuw.replace(/(<a\b[^>]*?)\bdata-app="([^"]*)"([^>]*?)\bhref="[^"]*"/g,
    (heel, voor, pad2, tussen) => `${voor}data-app="${pad2}"${tussen}href="${appHref(pad2, diepte)}"`);
  if (UIT !== SITE) { mkdirSync(dirname(join(UIT, bestand)), { recursive: true }); writeFileSync(join(UIT, bestand), nieuw); continue; }
  if (nieuw !== oud) { writeFileSync(pad, nieuw); console.log(`bijgewerkt: site/${bestand}`); }
}
console.log('klaar: site/app.css en de pagina\'s');
