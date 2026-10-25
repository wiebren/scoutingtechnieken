// Hoogte van een boom, three ways (opties.methode):
// - potlood: what you see. Cover the tree with a pencil at arm's length, tip it over at the foot of the tree, and
//   move a friend to where the tip points. From there to the tree is the height.
// - stok: from the side, and what you see. A stick as long as your arm, held upright at arm's length: walk back
//   until it covers the tree from foot to top. Your distance is then the height.
// - schaduw: from the side, with the sun. The shadow of the tree times the stick, divided by the shadow of the stick.
// Small-angle sums, as the methods themselves use them.
import { h } from '../../dom.js';
import { actie, acties, zetActie } from '../knoppen.js';
import { getal, s, sleep, tussen } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './boomhoogte.css';

const PAS = 0.75;

export default function boomhoogte({ methode = 'stok' } = {}) {
  return { potlood, stok, schaduw }[methode]();
}

/** A tree with its foot at x, y, h px tall. */
function boom(x, y, hoog) {
  const r = Math.max(10, hoog * 0.3);
  return s('g', {},
    s('path', { d: `M${x - hoog * 0.025 - 1} ${y} L${x - 1.5} ${y - hoog + r} L${x + 1.5} ${y - hoog + r} L${x + hoog * 0.025 + 1} ${y}Z`, class: 'stam' }),
    s('ellipse', { cx: x, cy: y - hoog + r, rx: r * 0.85, ry: r, class: 'kruin' }),
    s('ellipse', { cx: x - r * 0.35, cy: y - hoog + r * 1.5, rx: r * 0.6, ry: r * 0.65, class: 'kruin' }),
    s('ellipse', { cx: x + r * 0.4, cy: y - hoog + r * 1.4, rx: r * 0.6, ry: r * 0.7, class: 'kruin' }));
}

/** A small person standing at x, y (feet), h px tall; `wijst` adds an arm held out. */
function poppetje(x, y, hh, klasse = 'bh-pop') {
  const k = hh / 100;
  return s('g', { class: klasse, transform: `translate(${x} ${y}) scale(${k.toFixed(3)})` },
    s('circle', { cx: 0, cy: -90, r: 9 }),
    s('path', { d: 'M0 -80 V-40 M0 -40 L-9 0 M0 -40 L9 0 M0 -72 L-11 -48 M0 -72 L11 -48' }));
}

// -- potlood ------------------------------------------------------------------------------------------------------

