// The figures in the sky, one at a time: "Bekijk" shows a figure with its bright stars and when you see it in the
// evening; "Raad" shows the stars and their lines without a name, and you choose the name out of four. Drawn as you
// see them when they stand in the south: north up, east to the left. The stars around them are drawn too.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { p, s } from '../kompasdelen.js';
import { momentNL, PLAATS } from './hemel.js';
import { BEELDEN, kleur, midden, NAMEN, PLEJADEN, STERREN, straal, sterrenVan } from './sterren.js';
import '../vorm.css';
import './hemel.css';
import './sterren.css';

const B = 360; const H = 260;
const RAD = Math.PI / 180;
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const plaats = PLAATS.amersfoort;

/** The figure on a flat piece of sky round its middle (gnomonic), fitted into the picture. */
function vlak(b) {
  const ids = sterrenVan(b);
  let x = 0; let y = 0; let z = 0;
  for (const i of ids) {
    const ra = STERREN[i].ra * 15 * RAD; const dec = STERREN[i].dec * RAD;
    x += Math.cos(dec) * Math.cos(ra); y += Math.cos(dec) * Math.sin(ra); z += Math.sin(dec);
  }
  const a0 = Math.atan2(y, x); const d0 = Math.atan2(z, Math.hypot(x, y));
  const proj = (i) => {
    const a = STERREN[i].ra * 15 * RAD; const d = STERREN[i].dec * RAD;
    const c = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(a - a0);
    if (c < 0.5) return null;
    return [-(Math.cos(d) * Math.sin(a - a0)) / c, -(Math.cos(d0) * Math.sin(d) - Math.sin(d0) * Math.cos(d) * Math.cos(a - a0)) / c];
  };
  const pts = ids.map(proj);
  const xs = pts.map((q) => q[0]); const ys = pts.map((q) => q[1]);
  const breed = Math.max(...xs) - Math.min(...xs); const hoog = Math.max(...ys) - Math.min(...ys);
  const schaal = Math.min((B - 70) / Math.max(breed, 0.05), (H - 60) / Math.max(hoog, 0.05), 900);
  const mx = (Math.max(...xs) + Math.min(...xs)) / 2; const my = (Math.max(...ys) + Math.min(...ys)) / 2;
  return (i) => { const q = proj(i); return q && [B / 2 + (q[0] - mx) * schaal, H / 2 + (q[1] - my) * schaal]; };
}

/** The figure as an SVG: the stars round it, its lines, and (when `namen`) the names of its bright stars. */
function tekening(b, { namen }) {
  const plek = vlak(b);
  const g = s('g');
  const eigen = new Set(sterrenVan(b));
  if (b.id === 'stier') PLEJADEN.forEach((i) => eigen.add(i));
  STERREN.forEach((x, i) => {
    if (x.mag > 4.5 && !eigen.has(i)) return;
    const q = plek(i);
    if (!q || q[0] < 4 || q[0] > B - 4 || q[1] < 4 || q[1] > H - 4) return;
    g.append(s('circle', { cx: p(q[0]), cy: p(q[1]), r: p(straal(x.mag, 1.3)), fill: kleur(x.bv), opacity: eigen.has(i) ? 1 : 0.55 }));
  });
  for (const keten of b.lijnen) {
    const punten = keten.map(plek);
    g.prepend(s('path', { d: `M${punten.map((q) => `${p(q[0])} ${p(q[1])}`).join('L')}`, class: 'hm-sterlijn sb-lijn' }));
  }
  if (namen) for (const i of eigen) {
    const naam = NAMEN[i];
    const q = plek(i);
    if (naam && q) { const links = q[0] > B - 80; g.append(s('text', { x: p(q[0] + (links ? -8 : 8)), y: p(q[1] - 7), class: 'hm-sternaam', 'text-anchor': links ? 'end' : 'start' }, naam)); }
  }
  return g;
}

/** When you see a figure well in the evening: always (it never sets here), or the months its middle stands higher than
 * 25° at 22:00 on the 15th. The text says so, so it does not clash with the looser months on the bladen. */
