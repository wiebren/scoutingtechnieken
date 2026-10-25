// Choose a place for your tent: a drawn camp site with a slope, a hollow, a stream, a tree with dead branches, a
// path, a fire place and some stones. Tap where the tent goes, turn its door, and set it down; the card says what
// is good and what is not about that place. The wind comes from a different side each round, so the door has to
// be thought about every time. Facts: TKN §3.1 and §3.2 (plek kiezen), SN-VK (scheerlijnen en looproutes).
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';

const W = 360; const H = 260;
const RICHTING = ['noorden', 'oosten', 'zuiden', 'westen'];
const DEUR = ['naar boven (noorden)', 'naar rechts (oosten)', 'naar beneden (zuiden)', 'naar links (westen)'];

// polylines and shapes of the terrain, shared by the picture and the tests
const BEEK = [[306, 0], [296, 60], [312, 120], [320, 180], [304, 260]];
const PAD = [[0, 150], [80, 138], [150, 146], [200, 180], [232, 260]];
const HELLING = [[0, 0], [132, 0], [112, 104], [0, 124]];
const LAAGTE = { cx: 118, cy: 204, rx: 50, ry: 28 };
const BOOM = { x: 214, y: 58, r: 30 };
const VUUR = { x: 44, y: 220 };
const STENEN = { x: 250, y: 132 };

