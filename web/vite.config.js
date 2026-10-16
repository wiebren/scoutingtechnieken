import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));

/** Every file of a directory, as paths relative to it with forward slashes. */
const filesIn = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? filesIn(path).map((f) => `${name}/${f}`) : [name];
});

/** The service worker keeps everything the app needs, so it also starts without internet - in the woods, on a
 *  hike. Its version is a hash of all of that: any change to the build makes another sw.js, and the app takes
 *  it in (src/main.js offers to start again with it). As in vlet (web/demo/sw.js). */
const serviceWorker = {
  name: 'scoutingtechnieken-sw',
  apply: 'build',
  closeBundle() {
    const out = resolve(here, 'dist');
    const files = filesIn(out).filter((f) => f !== 'sw.js' && !f.endsWith('.map')).sort();
    const hash = createHash('sha256');
    for (const file of files) hash.update(file).update(readFileSync(join(out, file)));
    const worker = readFileSync(resolve(here, 'sw.js'), 'utf8');
    hash.update(worker);
    // the page itself is asked for as ./ as well as ./index.html
    writeFileSync(join(out, 'sw.js'), worker.replace("'__VERSION__'", `'${hash.digest('hex').slice(0, 12)}'`)
      .replace('__FILES__', JSON.stringify(['./', ...files])));
    console.log(`sw.js: ${files.length} bestanden (${relative(here, out)})`);
  },
};

/** Which build this is, for Melden (src/melden.js): the commit and the day it was built. */
function build() {
  let commit = 'onbekend';
  try { commit = execSync('git rev-parse --short HEAD', { cwd: here, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* no git */ }
  return { commit, datum: new Date().toISOString().slice(0, 10) };
}

export default defineConfig({
  base: './',                     // works from any folder on any host
  plugins: [serviceWorker],
  define: { __BUILD__: JSON.stringify(build()) },
  // three.js (the 3D route walker and the bouwwerken in 3D) is one lazy chunk of about 550 kB, loaded only when such
  // a piece opens. The licences of the code that goes into the build (three.js, MIT) are written to licenties.txt,
  // linked from the handleiding (site/handleiding/bronnen.html); a .txt, so a browser shows it instead of saving it.
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 600, license: { fileName: 'licenties.txt' } },
});