function potlood() {
  const H = tussen(9, 22);          // metres
  const D = tussen(30, 45);         // you stand this far
  const S = 150 / H;                // px per metre at the tree, as you see it from there
  const [bx, gy] = [90, 196];       // the foot of the tree in the picture
  let stap = 0;                     // 0 pencil up, 1 pencil tipped over
  let vriend = tussen(4, 8);        // metres to the right of the tree

  const L = H * S;
  const pen = s('g', { class: 'bh-pen' },
    s('rect', { x: -4, y: -L + 10, width: 8, height: L + 4, class: 'bh-pen-hout' }),
    s('path', { d: `M-4 ${-L + 10} L0 ${-L} L4 ${-L + 10}Z`, class: 'bh-pen-punt' }),
    s('rect', { x: -4.5, y: 14, width: 9, height: 7, class: 'bh-pen-gum' }),
    s('ellipse', { cx: 1, cy: 0, rx: 9, ry: 6, class: 'bh-duim' }));
  // the pencil is drawn point up, the point at the top of the tree and the thumb at its foot; the rest of the pencil
  // sticks out below the thumb. Tipped over it turns about the thumb, so the point now lies H to the right
  let hoek = 0;                     // how far it is tipped, 0 to 90 degrees
  let beweegt = 0;
  const penHouder = s('g', { transform: `translate(${bx} ${gy})` }, pen);
  const pop = s('g', {});
  const greep = s('rect', { y: gy - 60, width: 44, height: 70, rx: 10, class: 'greep' });
  const svg = s('svg', { viewBox: '0 0 360 220', class: 'wn-svg wn-rand bh-svg', role: 'slider', tabindex: '0',
    'aria-label': 'Wat je ziet: de boom, je potlood en je vriend. Sleep je vriend, of gebruik de pijltjes.', 'aria-valuemin': '0', 'aria-valuemax': '40' },
    s('rect', { x: 0, y: 0, width: 360, height: gy, class: 'lucht' }),
    s('rect', { x: 0, y: gy, width: 360, height: 220 - gy, class: 'gras' }),
    boom(bx, gy, H * S), pop, penHouder, greep);

  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const uitkomst = h('p', { 'aria-live': 'polite' });
  const kantel = actie('Kantel het potlood', 'start', () => zetStap(stap ? 0 : 1), { hoofd: true, klein: true });
  const meet = actie('Tel de passen', 'vink', meten, { klein: true });
  const el = h('div.wn.doe-boomhoogte',
    h('p', `Je staat ${D} m van de boom. Het potlood dekt de boom precies af: de punt bij de top, je duim bij de voet.`),
    svg, acties(kantel, meet), melding, uitkomst);

  function teken() {
    const x = bx + vriend * S;
    pop.replaceChildren(poppetje(x, gy, 1.7 * S, 'bh-vriend'));
    greep.setAttribute('x', x - 22);
    pen.setAttribute('transform', `rotate(${hoek})`);
    svg.setAttribute('aria-valuenow', String(vriend));
    svg.setAttribute('aria-valuetext', `je vriend staat ${vriend} m rechts van de boom`);
    const raak = stap === 1 && Math.abs(vriend - H) < 0.5;
    melding.classList.toggle('fout', stap === 1 && !raak);
    melding.textContent = stap === 0 ? 'Kantel het potlood plat, met je duim bij de voet van de boom als draaipunt.'
      : raak ? 'Je vriend staat bij de punt van het potlood: daar ligt de top van de gevallen boom.'
        : `Wijs je vriend de weg: ${vriend < H ? 'verder naar rechts' : 'terug naar links'}. Sleep hem naar de punt van het potlood.`;
  }
  function zetStap(n) {
    stap = n; zetActie(kantel, n ? 'Zet het potlood rechtop' : 'Kantel het potlood', n ? 'terug' : 'start'); uitkomst.textContent = '';
    kantelNaar(n ? 90 : 0);
    teken();
  }
  // the pencil turns about the thumb, slowly, as your hand does it (at once with reduced motion)
  function kantelNaar(doel) {
    cancelAnimationFrame(beweegt);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { hoek = doel; teken(); return; }
    const van = hoek; const begin = performance.now(); const duur = 900 * (Math.abs(doel - van) / 90);
    const stapje = (nu) => {
      const t = Math.min(1, (nu - begin) / duur); const glad = t * t * (3 - 2 * t);
      hoek = van + (doel - van) * glad;
      pen.setAttribute('transform', `rotate(${hoek.toFixed(1)})`);
      if (t < 1) beweegt = requestAnimationFrame(stapje);
    };
    beweegt = requestAnimationFrame(stapje);
  }
  const verst = Math.floor((350 - bx) / S);
  function zetVriend(m) { vriend = Math.max(1, Math.min(verst, Math.round(m))); uitkomst.textContent = ''; teken(); }
  function meten() {
    if (stap !== 1 || Math.abs(vriend - H) >= 0.5) { uitkomst.textContent = 'Zet eerst je vriend bij de punt van het gekantelde potlood.'; return; }
    const p = Math.round(H / PAS);
    uitkomst.textContent = `Je vriend loopt ${p} passen terug naar de boom. ${p} × ${getal(PAS * 100)} cm = ${getal(p * PAS, 1)} m: zo hoog is de boom (echt: ${H} m).`;
  }

  sleep(greep, svg, ({ x }) => zetVriend((x - bx) / S));
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); zetVriend(vriend + d); }
  });
  teken();
  return el;
}

// -- stok ---------------------------------------------------------------------------------------------------------

