// Oleaat: a transparent sheet with only the route and a north arrow, to lay on the map. First turn the sheet until
// its north arrow points to the top of the map, then slide it until the line lies exactly on the roads. Then you
// know where the route goes. Drag the sheet with a finger or the mouse, turn it with the buttons; or use the arrow
// keys to slide and [ and ] to turn.
import { h } from '../../dom.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './oleaat.css';

const B = 360; const H = 260;
// a road network: crossings and the roads between them (index pairs), irregular so a route fits in one place only
const PUNTEN = [[20, 40], [110, 30], [200, 50], [300, 25], [345, 90], [60, 110], [150, 100], [240, 120], [320, 160],
  [30, 190], [100, 180], [180, 175], [250, 210], [340, 235], [130, 245], [60, 250]];
const WEGEN = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 6], [2, 7], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8],
  [5, 9], [5, 10], [6, 11], [7, 11], [7, 12], [8, 13], [9, 10], [10, 11], [11, 12], [12, 13], [10, 14], [11, 14], [12, 14], [9, 15], [15, 14]];
const PADEN = [[0, 9], [8, 12], [1, 3]];
const r1 = (n) => Math.round(n * 10) / 10;

function buren(i) { return WEGEN.filter((w) => w.includes(i)).map(([a, b]) => (a === i ? b : a)); }

/** A route of 4 or 5 roads that never visits a crossing twice. */
function maakRoute() {
  for (;;) {
    const lengte = 4 + Math.floor(Math.random() * 2);
    const route = [Math.floor(Math.random() * PUNTEN.length)];
    while (route.length <= lengte) {
      const opties = buren(route.at(-1)).filter((n) => !route.includes(n));
      if (!opties.length) break;
      route.push(opties[Math.floor(Math.random() * opties.length)]);
    }
    if (route.length > lengte) return route;
  }
}

