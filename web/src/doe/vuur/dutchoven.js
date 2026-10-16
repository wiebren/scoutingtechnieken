// Coals on and under a Dutch oven. Pick the size of the pot, put briquettes on the lid and under it, and see about
// how hot it gets. The rule of thumb (Missouri Department of Conservation, 2009): twice the diameter in inches is
// about 175 °C (350 °F), two-thirds on the lid and one-third under it for baking; two briquettes more or less is about
// 25 °F (some 15 °C). Heat rises, so coals underneath heat the bottom more than coals on the lid heat the top.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './vuur.css';

const MATEN = [[8, 20], [10, 25], [12, 30], [14, 35]];           // inches, cm

/** About how hot, in °C rounded to 5, and how the heat is spread. */
export function schat(inch, op, onder) {
  const f = 350 + (op + onder - 2 * inch) * 12.5;
  const c = Math.round(((f - 32) * 5) / 9 / 5) * 5;
  const deel = op + onder ? op / (op + onder) : 0;
  return { c, deel };
}

export default function dutchOven() {
  let inch = 12; let op = 0; let onder = 0;

  const kolenOp = s('g'); const kolenOnder = s('g');
  const pan = s('g');
  const svg = s('svg', { viewBox: '0 46 320 164', class: 'vk-svg', role: 'img' },
    s('rect', { x: 0, y: 186, width: 320, height: 24, class: 'grond' }), pan, kolenOp, kolenOnder);

  const teller = (label, get, set) => {
    const uit = h('output', { 'aria-live': 'polite' });
    const min = h('button.knop.klein', { type: 'button', 'aria-label': `${label}: een briket minder`, onclick: () => { set(Math.max(0, get() - 1)); teken(); } }, '−');
    const plus = h('button.knop.klein', { type: 'button', 'aria-label': `${label}: een briket meer`, onclick: () => { set(Math.min(30, get() + 1)); teken(); } }, '+');
    return { uit, el: h('div.vk-rij', h('p.vk-kop', label), h('div.vk-teller', min, uit, plus)) };
  };
  const tOp = teller('Op het deksel', () => op, (n) => { op = n; });
  const tOnder = teller('Onder de pan', () => onder, (n) => { onder = n; });
  const temp = h('p.vk-vraag.vk-stand');
  const melding = h('div.vk-oordeel', { 'aria-live': 'polite' });
  const el = h('div.doe-vk.naast', svg,
    h('div.vk-tekst',
      h('p', 'Je wilt brood bakken, rond 175 °C. Leg de briketten.'),
      h('div.vk-rij', { role: 'group', 'aria-label': 'Maat van de pan' }, h('p.vk-kop', 'Maat van de pan'),
        keuze(MATEN.map(([i, cm]) => [i, `${cm} cm (${i} inch)`]), inch, (i) => { inch = i; teken(); })),
      tOp.el, tOnder.el,
      h('div.knop-rij', h('button.knop.klein', { type: 'button', onclick: () => { op = Math.round((4 * inch) / 3); onder = 2 * inch - op; teken(); } }, 'Leg volgens de vuistregel'),
        h('button.knop.klein', { type: 'button', onclick: () => { op = 0; onder = 0; teken(); } }, 'Alles eraf')),
      temp, melding));

  function teken() {
    const b = 70 + inch * 5;                          // width of the pot in the drawing
    const x0 = 160 - b / 2;
    pan.replaceChildren(
      s('path', { d: `M${x0 + 10} 186L${x0 + 16} 160M${x0 + b - 10} 186L${x0 + b - 16} 160`, stroke: '#3b3f42', 'stroke-width': 4 }),
      s('path', { d: `M${x0} 104H${x0 + b}V148Q${x0 + b} 162 ${x0 + b - 16} 162H${x0 + 16}Q${x0} 162 ${x0} 148Z`, fill: '#3b3f42', stroke: '#1c1f21', 'stroke-width': 1.5 }),
      s('path', { d: `M${x0 - 6} 104H${x0 + b + 6}L${x0 + b + 2} 94H${x0 - 2}Z`, fill: '#3b3f42', stroke: '#1c1f21', 'stroke-width': 1.5 }),
      s('path', { d: `M${x0 - 4} 94V84M${x0 + b + 4} 94V84`, stroke: '#3b3f42', 'stroke-width': 4 }));
    const briket = (x, y) => s('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: 6, ry: 4.2, class: 'kool' });
    const rij = Math.max(1, Math.floor((b + 4) / 13));
    kolenOp.replaceChildren(...Array.from({ length: op }, (_, i) => briket(x0 + 4 + (i % rij) * 13, 88 - Math.floor(i / rij) * 8)));
    const rijO = Math.max(1, Math.floor((b - 14) / 13));
    kolenOnder.replaceChildren(...Array.from({ length: onder }, (_, i) => briket(x0 + 12 + (i % rijO) * 13, 181 - Math.floor(i / rijO) * 8)));
    tOp.uit.textContent = op; tOnder.uit.textContent = onder;

    const { c, deel } = schat(inch, op, onder);
    const totaal = op + onder;
    temp.textContent = totaal ? `Ongeveer ${c} °C` : 'Nog geen briketten.';
    let tekst; let soort = 'half';
    if (!totaal) { tekst = `De vuistregel: twee keer de maat in inches. Voor ${inch} inch dus ${2 * inch} briketten.`; soort = ''; }
    else if (c < 150) tekst = `Te koud om te bakken. Voor een pan van ${inch} inch heb je ongeveer ${2 * inch} briketten nodig; je hebt er ${totaal}.`;
    else if (c > 205) tekst = `Te heet: je brood verbrandt. Haal er een paar weg; ${2 * inch} is genoeg.`;
    else if (deel < 0.55) tekst = 'De temperatuur klopt, maar er ligt te veel onder de pan. Warmte stijgt op: de bodem brandt aan voor de bovenkant gaar is. Leg ongeveer twee derde op het deksel.';
    else if (deel > 0.8) tekst = 'Bijna alles ligt op het deksel. Dan wordt de bovenkant bruin en blijft de onderkant bleek. Leg ongeveer een derde eronder.';
    else { tekst = `Goed: ${op} op het deksel en ${onder} eronder, samen ${totaal}. Kijk wel tussendoor even; wind en kou maken veel uit.`; soort = 'goed'; }
    melding.className = `vk-oordeel ${soort}`;
    melding.textContent = tekst;
    svg.setAttribute('aria-label', `Dutch oven van ${MATEN.find(([i]) => i === inch)[1]} cm met ${op} briketten op het deksel en ${onder} eronder.`);
  }

  teken();
  return el;
}
