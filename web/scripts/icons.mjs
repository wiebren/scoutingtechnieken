// The app icons, drawn by src/merk.js (also the mark at the top of the menu). SVG to PNG takes rsvg-convert
// (librsvg), which a site's build may not have: the PNGs are kept in the repository and made again with `pnpm icons`
// when the icon changes. As in vlet (web/scripts/icons.mjs).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { merkSvg } from '../src/merk.js';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'scoutingtechnieken-icons-'));
const ICONS = [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, true]];
for (const [name, size, maskable] of ICONS) {
  const svg = join(work, `${name}.svg`);
  writeFileSync(svg, merkSvg({ size, maskable }));
  execFileSync('rsvg-convert', [svg, '-o', join(web, 'public/icons', name)]);
}
console.log(`public/icons: ${ICONS.map(([n]) => n).join(', ')} geschreven`);
