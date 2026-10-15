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

export default defineConfig({
  base: './',                     // works from any folder on any host
  plugins: [serviceWorker],
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true },
});
