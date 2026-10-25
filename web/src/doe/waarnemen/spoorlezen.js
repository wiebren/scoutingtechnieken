// Een spoor lezen: a trail of footprints in the sand, from above. Which way did they go, and did they walk, run or
// walk backwards? Walking: the whole foot pressed in evenly, normal steps (drawn with the toes a little out). Running: deep toes,
// sand kicked up, long steps. Backwards: short steps, toes turned in, deep heels - and they went the other way
// from where the toes point (Baden-Powell, 1908).
import { h } from '../../dom.js';
import { actie, acties } from '../knoppen.js';
import { s, schud } from './hulp.js';
import './wn.css';
import './spoorlezen.css';

const RICHTING = [['op', 'naar boven', 0], ['rechts', 'naar rechts', 90], ['neer', 'naar beneden', 180], ['links', 'naar links', 270]];
const GANG = [
  ['lopen', 'Gelopen', { pas: 64, hoek: 9, teen: 0.55, hiel: 0.55 }],
  ['rennen', 'Gerend', { pas: 108, hoek: 4, teen: 0.95, hiel: 0.2 }],
  ['achteruit', 'Achteruit gelopen', { pas: 42, hoek: -11, teen: 0.35, hiel: 0.95 }],
];
const UITLEG = {
  lopen: 'Gewone stappen, en de hele voet plat in de grond: tenen en hiel even diep.',
  rennen: 'Lange stappen, diepe tenen en wat opgeschopt zand.',
  achteruit: 'Korte stappen, de tenen naar binnen en diepe hielen. De tenen wijzen de andere kant op dan waar iemand heen ging.',
};

/** A footprint pointing up, around 0,0; links mirrors it. teen and hiel are 0..1: how deep. */
function voet(links, teen, hiel) {
  const m = links ? -1 : 1;
  return s('g', { transform: `scale(${m * 1.15} 1.15)` },
    s('path', { d: 'M-5 -14 Q-7 -20 -3 -23 Q3 -25 6 -19 Q7 -10 5 -4 Q4 4 4 9 Q3 15 -1 15 Q-5 15 -5 9 Q-5 2 -6 -4 Q-6 -10 -5 -14Z', class: 'sl-voet' }),
    s('ellipse', { cx: 0.5, cy: -16, rx: 5, ry: 6, class: 'sl-diep', 'fill-opacity': teen.toFixed(2) }),
    s('ellipse', { cx: -0.5, cy: 9.5, rx: 4, ry: 4.5, class: 'sl-diep', 'fill-opacity': hiel.toFixed(2) }),
    [-4, -1, 2, 5].map((x, i) => s('circle', { cx: x * 0.9, cy: -25 + Math.abs(i - 1.5) * 1.2, r: 1.4, class: 'sl-teen' })));
}

