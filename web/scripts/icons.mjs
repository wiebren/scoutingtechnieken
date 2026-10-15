// The app icons: a plain windroos on scouting green - no emblem or logo of an organisation (not yet, see the
// README). SVG to PNG takes rsvg-convert (librsvg), which a site's build may not have: the PNGs are kept in the
// repository and made again with `pnpm icons` when the icon changes. As in vlet (web/scripts/icons.mjs).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GREEN = '#00803f';            // --groen in src/style.css: the scouting green, dark enough for white on it

/** The icon at 512 units. A maskable icon is cut to a circle or a squircle by the launcher: there the background
 *  fills the square and the star stays inside the safe zone (the middle 80 %). */
const iconSvg = (size, maskable) => {
  const s = maskable ? 0.62 : 0.78;                               // the star's share of the square
  const star = (r, w) => `M256 ${256 - r} L${256 + w} ${256 - w} L${256 + r} 256 L${256 + w} ${256 + w} L256 ${256 + r} L${256 - w} ${256 + w} L${256 - r} 256 L${256 - w} ${256 - w}Z`;
  const R = 256 * s; const r2 = R * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  ${maskable ? `<rect width="512" height="512" fill="${GREEN}"/>` : `<rect x="16" y="16" width="480" height="480" rx="108" fill="${GREEN}"/>`}
  <g transform="rotate(45 256 256)" opacity="0.45"><path d="${star(r2, r2 * 0.2)}" fill="#fff"/></g>
  <path d="${star(R, R * 0.17)}" fill="#fff"/>
  <circle cx="256" cy="256" r="${R * 0.09}" fill="${GREEN}"/>
</svg>`;
};

const work = mkdtempSync(join(tmpdir(), 'scoutingtechnieken-icons-'));
const ICONS = [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, true]];
for (const [name, size, maskable] of ICONS) {
  const svg = join(work, `${name}.svg`);
  writeFileSync(svg, iconSvg(size, maskable));
  execFileSync('rsvg-convert', [svg, '-o', join(web, 'public/icons', name)]);
}
console.log(`public/icons: ${ICONS.map(([n]) => n).join(', ')} geschreven`);