export default function oleaat() {
  let route; let doelHoek; let hoek; let pos; let klaar; let midden = [0, 0]; let maat = [0, 0];

  const kaart = s('g'); const echt = s('g');
  const vel = s('g', { class: 'ol-vel' });
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'ol-svg', tabindex: '0', role: 'application' }, kaart, echt, vel);
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const stand = h('p.doe-sr', { 'aria-live': 'polite' });
  const draai = (d) => () => { if (!klaar) { hoek = (hoek + d + 360) % 360; tekenVel(); meld(); } };
  const opnieuw = h('button.knop', { type: 'button', onclick: () => begin() }, 'Nieuwe oleaat');

  const el = h('div.doe-oleaat',
    h('p.doe-stil', 'De blauwe oleaat ligt nog verkeerd. Draai hem tot zijn noordpijl naar boven wijst, en schuif hem tot de rode lijn precies over de wegen valt.'),
    svg,
    h('div.knop-rij', h('button.knop', { type: 'button', onclick: draai(-5) }, '↺ Draai'), h('button.knop', { type: 'button', onclick: draai(5) }, 'Draai ↻'), opnieuw),
    melding, stand);

  // the route on the sheet, relative to its first crossing
  const routePunten = () => route.map((i) => [PUNTEN[i][0] - PUNTEN[route[0]][0], PUNTEN[i][1] - PUNTEN[route[0]][1]]);

  /** Where the middle of the sheet lies when it fits. */
  const doelPos = () => [PUNTEN[route[0]][0] + midden[0], PUNTEN[route[0]][1] + midden[1]];

  function tekenKaart() {
    kaart.replaceChildren(s('rect', { x: 0, y: 0, width: B, height: H, class: 'ol-grond' }),
      s('path', { d: 'M200 140q40 -10 60 20t-20 40q-40 6 -50 -20z', class: 'ol-bos' }),
      s('path', { d: 'M40 140q30 -10 40 14t-14 26q-30 2 -30 -20z', class: 'ol-water' }));
    for (const [a, b] of WEGEN) kaart.append(s('path', { d: `M${PUNTEN[a].join(' ')}L${PUNTEN[b].join(' ')}`, class: 'ol-weg' }));
    for (const [a, b] of PADEN) kaart.append(s('path', { d: `M${PUNTEN[a].join(' ')}L${PUNTEN[b].join(' ')}`, class: 'ol-pad' }));
    kaart.append(s('g', { transform: `translate(${B - 18} 34)`, class: 'ol-noord-kaart' }, s('path', { d: 'M0 14V-8M-6 -2L0 -14L6 -2Z' }), s('text', { x: 0, y: -18, 'text-anchor': 'middle' }, 'N')));
  }

  function tekenVel() {
    const pt = routePunten();
    const xs = pt.map((p) => p[0]); const ys = pt.map((p) => p[1]);
    const rand = 16;
    const [x0, y0, x1, y1] = [Math.min(...xs) - rand, Math.min(...ys) - rand, Math.max(...xs) + rand, Math.max(...ys) + rand + 26];
    midden = [(x0 + x1) / 2, (y0 + y1) / 2]; maat = [x1 - x0, y1 - y0];
    // pos is where the middle of the sheet lies; the sheet turns around its middle
    vel.setAttribute('transform', `translate(${r1(pos[0])} ${r1(pos[1])}) rotate(${hoek}) translate(${r1(-midden[0])} ${r1(-midden[1])})`);
    vel.replaceChildren(
      s('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 4, class: 'ol-vlak' }),
      s('path', { d: `M${pt.map((p) => p.join(' ')).join('L')}`, class: 'ol-route' }),
      s('circle', { cx: 0, cy: 0, r: 4.5, class: 'ol-start' }),
      s('g', { transform: `translate(${x0 + 14} ${y1 - 14}) rotate(${-doelHoek})`, class: 'ol-noord' }, s('path', { d: 'M0 10V-6M-5 -1L0 -11L5 -1Z' }), s('text', { x: 0, y: -14, 'text-anchor': 'middle' }, 'N')));
    vel.classList.toggle('klaar', klaar);
  }

  function meld() {
    const fout = Math.abs(((hoek - doelHoek + 540) % 360) - 180);
    const doel = doelPos();
    const afstand = Math.hypot(pos[0] - doel[0], pos[1] - doel[1]);
    if (fout === 0 && afstand < 10) {
      klaar = true; pos = doel; tekenVel();
      echt.replaceChildren(s('path', { d: `M${route.map((i) => PUNTEN[i].join(' ')).join('L')}`, class: 'ol-gevonden' }));
      melding.textContent = 'Hij past! De rode lijn ligt nu precies op de wegen: dat is je route, en het bolletje is het begin.';
      return;
    }
    stand.textContent = fout ? `De noordpijl van de oleaat staat ${Math.round(fout)} graden scheef.` : 'De noordpijl wijst naar boven. Schuif de oleaat nu tot hij past.';
    melding.textContent = fout ? '' : 'De oleaat ligt goed gedraaid. Nu nog schuiven.';
  }

  function begin() {
    route = maakRoute(); klaar = false; echt.replaceChildren();
    doelHoek = 0;
    hoek = (Math.floor(Math.random() * 10) + 2) * 15 * (Math.random() < 0.5 ? -1 : 1);
    hoek = (hoek + 360) % 360;
    pos = [0, 0]; tekenVel();
    // the sheet starts somewhere else than where it fits
    const doel = doelPos();
    const half = Math.hypot(...maat) / 2;
    const mx = Math.min(half, B / 2 - 10); const my = Math.min(half, H / 2 - 10);
    let pogingen = 0;
    do pos = [mx + Math.random() * (B - 2 * mx), my + Math.random() * (H - 2 * my)]; while (Math.hypot(pos[0] - doel[0], pos[1] - doel[1]) < 50 && ++pogingen < 50);
    melding.textContent = '';
    svg.setAttribute('aria-label', 'Een kaart met wegen en een doorzichtige oleaat erop. Pijltjes schuiven de oleaat, [ en ] draaien hem.');
    tekenKaart(); tekenVel(); meld();
  }

  // dragging the sheet
  let greep = null;
  const plek = (e) => { const r = svg.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * B, ((e.clientY - r.top) / r.height) * H]; };
  svg.addEventListener('pointerdown', (e) => {
    if (klaar) return;
    const p = plek(e); greep = [p[0] - pos[0], p[1] - pos[1]];
    svg.setPointerCapture(e.pointerId); e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (!greep) return;
    const p = plek(e); pos = [Math.max(0, Math.min(B, p[0] - greep[0])), Math.max(0, Math.min(H, p[1] - greep[1]))];
    tekenVel();
  });
  const los = () => { if (greep) { greep = null; meld(); } };
  svg.addEventListener('pointerup', los);
  svg.addEventListener('pointercancel', los);
  svg.addEventListener('keydown', (e) => {
    if (klaar) return;
    if (e.key === '[' || e.key === ']') { e.preventDefault(); draai(e.key === '[' ? -5 : 5)(); return; }
    const d = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key];
    if (!d) return;
    e.preventDefault();
    pos = [pos[0] + d[0] * (e.shiftKey ? 5 : 1), pos[1] + d[1] * (e.shiftKey ? 5 : 1)];
    tekenVel(); meld();
  });

  begin();
  return el;
}