function stok() {
  const H = tussen(8, 22);
  const K = 7;                       // px per metre in the side view
  const [tx, gy] = [330, 215];
  let afstand = 6;                   // metres from you to the tree

  const zijZicht = s('g', {});
  const greep = s('rect', { y: gy - 46, width: 36, height: 56, rx: 10, class: 'greep' });
  const zij = s('svg', { viewBox: '0 0 360 230', class: 'wn-svg wn-rand bh-svg', role: 'slider', tabindex: '0',
    'aria-label': 'Van opzij: jij en de boom. Sleep jezelf naar voren of naar achteren, of gebruik de pijltjes.', 'aria-valuemin': '2', 'aria-valuemax': '44' },
    s('rect', { x: 0, y: 0, width: 360, height: gy, class: 'lucht' }),
    s('rect', { x: 0, y: gy, width: 360, height: 230 - gy, class: 'gras' }),
    boom(tx, gy, H * K), zijZicht, greep);

  const oogBoom = s('g', {});
  const oog = s('svg', { viewBox: '0 0 200 200', class: 'wn-svg wn-rand bh-oog', role: 'img' },
    s('rect', { x: 0, y: 0, width: 200, height: 170, class: 'lucht' }), s('rect', { x: 0, y: 170, width: 200, height: 30, class: 'gras' }),
    oogBoom,
    s('rect', { x: 64, y: 20, width: 6, height: 150, rx: 2, class: 'bh-stok' }),
    s('ellipse', { cx: 67, cy: 176, rx: 14, ry: 11, class: 'bh-duim' }),
    s('text', { x: 100, y: 14, 'text-anchor': 'middle', class: 'klein stil' }, 'wat jij ziet'));

  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const uitkomst = h('p', { 'aria-live': 'polite' });
  const el = h('div.wn.doe-boomhoogte',
    h('p', 'Je stok is zo lang als je arm tot je vuist. Je houdt hem rechtop, met je arm gestrekt. Je vuist staat op de voet van de boom. Loop naar voren of naar achteren tot de punt van de stok precies bij de top komt.'),
    h('div.bh-twee', zij, oog),
    acties(actie('Tel je passen naar de boom', 'vink', meten, { klein: true })),
    melding, uitkomst);

  function teken() {
    const x = tx - afstand * K;
    const ooghoogte = 1.5 * K;
    zijZicht.replaceChildren(
      s('path', { d: `M${x + 2} ${gy - ooghoogte} L${tx} ${gy - H * K} M${x + 2} ${gy - ooghoogte} L${tx} ${gy}`, class: 'zicht' }),
      poppetje(x, gy, 1.7 * K, 'bh-jij'),
      s('text', { x, y: gy + 13, 'text-anchor': 'middle', class: 'klein' }, `${afstand} m`));
    greep.setAttribute('x', x - 18);
    // seen by you: the stick covers 150 px, and that is as much as a tree as high as you are far away
    const hoog = (150 * H) / afstand;
    oogBoom.replaceChildren(boom(104, 170, hoog), s('path', { d: 'M70 20 H190', class: 'lijn dun stil', 'stroke-dasharray': '3 3' }), s('path', { d: 'M70 170 H190', class: 'lijn dun stil', 'stroke-dasharray': '3 3' }));
    zij.setAttribute('aria-valuenow', String(afstand));
    zij.setAttribute('aria-valuetext', `${afstand} meter van de boom`);
    const raak = afstand === H;
    melding.classList.toggle('fout', !raak);
    melding.textContent = raak ? 'De stok dekt de boom precies, van de voet tot de top.'
      : hoog > 150 ? 'De boom steekt boven de stok uit: loop achteruit.' : 'De boom is kleiner dan de stok: loop naar voren.';
    oog.setAttribute('aria-label', `Wat je ziet: ${melding.textContent}`);
  }
  function zet(m) { afstand = Math.max(2, Math.min(44, Math.round(m))); uitkomst.textContent = ''; teken(); }
  function meten() {
    if (afstand !== H) { uitkomst.textContent = 'Zorg eerst dat de stok de boom precies dekt.'; return; }
    const p = Math.round(H / PAS);
    uitkomst.textContent = `${p} passen van ${getal(PAS * 100)} cm is ${getal(p * PAS, 1)} m. Zo hoog is de boom ongeveer (echt: ${H} m).`;
  }

  sleep(greep, zij, ({ x }) => zet((tx - x) / K));
  zij.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (d) { e.preventDefault(); zet(afstand + d); }
  });
  teken();
  return el;
}

// -- schaduw ------------------------------------------------------------------------------------------------------

