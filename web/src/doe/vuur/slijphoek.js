// Sharpen at the right angle. The slider tilts the blade on the stone; the drawing shows the edge in section. Victorinox
// gives 15-20° per side for its pocket knives, which makes an edge of 30-40°. Then practise: draw the blade over the
// stone ten good strokes per side, keeping the angle while your hand wobbles a little after each stroke.
import { h } from '../../dom.js';
import { actie, acties, keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const [MIN, MAX] = [15, 20];
const HALEN = 10;
const rad = (g) => (g * Math.PI) / 180;

export function oordeel(hoek) {
  if (hoek < 10) return { soort: 'fout', tekst: 'Zo plat slijp je het lemmet zelf weg, niet de snede. De snede wordt dun als papier en brokkelt of buigt meteen om.' };
  if (hoek < MIN) return { soort: 'half', tekst: 'Een dunne, heel scherpe snede, maar die wordt snel bot of buigt om. Voor een zakmes iets steiler.' };
  if (hoek <= MAX) return { soort: 'goed', tekst: `Goed: ${hoek}° per kant, samen een snijhoek van ${2 * hoek}°. De maker van het Zwitserse zakmes geeft 15 tot 20 graden per kant.` };
  if (hoek <= 28) return { soort: 'half', tekst: 'Een stevige, maar stompere snede. Het mes snijdt minder makkelijk, en je moet harder duwen.' };
  return { soort: 'fout', tekst: 'Zo steil slijp je een botte wig. Daar snijd je bijna niet meer mee.' };
}

export default function slijphoek() {
  let hoek = 30; let modus = 'kijk'; let kant = 'links';
  let goed = { links: 0, rechts: 0 }; let halen = { links: 0, rechts: 0 };

  const mes = s('g'); const boog = s('g');
  const svg = s('svg', { viewBox: '0 0 320 200', class: 'vk-svg', role: 'img' },
    s('rect', { x: 20, y: 140, width: 280, height: 30, rx: 4, fill: '#7d8b93' }),
    s('rect', { x: 20, y: 140, width: 280, height: 8, rx: 2, fill: '#9aa8b0' }),
    s('text', { x: 296, y: 186, class: 'tekst stil', 'text-anchor': 'end' }, 'slijpsteen'),
    mes, boog);

  const schuif = h('input.doe-schuif', { type: 'range', min: 5, max: 40, step: 1, value: hoek, 'aria-label': 'Slijphoek per kant in graden' });
  const label = h('output');
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const telling = h('p.vk-stand', { 'aria-live': 'polite' });
  const haal = actie('Haal over de steen', null, () => trek(), { hoofd: true });
  const kantChips = keuze([['links', 'kant 1'], ['rechts', 'kant 2']], kant, (k) => { kant = k; teken(); });
  const oefen = h('div.vk-tekst', { hidden: true },
    h('div.vk-rij', { role: 'group', 'aria-label': 'Welke kant' }, h('p.vk-kop', 'Je slijpt'), kantChips),
    acties(haal, actie('Opnieuw', 'opnieuw', () => begin(), { klein: true })), telling);
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('div.vk-rij', { role: 'group', 'aria-label': 'Wat wil je doen' },
        keuze([['kijk', 'De hoek zoeken'], ['oefen', '10 halen per kant']], modus, (m) => { modus = m; begin(); })),
      h('label.doe-label', h('span', 'Hoek per kant: ', label), schuif),
      oefen, melding));

  schuif.addEventListener('input', () => { hoek = Number(schuif.value); teken(); if (modus === 'kijk') toonOordeel(); });

  function teken() {
    // the edge in section: the tip on the stone, one bevel flat on the stone, the other at 2 x hoek; the body of the
    // blade goes on along the axis, which is at hoek from the stone
    const [tx, ty] = [92, 140]; const L = 50; const lang = 150;
    const a = rad(hoek);
    const top1 = [tx + L, ty];
    const top2 = [tx + L * Math.cos(2 * a), ty - L * Math.sin(2 * a)];
    const eind1 = [top1[0] + lang * Math.cos(a), top1[1] - lang * Math.sin(a)];
    const eind2 = [top2[0] + lang * Math.cos(a), top2[1] - lang * Math.sin(a)];
    const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    mes.replaceChildren(
      s('path', { d: `M${tx} ${ty}L${f(top1)}L${f(eind1)}L${f(eind2)}L${f(top2)}Z`, fill: '#c7d0d6', stroke: '#56636b', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }),
      s('path', { d: `M${f(top1)}L${tx} ${ty}L${f(top2)}`, class: 'rood-lijn' }),
      s('text', { x: (eind1[0] + eind2[0]) / 2 + 6, y: (eind1[1] + eind2[1]) / 2 - 6, class: 'tekst stil' }, 'rug'));
    const r = 74;
    const goedLo = rad(MIN); const goedHi = rad(MAX);
    boog.replaceChildren(
      s('path', { d: `M${tx + r * Math.cos(goedLo)} ${ty - r * Math.sin(goedLo)}A${r} ${r} 0 0 0 ${tx + r * Math.cos(goedHi)} ${ty - r * Math.sin(goedHi)}`, class: 'accent-lijn', 'stroke-width': 12, opacity: 0.6 }),
      s('path', { d: `M${tx + r + 12} ${ty}A${r + 12} ${r + 12} 0 0 0 ${(tx + (r + 12) * Math.cos(a)).toFixed(1)} ${(ty - (r + 12) * Math.sin(a)).toFixed(1)}`, class: 'lijn dun' }),
      s('text', { x: tx + r + 22, y: ty - 8, class: 'tekst' }, `${hoek}°`));
    label.textContent = `${hoek}° (snijhoek ${2 * hoek}°)`;
    schuif.value = hoek;
    svg.setAttribute('aria-label', `Doorsnede van het lemmet op de slijpsteen, onder ${hoek} graden. Het groene stukje van de boog is 15 tot 20 graden.`);
    if (modus === 'oefen') telling.textContent = `Kant 1: ${goed.links} van ${HALEN} goede halen (${halen.links} gedaan). Kant 2: ${goed.rechts} van ${HALEN} (${halen.rechts} gedaan).`;
  }

  function toonOordeel() { const o = oordeel(hoek); melding.className = `vk-oordeel ${o.soort}`; melding.textContent = o.tekst; }

  function trek() {
    halen[kant]++;
    const raak = hoek >= MIN && hoek <= MAX;
    if (raak && goed[kant] < HALEN) goed[kant]++;
    const wiebel = Math.round((Math.random() - 0.5) * 6);
    let tekst = raak ? `Goede haal op ${hoek}°.` : `Deze haal was op ${hoek}°: ${hoek < MIN ? 'te plat' : 'te steil'}. Houd hem tussen 15 en 20 graden.`;
    if (goed.links >= HALEN && goed.rechts >= HALEN) {
      melding.className = 'vk-oordeel goed';
      melding.textContent = `Klaar: beide kanten tien goede halen. Een scherpe snede zie je niet: kijk er recht op, en er glimt geen randje meer. Veeg het mes schoon, van de rug af.${Math.abs(halen.links - halen.rechts) > 4 ? ` Let op: je haalde de ene kant ${Math.max(halen.links, halen.rechts)} keer en de andere ${Math.min(halen.links, halen.rechts)} keer. Slijp beide kanten even vaak, anders komt de snede scheef.` : ''}`;
      haal.disabled = true; teken(); return;
    }
    if (goed[kant] >= HALEN) tekst += ' Deze kant is klaar: wissel naar de andere kant, en doe die evenveel.';
    hoek = Math.max(5, Math.min(40, hoek + wiebel));
    if (wiebel) tekst += ` Je hand wiebelt: nu ${hoek}°.`;
    melding.className = `vk-oordeel ${raak ? '' : 'half'}`;
    melding.textContent = tekst;
    teken();
  }

  function begin() {
    goed = { links: 0, rechts: 0 }; halen = { links: 0, rechts: 0 };
    oefen.hidden = modus !== 'oefen'; haal.disabled = false;
    if (modus === 'oefen') {
      hoek = 26;
      melding.className = 'vk-oordeel';
      melding.textContent = 'Zet de hoek tussen 15 en 20 graden, en haal het lemmet over de steen. Na elke haal wiebelt je hand een beetje: stel bij.';
    } else toonOordeel();
    teken();
  }

  begin();
  return el;
}
