// The site as it is published (GitHub Pages, .github/workflows/pages.yml): the homepage and the handleiding at the
// root, the app in app/. Run after `pnpm build` (dist/ is the app); writes pages/:
//
//   pages/index.html, pages/handleiding/…   the public pages (web/site/), with their links into the app set to app/
//   pages/app/…                              the app (web/dist/), with its own service worker, scoped to app/
//
// The pages are written by site/maak.mjs into pages/, so web/site/ itself keeps pointing at the app in dev.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const uit = join(web, 'pages');
const dist = join(web, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('Eerst pnpm build: dist/ ontbreekt');

rmSync(uit, { recursive: true, force: true });
// the pages, made for app/
execFileSync(process.execPath, [join(web, 'site', 'maak.mjs')], { stdio: 'inherit', env: { ...process.env, SITE_APP: 'app/', SITE_UIT: uit } });
// what else the pages use (styles, images); not the scripts that make and check them
const kopieer = (van, naar) => {
  for (const f of readdirSync(van)) {
    const a = join(van, f); const b = join(naar, f);
    if (statSync(a).isDirectory()) kopieer(a, b);
    else if (!f.endsWith('.html') && !f.endsWith('.mjs') && f !== 'app.css') cpSync(a, b);
  }
};
kopieer(join(web, 'site'), uit);
// the app
cpSync(dist, join(uit, 'app'), { recursive: true });
// GitHub Pages serves files as they are (no Jekyll)
writeFileSync(join(uit, '.nojekyll'), '');
console.log('pages/: de site met de app in app/');