function schaduw() {
  let H = 0; let zon = 0;
  const STOK = 2;
  const K = 6;
  const [tx, gy] = [96, 200];
  const sx = 34;                     // the stick, left of the tree

  const tekening = s('g', {});
  const svg = s('svg', { viewBox: '0 0 360 230', class: 'wn-svg wn-rand bh-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: gy, class: 'lucht' }),
    s('rect', { x: 0, y: gy, width: 360, height: 230 - gy, class: 'gras' }), tekening);
  const zonTekst = h('strong');
  const schuif = h('input.doe-schuif', { type: 'range', min: 25, max: 60, step: 1, 'aria-label': 'Hoe hoog de zon staat, in graden',
    oninput: () => { zon = Number(schuif.value); teken(); } });
  const veld = h('input.doe-veld', { type: 'number', min: 1, max: 60, step: 0.5, inputmode: 'decimal', 'aria-label': 'Hoogte van de boom in meters',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); controleer(); } } });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const metingen = h('p', { 'aria-live': 'polite' });
  const el = h('div.wn.doe-boomhoogte',
    svg, metingen,
    h('label.doe-label', h('span', 'Zon: ', zonTekst), schuif),
    h('div.wn-rij', h('span', 'De boom is'), veld, h('span', 'm hoog')),
    acties(actie('Kijk na', 'vink', controleer, { hoofd: true, klein: true }), actie('Andere boom', 'opnieuw', nieuw, { klein: true })),
    melding);

  const lang = (hoog) => hoog / Math.tan((zon * Math.PI) / 180);
  const r1 = (n) => Math.round(n * 10) / 10;

  function teken() {
    const ls = r1(lang(STOK)); const lb = r1(lang(H));
    zonTekst.textContent = `${zon}° boven de horizon`;
    tekening.replaceChildren(
      s('circle', { cx: 345 - (zon - 25) * 2, cy: 22 + (60 - zon) * 1.6, r: 10, class: 'bh-zon' }),
      s('path', { d: `M${tx} ${gy} H${tx + lb * K}`, class: 'bh-schaduw' }),
      s('path', { d: `M${sx} ${gy} H${sx + ls * K}`, class: 'bh-schaduw' }),
      s('path', { d: `M${tx + lb * K} ${gy} L${tx} ${gy - H * K}`, class: 'lijn dun stil', 'stroke-dasharray': '3 3' }),
      boom(tx, gy, H * K),
      s('rect', { x: sx - 1.5, y: gy - STOK * K, width: 3, height: STOK * K, class: 'bh-stokje' }),
      s('path', { d: `M${tx} ${gy + 10} H${tx + lb * K} M${tx} ${gy + 6} v8 M${tx + lb * K} ${gy + 6} v8`, class: 'maat' }),
      s('text', { x: tx + (lb * K) / 2, y: gy + 24, 'text-anchor': 'middle', class: 'klein' }, `schaduw boom ${getal(lb, 1)} m`),
      s('text', { x: sx, y: gy - STOK * K - 6, 'text-anchor': 'middle', class: 'klein' }, `stok ${STOK} m`));
    metingen.textContent = `Je meet: de stok van ${STOK} m geeft ${getal(ls, 1)} m schaduw, de boom ${getal(lb, 1)} m.`;
    svg.setAttribute('aria-label', `Een boom en een stok van 2 meter in de zon, ${zon} graden hoog. ${metingen.textContent}`);
  }
  function nieuw() {
    H = tussen(8, 18); zon = tussen(30, 55); schuif.value = zon;
    veld.value = ''; melding.textContent = ''; melding.classList.remove('fout');
    teken();
  }
  function controleer() {
    const g = Number(String(veld.value).replace(',', '.'));
    if (!veld.value) { melding.textContent = 'Vul de hoogte in.'; melding.classList.add('fout'); return; }
    const ls = r1(lang(STOK)); const lb = r1(lang(H));
    const juist = (lb * STOK) / ls;
    const goed = Math.abs(g - juist) <= Math.max(0.5, juist * 0.05);
    melding.classList.toggle('fout', !goed);
    melding.textContent = `${goed ? 'Goed!' : 'Nog niet.'} ${getal(lb, 1)} × ${STOK} ÷ ${getal(ls, 1)} = ${getal(juist, 1)} m.${goed ? '' : ' Schaduw van de boom keer de stok, gedeeld door de schaduw van de stok.'}`;
  }

  nieuw();
  return el;
}