const pl = (punten) => punten.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
function afstandTot(punten, x, y) {
  let min = Infinity;
  for (let i = 1; i < punten.length; i++) {
    const [ax, ay] = punten[i - 1]; const [bx, by] = punten[i];
    const dx = bx - ax; const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    min = Math.min(min, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return min;
}
function inVeelhoek(punten, x, y) {
  let binnen = false;
  for (let i = 0, j = punten.length - 1; i < punten.length; j = i++) {
    const [xi, yi] = punten[i]; const [xj, yj] = punten[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) binnen = !binnen;
  }
  return binnen;
}

/** What is wrong (or right) about a place: [{ soort: 'fout' | 'matig', tekst, kort }]. */
function bekijk(x, y) {
  const uit = [];
  const beek = afstandTot(BEEK, x, y);
  if (beek < 14) uit.push({ soort: 'fout', kort: 'in de beek', tekst: 'Dat is de beek zelf.' });
  else if (beek < 40) uit.push({ soort: 'fout', kort: 'op de oever', tekst: 'Op de oever: na veel regen kan het water stijgen, en de grond is er zacht en nat.' });
  if (((x - LAAGTE.cx) / (LAAGTE.rx + 10)) ** 2 + ((y - LAAGTE.cy) / (LAAGTE.ry + 10)) ** 2 < 1) {
    uit.push({ soort: 'fout', kort: 'in de laagte', tekst: 'In een laagte: bij regen loopt het water hierheen, en dan staat je tent in een plas.' });
  }
  if (inVeelhoek(HELLING, x, y)) uit.push({ soort: 'fout', kort: 'op de helling', tekst: 'Op de helling: je glijdt ’s nachts naar beneden, en regenwater loopt onder je tent door.' });
  if (Math.hypot(x - BOOM.x, y - BOOM.y) < BOOM.r + 22) {
    uit.push({ soort: 'fout', kort: 'onder de boom', tekst: 'Onder een boom met dode takken: bij wind kan een tak op je tent vallen. En na een bui blijft het nog lang druppen.' });
  }
  if (afstandTot(PAD, x, y) < 22) uit.push({ soort: 'fout', kort: 'op het pad', tekst: 'Op of naast het pad: hier loopt iedereen langs, en je scheerlijnen worden struikeldraden.' });
  if (Math.hypot(x - VUUR.x, y - VUUR.y) < 52) uit.push({ soort: 'fout', kort: 'bij het vuur', tekst: 'Te dicht bij de vuurplaats: vonken branden gaatjes in tentdoek.' });
  if (Math.hypot(x - STENEN.x, y - STENEN.y) < 26) uit.push({ soort: 'matig', kort: 'tussen de stenen', tekst: 'Tussen stenen en wortels: hobbelig slapen, haringen gaan er slecht in, en je grondzeil kan scheuren. Haal losse stenen weg, of schuif een stukje op.' });
  return uit;
}

export default function tentplek() {
  let wind = 3;                 // where the wind comes from: 0 N, 1 O, 2 Z, 3 W
  let plek = null;              // [x, y] of the tent
  let deur = 0;
  let fase = 'plek';            // 'plek': choose where; 'deur': turn the door; 'klaar': judged
  let cursor = [180, 100];
  let toonCursor = false;
  let goed = 0; let rondes = 0;
  let getekend = null;          // the phase the words were last made for

  // -- the terrain
  const terrein = s('g');
  terrein.append(
    s('rect', { x: 0, y: 0, width: W, height: H, class: 'kd-gras' }),
    s('path', { d: `${pl(HELLING)}Z`, fill: 'transparent' }));
  for (let i = 0; i < 4; i++) terrein.append(s('path', { d: `M0 ${18 + i * 26}Q${60 + i * 6} ${10 + i * 22} ${126 - i * 5} ${-2 + i * 24}`, class: 'kd-hoogte' }));
  terrein.append(s('text', { x: 40, y: 64, class: 'kd-label' }, 'helling'));
  terrein.append(s('ellipse', { ...LAAGTE, class: 'kd-laagte' }), s('text', { x: LAAGTE.cx, y: LAAGTE.cy + 4, 'text-anchor': 'middle', class: 'kd-label blauw' }, 'laagte'));
  terrein.append(s('path', { d: pl(BEEK), class: 'kd-water-lijn', 'stroke-width': 18 }), s('text', { x: 330, y: 246, 'text-anchor': 'middle', class: 'kd-label blauw' }, 'beek'));
  terrein.append(s('path', { d: pl(PAD), class: 'kd-pad', 'stroke-width': 12 }), s('text', { x: 18, y: 168, class: 'kd-label' }, 'pad'));
  terrein.append(
    s('circle', { cx: BOOM.x, cy: BOOM.y, r: BOOM.r, class: 'kd-kruin' }),
    s('path', { d: `M${BOOM.x} ${BOOM.y}l-20 -8m20 8l14 -18m-14 18l22 10m-8 -4l8 -10`, class: 'kd-dood' }),
    s('text', { x: BOOM.x, y: BOOM.y + BOOM.r + 14, 'text-anchor': 'middle', class: 'kd-label' }, 'dode takken'));
  for (let i = 0; i < 8; i++) {
    const g = (i * 360) / 8;
    terrein.append(s('circle', { cx: VUUR.x + 13 * Math.sin((g * Math.PI) / 180), cy: VUUR.y - 13 * Math.cos((g * Math.PI) / 180), r: 3.5, class: 'kd-steen' }));
  }
  terrein.append(s('path', { d: `M${VUUR.x - 6} ${VUUR.y + 6}l6 -14l6 14z`, class: 'kd-vuur' }),
    s('text', { x: VUUR.x, y: VUUR.y + 30, 'text-anchor': 'middle', class: 'kd-label' }, 'vuurplaats'));
  for (const [dx, dy, r] of [[-10, -6, 5], [6, -10, 4], [10, 6, 6], [-6, 10, 4], [0, 0, 3]]) terrein.append(s('circle', { cx: STENEN.x + dx, cy: STENEN.y + dy, r, class: 'kd-steen' }));
  terrein.append(s('text', { x: STENEN.x, y: STENEN.y + 26, 'text-anchor': 'middle', class: 'kd-label' }, 'stenen'));
  terrein.append(s('rect', { x: 0.5, y: 0.5, width: W - 1, height: H - 1, rx: 10, class: 'kd-rand' }));

  const windPijl = s('g');
  const tent = s('g', { visibility: 'hidden' });
  const tentVlak = s('rect', { x: -20, y: -13, width: 40, height: 26, rx: 4, class: 'kd-tent' });
  const deurVlak = s('path', { d: 'M-7 -13L0 -21L7 -13Z', class: 'kd-deur' });
  tent.append(tentVlak, deurVlak);
  const kruis = s('g', { visibility: 'hidden' }, s('circle', { r: 16, class: 'kd-cursor' }), s('path', { d: 'M-5 0h10M0 -5v10', class: 'kd-touw' }));
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kd-svg', role: 'img', tabindex: '0' }, terrein, windPijl, tent, kruis);

  // -- the words
  const vraag = h('p.kd-vraag', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const lijst = h('ul.kd-lijst', { 'aria-live': 'polite' });
  const score = h('p.kd-score');
  const draaiL = h('button.knop.klein', { type: 'button', onclick: () => draai(-1), 'aria-label': 'Draai de deur linksom' }, '↺ draai');
  const draaiR = h('button.knop.klein', { type: 'button', onclick: () => draai(1), 'aria-label': 'Draai de deur rechtsom' }, 'draai ↻');
  const zet = actie('Zet hem neer', 'vink', () => oordeel(), { hoofd: true, klein: true });
  const anders = actie('Andere plek', 'opnieuw', () => { fase = 'plek'; teken(); }, { klein: true });
  const opnieuw = actie('Nog een keer', 'opnieuw', () => nieuweRonde(), { hoofd: true, klein: true });
  const knoppen = acties();

  const WINDPLEK = [[180, 18], [342, 92], [180, 242], [18, 92]];
  function zetWind() {
    const [x, y] = WINDPLEK[wind];
    windPijl.replaceChildren(
      s('path', { d: 'M0 -14V14M-7 6L0 14L7 6', class: 'kd-wind', transform: `translate(${x} ${y}) rotate(${wind * 90})` }),
      s('text', { x: wind % 2 ? x : x + 26, y: wind % 2 ? y + 30 : y + 4, 'text-anchor': 'middle', class: 'kd-label blauw' }, 'wind'));
  }

  const DEURVORM = ['M-7 -13L0 -21L7 -13Z', 'M20 -7L28 0L20 7Z', 'M-7 13L0 21L7 13Z', 'M-20 -7L-28 0L-20 7Z'];
  function plaatsTent([x, y]) {
    tent.setAttribute('transform', `translate(${x} ${y})`);
    deurVlak.setAttribute('d', DEURVORM[deur]);
    tent.setAttribute('visibility', 'visible');
  }

  function teken() {
    if (plek) plaatsTent(plek); else tent.setAttribute('visibility', 'hidden');
    const [cx, cy] = cursor;
    kruis.setAttribute('transform', `translate(${cx} ${cy})`);
    kruis.setAttribute('visibility', toonCursor && fase === 'plek' ? 'visible' : 'hidden');
    if (fase !== 'klaar') tentVlak.classList.remove('goed', 'fout');
    const nieuw = fase !== getekend;
    getekend = fase;
    if (fase === 'plek') {
      if (nieuw) vraag.textContent = `De wind komt uit het ${RICHTING[wind]}. Tik aan waar jij je tent zet.`;
      if (nieuw) { knoppen.replaceChildren(); lijst.replaceChildren(); }
    } else if (fase === 'deur') {
      vraag.textContent = `Draai de deur goed. Hij wijst nu ${DEUR[deur]}. De wind komt uit het ${RICHTING[wind]}.`;
      if (nieuw) { knoppen.replaceChildren(draaiL, draaiR, zet, anders); lijst.replaceChildren(); }
    } else if (nieuw) {
      knoppen.replaceChildren(opnieuw);
    }
    knoppen.hidden = !knoppen.childElementCount;          // no line under the words while you are still choosing a place
    svg.setAttribute('aria-label', `Kampterrein van boven: links boven een helling, links onder een laagte en de vuurplaats, rechts een beek, boven in het midden een boom met dode takken, een pad van links naar rechts onder, en stenen. De wind komt uit het ${RICHTING[wind]}. Kies een plek met de pijltjestoetsen en Enter, of tik.`);
    score.textContent = rondes ? `Goede plekken: ${goed} van ${rondes}` : '';
  }

  function kies([x, y]) {
    if (fase === 'klaar') return;
    plek = [Math.max(22, Math.min(W - 22, x)), Math.max(22, Math.min(H - 16, y))];
    fase = 'deur';
    teken();
  }

  function draai(d) {
    deur = (deur + d + 4) % 4;
    teken();
  }

  function oordeel() {
    const [x, y] = plek;
    const punten = bekijk(x, y);
    // the door: out of the wind is best, sideways is fine, into the wind is not
    const tegen = (deur - wind + 4) % 4;
    if (tegen === 0) punten.push({ soort: 'fout', tekst: 'De deur staat in de wind: de wind en de regen waaien zo naar binnen. Draai hem de andere kant op.' });
    else if (tegen === 2) punten.push({ soort: 'goed', tekst: 'De deur staat uit de wind: de dichte achterkant vangt de wind. Goed zo.' });
    else punten.push({ soort: 'matig', tekst: 'De deur staat dwars op de wind. Dat kan, maar met de deur helemaal uit de wind blijft het binnen droger.' });
    const fout = punten.filter((p) => p.soort === 'fout');
    const vlak = !punten.some((p) => p.kort);
    if (vlak) punten.unshift({ soort: 'goed', tekst: 'Vlak gras, niet in een laagte, niet onder een boom, weg van het water, het pad en het vuur. Een goede plek.' });
    rondes++;
    if (!fout.length) goed++;
    fase = 'klaar';
    tentVlak.classList.add(fout.length ? 'fout' : 'goed');
    vraag.textContent = fout.length ? 'Hier zou ik hem niet zetten:' : 'Goed gekozen!';
    lijst.replaceChildren(...punten.sort((a, b) => ['fout', 'matig', 'goed'].indexOf(a.soort) - ['fout', 'matig', 'goed'].indexOf(b.soort))
      .map((p) => h('li', { class: p.soort }, p.tekst)));
    teken();
    opnieuw.focus({ preventScroll: true });
  }

  function nieuweRonde() {
    let w;
    do w = Math.floor(Math.random() * 4); while (w === wind);
    wind = w; plek = null; deur = 0; fase = 'plek'; toonCursor = false;
    zetWind();
    teken();
  }

  // -- pointing: a tap places the tent, in the door phase too (to move it)
  const punt = (e) => {
    const r = svg.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  svg.addEventListener('click', (e) => { if (fase !== 'klaar') kies(punt(e)); });
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (fase === 'plek') { if (toonCursor) kies(cursor); else { toonCursor = true; teken(); } } else if (fase === 'deur') oordeel(); else nieuweRonde();
      return;
    }
    const stap = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (!stap) return;
    e.preventDefault();
    if (fase === 'deur') { draai(stap[0] + stap[1] > 0 ? 1 : -1); return; }
    if (fase !== 'plek') return;
    cursor = [Math.max(10, Math.min(W - 10, cursor[0] + stap[0])), Math.max(10, Math.min(H - 10, cursor[1] + stap[1]))];
    toonCursor = true;
    const hier = bekijk(...cursor).map((p) => p.kort).filter(Boolean);
    stand.textContent = hier.length ? `Hier: ${hier.join(', ')}.` : 'Hier: vlak gras.';
    teken();
  });
  svg.addEventListener('blur', () => { toonCursor = false; kruis.setAttribute('visibility', 'hidden'); });

  const el = h('div.kd.naast.doe-tentplek', svg, h('div.kd-tekst', vraag, stand, knoppen, lijst, score));
  zetWind();
  teken();
  return el;
}
