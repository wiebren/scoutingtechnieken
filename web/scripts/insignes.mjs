// The insigne images: per insigne and niveau the badge of Scouting Nederland, taken from the insignebladen of
// 2025 (reference/programma/sn-insignes-2025, not in the repository). Page 1 of each blad has the three badges,
// niveau 1 to 3, as small images on white; here they are cut to their hexagon, so the corners are see-through,
// and kept as WebP in public/insignes/. Needs pdfimages (poppler) and magick (ImageMagick), which a site's build
// may not have: as with the icons, the images are kept in the repository and made again with `pnpm insignes`.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INSIGNES } from '../src/data/insignes.js';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRON = resolve(web, '../reference/programma/sn-insignes-2025');
const UIT = join(web, 'public/insignes');
const [W, H] = [240, 208];                           // the badges are regular hexagons, pointy left and right

// The blad of each insigne, by our id
const PDF = {
  knopen: 'Knopen', pionieren: 'Pionieren', navigeren: 'Navigeren', 'vuur-stoken': 'Vuur_stoken',
  houtbewerken: 'Houtbewerken', kamperen: 'Kamperen', koken: 'Koken', 'natuur-buitenleven': 'Natuur_Buitenleven',
  'veilig-gezond': 'Veilig_Gezond',
};

const hexagon = [[1, H / 2], [W / 4, 1], [W * 3 / 4, 1], [W - 1, H / 2], [W * 3 / 4, H - 1], [W / 4, H - 1]]
  .map(([x, y]) => `${x},${y}`).join(' ');

mkdirSync(UIT, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'scoutingtechnieken-insignes-'));
for (const { id } of INSIGNES) {
  const pdf = join(BRON, `SN_Insigne_${PDF[id]}.pdf`);
  // page 1: the background of the page first, then the three badges (some with a soft mask, which we skip)
  const lijst = execFileSync('pdfimages', ['-f', '1', '-l', '1', '-list', pdf], { encoding: 'utf8' }).split('\n').slice(2)
    .map((r) => r.trim().split(/\s+/)).filter((r) => r[2] === 'image').map((r) => ({ num: Number(r[1]), w: Number(r[3]) }));
  const badges = lijst.filter((b) => b.w < 1000);
  if (badges.length !== 3) throw new Error(`${pdf}: ${badges.length} plaatjes op pagina 1, verwacht 3`);
  execFileSync('pdfimages', ['-f', '1', '-l', '1', '-png', pdf, join(work, id)]);
  const bestanden = readdirSync(work);
  badges.forEach(({ num }, i) => {
    const bron = join(work, bestanden.find((f) => f === `${id}-${String(num).padStart(3, '0')}.png`));
    execFileSync('magick', [bron, '-resize', `${W}x${H}!`,
      '(', '-size', `${W}x${H}`, 'xc:none', '-fill', 'white', '-draw', `polygon ${hexagon}`, ')',
      '-compose', 'CopyOpacity', '-composite', '-quality', '82', join(UIT, `${id}-${i + 1}.webp`)]);
  });
}
rmSync(work, { recursive: true });
console.log(`public/insignes: ${INSIGNES.length} insignes × 3 niveaus geschreven`);