export default function spoorLezen() {
  let opgave = null;
  let antwoord = {};
  let goed = 0; let gedaan = 0;

  const spoor = s('g', {});
  const svg = s('svg', { viewBox: '0 0 360 300', class: 'wn-svg wn-rand sl-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: 300, class: 'zand' }), spoor);

  const richtingKnoppen = RICHTING.map(([k, n]) => h('button.chip', { type: 'button', 'aria-pressed': 'false', onclick: () => kies('richting', k) }, n));
  const gangKnoppen = GANG.map(([k, n]) => h('button.chip', { type: 'button', 'aria-pressed': 'false', onclick: () => kies('gang', k) }, n));
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const nakijk = actie('Kijk na', 'vink', kijkNa, { hoofd: true, klein: true });
  const volgende = actie('Ander spoor', 'opnieuw', nieuw, { klein: true });

  const el = h('div.wn.naast.doe-spoorlezen', svg,
    h('div.wn-tekst',
      h('p', 'Welke kant ging deze persoon op?'),
      h('div.chips', { role: 'group', 'aria-label': 'Richting' }, richtingKnoppen),
      h('p', 'En hoe?'),
      h('div.chips', { role: 'group', 'aria-label': 'Hoe' }, gangKnoppen),
      acties(nakijk, volgende),
      melding, score));

  function kies(soort, k) {
    antwoord[soort] = k;
    const [lijst, knoppen] = soort === 'richting' ? [RICHTING, richtingKnoppen] : [GANG, gangKnoppen];
    knoppen.forEach((b, i) => b.setAttribute('aria-pressed', String(lijst[i][0] === k)));
  }

  function teken() {
    const [, , graden] = RICHTING.find(([k]) => k === opgave.richting);
    const [, , g] = GANG.find(([k]) => k === opgave.gang);
    // the way the toes point: the way they went, except walking backwards
    const tenen = opgave.gang === 'achteruit' ? (graden + 180) % 360 : graden;
    const rad = (graden * Math.PI) / 180;
    const [dx, dy] = [Math.sin(rad), -Math.cos(rad)];
    const tr = (tenen * Math.PI) / 180;
    const [nx, ny] = [Math.cos(tr), Math.sin(tr)];               // to the right of the way the person faces
    const lengte = opgave.richting === 'op' || opgave.richting === 'neer' ? 250 : 310;
    const n = Math.floor(lengte / g.pas) + 1;
    const [cx, cy] = [180, 150];
    const prenten = [];
    for (let i = 0; i < n; i++) {
      const t = (i - (n - 1) / 2) * g.pas;
      const links = i % 2 === 0;
      const zij = (links ? -1 : 1) * 9;
      const x = cx + dx * t + nx * zij; const y = cy + dy * t + ny * zij;
      // toes out (walking, running) or in (backwards), mirrored for the left foot
      const draai = tenen + (links ? -g.hoek : g.hoek);
      const p = s('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${draai})` }, voet(links, g.teen, g.hiel));
      if (opgave.gang === 'rennen') {
        // sand kicked up behind the toes
        p.append(...[[-6, 30], [3, 34], [8, 28], [-2, 38]].map(([sx, sy]) => s('circle', { cx: sx, cy: sy - 4, r: 1.3, class: 'sl-korrel' })));
      }
      prenten.push(p);
    }
    spoor.replaceChildren(...prenten);
    svg.setAttribute('aria-label', 'Voetafdrukken in het zand, van bovenaf gezien. Kijk naar de stappen, de diepte van tenen en hielen en de stand van de voeten.');
  }

  function kijkNa() {
    if (!antwoord.richting || !antwoord.gang) { melding.textContent = 'Kies een richting en hoe.'; melding.classList.add('fout'); return; }
    const r = antwoord.richting === opgave.richting; const gg = antwoord.gang === opgave.gang;
    gedaan += 1; if (r && gg) goed += 1;
    melding.classList.toggle('fout', !(r && gg));
    const richtingNaam = RICHTING.find(([k]) => k === opgave.richting)[1];
    melding.textContent = `${r && gg ? 'Goed!' : r ? 'De richting klopt, de manier niet.' : gg ? 'De manier klopt, de richting niet.' : 'Allebei mis.'} Deze persoon is ${richtingNaam} ${opgave.gang === 'achteruit' ? 'achteruit gelopen' : opgave.gang === 'rennen' ? 'gerend' : 'gelopen'}. ${UITLEG[opgave.gang]}`;
    score.textContent = `${goed} van de ${gedaan} helemaal goed.`;
    nakijk.disabled = true;
  }

  let rij = [];
  function nieuw() {
    if (!rij.length) rij = schud(RICHTING.flatMap(([r]) => GANG.map(([g]) => ({ richting: r, gang: g }))));
    opgave = rij.pop();
    antwoord = {};
    [...richtingKnoppen, ...gangKnoppen].forEach((b) => b.setAttribute('aria-pressed', 'false'));
    melding.textContent = ''; melding.classList.remove('fout');
    nakijk.disabled = false;
    teken();
  }

  nieuw();
  return el;
}
