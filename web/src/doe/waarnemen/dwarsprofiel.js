// Dwarsprofiel van een beek: a rope across a murky beek with a mark every 50 cm. Tap a mark (or Volgende) and a
// stone on a string goes down until it lies on the bottom; the depth goes onto the millimetre paper below. With
// every mark measured the points are joined, and you can lift the water to see how close the drawing is.
import { h } from '../../dom.js';
import { getal, rustig, s, tussen } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './dwarsprofiel.css';

const [X0, X1] = [40, 320];       // the banks on the picture
const OPP = 52;                   // the water surface
const TOUW = 30;                  // the rope
const PX = 0.75;                  // px per cm of depth, above
const PAPIER = [176, 266];        // the millimetre paper, top and bottom
const PP = 0.6;                   // px per cm on the paper

export default function dwarsprofiel() {
  let breed = 0; let diep = 0; let vorm = [];
  let gemeten = [];
  let open = false;
  let bezig = false;               // a stone is going down

  const xVan = (m) => X0 + (m / breed) * (X1 - X0);
  const diepte = (m) => {                                           // the real bottom, in cm
    const t = m / breed;
    return Math.max(0, diep * Math.pow(Math.sin(Math.PI * t), vorm[0]) + vorm[1] * Math.sin(3 * Math.PI * t) * Math.sin(Math.PI * t));
  };

  const bodem = s('path', { class: 'dp-bodem' });
  const water = s('path', { class: 'dp-water' });
  const merken = s('g', {});
  const lood = s('g', { class: 'dp-lood' });
  const papierPunten = s('g', {});
  const papierLijn = s('path', { class: 'dp-meetlijn' });
  const papierEcht = s('path', { class: 'dp-echt' });
  const raster = s('g', { class: 'dp-raster' });

  const svg = s('svg', { viewBox: '0 0 360 280', class: 'wn-svg wn-rand dp-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: 160, class: 'lucht' }),
    bodem, water,
    s('path', { d: `M${X0 - 14} ${TOUW - 6} V${OPP + 4} M${X1 + 14} ${TOUW - 6} V${OPP + 4}`, class: 'lijn' }),
    s('path', { d: `M${X0 - 14} ${TOUW} H${X1 + 14}`, class: 'dp-touw' }),
    merken, lood,
    s('rect', { x: X0 - 4, y: PAPIER[0] - 4, width: X1 - X0 + 8, height: PAPIER[1] - PAPIER[0] + 8, class: 'dp-papier' }),
    raster, papierEcht, papierLijn, papierPunten,
    s('text', { x: X0, y: PAPIER[0] - 8, class: 'klein stil' }, 'op papier: een hokje is 10 cm diep en 50 cm breed'));

  const melding = h('p', { 'aria-live': 'polite' });
  const volgende = h('button.knop.hoofd.klein', { type: 'button', onclick: () => { const i = eerstOpen(); if (i >= 0) meet(i); } }, 'Meet bij het volgende merkteken');
  const toon = h('button.knop.klein', { type: 'button', onclick: () => { open = !open; teken(); } }, 'Laat de bodem zien');
  const el = h('div.wn.doe-dwarsprofiel',
    h('p', 'Het water is troebel: je ziet de bodem niet. Tik op een merkteken op het touw om daar het steentje te laten zakken.'),
    svg, melding,
    h('div.knop-rij', volgende, toon, h('button.knop.klein', { type: 'button', onclick: nieuw }, 'Andere beek')));

  const punten = () => Array.from({ length: Math.round(breed / 0.5) - 1 }, (_, i) => (i + 1) * 0.5);
  const eerstOpen = () => punten().findIndex((_, i) => gemeten[i] == null);

  function teken() {
    let d = `M0 ${OPP} H${X0}`;
    for (let i = 0; i <= 60; i++) { const m = (i / 60) * breed; d += ` L${xVan(m).toFixed(1)} ${(OPP + diepte(m) * PX).toFixed(1)}`; }
    d += ` H360 V160 H0 Z`;
    bodem.setAttribute('d', d);
    water.setAttribute('d', `M${X0} ${OPP} H${X1} V${OPP + diep * PX + 30} H${X0} Z`);
    water.classList.toggle('open', open);
    // murky water lies over the bottom; clear water lies behind it, so you see the real bottom
    if (open) bodem.before(water); else bodem.after(water);
    toon.textContent = open ? 'Water weer troebel' : 'Laat de bodem zien';

    merken.replaceChildren(...punten().map((m, i) => {
      const x = xVan(m);
      const g = s('g', { class: `dp-merk${gemeten[i] != null ? ' klaar' : ''}`, role: 'button', tabindex: '0', 'aria-label': `Meet bij ${getal(m, 1)} m${gemeten[i] != null ? `: ${gemeten[i]} cm` : ''}` },
        s('rect', { x: x - 12, y: TOUW - 18, width: 24, height: 30, class: 'dp-raak' }),
        s('circle', { cx: x, cy: TOUW, r: 4 }),
        s('text', { x, y: TOUW - 9, 'text-anchor': 'middle', class: 'klein' }, getal(m, 1)));
      g.addEventListener('click', () => meet(i));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); meet(i); } });
      return g;
    }));

    // on the paper: a line at every mark and every 10 cm, the points, and once all are in, the line through them
    raster.replaceChildren();
    for (let m = 0; m <= breed + 0.01; m += 0.5) raster.append(s('path', { d: `M${xVan(m).toFixed(1)} ${PAPIER[0]}V${PAPIER[1]}`, class: m % 1 ? '' : 'dik' }));
    for (let c = 0; PAPIER[0] + c * PP <= PAPIER[1] + 0.1; c += 10) raster.append(s('path', { d: `M${X0} ${(PAPIER[0] + c * PP).toFixed(1)}H${X1}`, class: c % 50 ? '' : 'dik' }));
    const naarPapier = (m, cm) => `${xVan(m).toFixed(1)} ${(PAPIER[0] + cm * PP).toFixed(1)}`;
    const lijst = punten().map((m, i) => [m, gemeten[i]]).filter(([, c]) => c != null);
    papierPunten.replaceChildren(...lijst.map(([m, c]) => s('circle', { cx: xVan(m), cy: PAPIER[0] + c * PP, r: 2.6, class: 'accent' })));
    const alles = lijst.length === punten().length;
    papierLijn.setAttribute('d', alles ? `M${naarPapier(0, 0)} ${lijst.map(([m, c]) => `L${naarPapier(m, c)}`).join(' ')} L${naarPapier(breed, 0)}` : '');
    let echt = '';
    if (open) { for (let i = 0; i <= 60; i++) { const m = (i / 60) * breed; echt += `${i ? 'L' : 'M'}${naarPapier(m, diepte(m))} `; } }
    papierEcht.setAttribute('d', echt);
    volgende.disabled = alles;
    const diepst = lijst.reduce((a, [, c]) => Math.max(a, c), 0);
    melding.textContent = alles
      ? `Klaar: ${lijst.length} metingen over ${getal(breed, 1)} m. Het diepst gemeten: ${diepst} cm. ${open ? 'De stippellijn is de echte bodem: tussen de merktekens mis je wat.' : 'Laat de bodem zien om te vergelijken.'}`
      : lijst.length ? `${lijst.length} van de ${punten().length} gemeten.` : 'Nog niets gemeten.';
    svg.setAttribute('aria-label', `Een beek van ${getal(breed, 1)} meter breed, van opzij gezien, met een touw erover. ${melding.textContent}`);
  }

  function meet(i) {
    if (gemeten[i] != null || bezig) return;
    bezig = true;
    const m = punten()[i]; const x = xVan(m); const cm = Math.round(diepte(m));
    const klaar = () => { bezig = false; gemeten[i] = cm; lood.replaceChildren(); teken(); melding.textContent = `Bij ${getal(m, 1)} m: ${cm} cm diep. ${melding.textContent}`; };
    if (rustig()) { klaar(); return; }
    const begin = performance.now(); const duur = 500;
    const stap = (t) => {
      if (!el.isConnected) { bezig = false; return; }
      const f = Math.min(1, (t - begin) / duur);
      const y = TOUW + (OPP - TOUW + cm * PX) * f;
      lood.replaceChildren(s('path', { d: `M${x} ${TOUW} V${y - 4}`, class: 'lijn dun' }), s('circle', { cx: x, cy: y - 3, r: 3.5, class: 'dp-steen' }));
      if (f < 1) requestAnimationFrame(stap); else setTimeout(klaar, 250);
    };
    requestAnimationFrame(stap);
  }

  function nieuw() {
    breed = tussen(6, 9) * 0.5;
    diep = tussen(50, 110);
    vorm = [0.6 + Math.random() * 1.2, (Math.random() - 0.5) * 40];
    gemeten = []; open = false; bezig = false;
    teken();
  }

  nieuw();
  return el;
}