function wanneer(b) {
  if (sterrenVan(b).every((i) => STERREN[i].dec > 90 - plaats.breedte)) return 'Staat in Nederland altijd boven de horizon: het hele jaar te zien.';
  const hoog = MAANDEN.map((_, m) => midden(b, momentNL(2026, m, 15, 22 * 60), plaats.breedte, plaats.lengte).hoogte > 25);
  let beste = null;
  for (let start = 0; start < 12; start++) {
    if (!hoog[start] || hoog[(start + 11) % 12]) continue;
    let n = 0; while (n < 12 && hoog[(start + n) % 12]) n += 1;
    if (!beste || n > beste.n) beste = { start, n };
  }
  if (!beste) return 'Staat in Nederland altijd laag.';
  const eind = (beste.start + beste.n - 1) % 12;
  return `Staat om 10 uur ’s avonds hoger dan 25° boven de horizon van ${MAANDEN[beste.start]} tot ${MAANDEN[eind]}.`;
}

const schud = (lijst) => {
  for (let i = lijst.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lijst[i], lijst[j]] = [lijst[j], lijst[i]]; }
  return lijst;
};

export default function sterrenbeelden() {
  let modus = 'bekijk';
  let beeld = BEELDEN[0];
  let goed = 0; let gehad = 0;
  const plek = h('div.sb-plek');

  const svg = (b, namen, label) => s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'hm-svg sb-svg', role: 'img', 'aria-label': label },
    s('rect', { width: B, height: H, rx: 14, class: 'hm-nacht' }), tekening(b, { namen }));

  function bekijk() {
    const sterren = sterrenVan(beeld).map((i) => NAMEN[i]).filter(Boolean);
    plek.replaceChildren(
      h('div.chips.sb-chips', { role: 'group', 'aria-label': 'Kies een sterrenbeeld' }, keuze(BEELDEN.map((b) => [b, b.naam]), beeld, (b) => { beeld = b; bekijk(); })),
      svg(beeld, true, `${beeld.naam}${beeld.bij ? `, ${beeld.bij}` : ''}`),
      h('p.sb-naam', beeld.naam, beeld.bij && h('span.doe-stil', ` · ${beeld.bij}`)),
      h('p', { 'aria-live': 'polite' }, `${wanneer(beeld)}${sterren.length ? ` Heldere sterren: ${sterren.join(', ')}.` : ''}`));
  }

  function raad() {
    const vraag = BEELDEN[Math.floor(Math.random() * BEELDEN.length)];
    const opties = schud([vraag, ...schud(BEELDEN.filter((b) => b !== vraag)).slice(0, 3)]);
    const melding = h('p.doe-melding', { 'aria-live': 'polite' });
    const verder = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: raad }, 'Volgende');
    const knoppen = opties.map((b) => h('button.knop.klein.sb-optie', { type: 'button', onclick: () => {
      gehad += 1; if (b === vraag) goed += 1;
      knoppen.forEach((k, i) => { k.disabled = true; if (opties[i] === vraag) k.classList.add('goed'); else if (opties[i] === b) k.classList.add('fout'); });
      melding.classList.toggle('fout', b !== vraag);
      melding.textContent = `${b === vraag ? 'Goed!' : `Nee, dit is ${vraag.naam}.`} ${goed} van de ${gehad} goed.`;
      verder.hidden = false; verder.focus();
    } }, b.naam));
    plek.replaceChildren(svg(vraag, false, 'Een sterrenbeeld. Welk is het?'), h('p.doe-sr', 'Welk sterrenbeeld is dit?'),
      h('div.sb-opties', knoppen), melding, h('div.knop-rij', verder));
  }

  const modi = h('div.chips', { role: 'group', 'aria-label': 'Bekijken of raden' },
    keuze([['bekijk', 'Bekijk'], ['raad', 'Raad']], modus, (m) => { modus = m; if (m === 'raad') raad(); else bekijk(); }));
  bekijk();
  return h('div.doe-sterrenbeelden', modi, plek,
    h('p.hm-noot', 'Zoals je ze ziet als ze in het zuiden staan: noord boven, oost links. Sterren uit de Yale Bright Star Catalogue.'));
}
