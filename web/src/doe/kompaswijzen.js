// Point at the parts of the baseplate compass: the piece names a part, you tap it in the compass of kompas.js (or
// pick it with the keyboard). The parts are the ones the blad kompas-onderdelen names. "Draai het kompas" swaps in
// the compass to turn, so the blad keeps that too.
import { h } from '../dom.js';
import { kompasDelen, s } from './kompasdelen.js';
import { keuze } from './knoppen.js';
import './vorm.css';
import './kompas.css';
import './kompaswijzen.css';

/** The parts: what the question calls it, and what it is for. */
const DELEN = {
  plaat: ['de plaat', 'Het doorzichtige plaatje. Je legt het op de kaart.'],
  liniaal: ['de liniaal', 'Die zit langs de rand van de plaat. Daarmee meet je op de kaart.'],
  richtingspijl: ['de richtingspijl', 'Die wijst de kant op waar je heen gaat.'],
  huis: ['het huis', 'Het ronde doosje. Je kunt het draaien.'],
  gradenring: ['de gradenring', 'De rand van het huis, met de graden van 0 tot 360.'],
  naald: ['de naald', 'Die drijft in het huis. De rode kant wijst naar het noorden.'],
  noordlijnen: ['de noordlijnen', 'Die leg je gelijk met de lijnen op de kaart.'],
  orientatiepijl: ['de oriëntatiepijl', 'Het huisje onder de naald. Draai tot de rode punt erin staat: rood in het huisje.'],
};
/** A tap on one of these parts is a tap on the part around it too. */
const IN = { gradenring: 'huis', noordlijnen: 'huis', orientatiepijl: 'huis', liniaal: 'plaat' };

const schud = (lijst) => {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uit[i], uit[j]] = [uit[j], uit[i]]; }
  return uit;
};

/** The compass of kompasDelen(), with its pieces regrouped into one group per part, each with a wide place to tap. */
function kompasMetDelen() {
  const { plaat, huis, naald } = kompasDelen();
  const deel = (naam, ...kids) => s('g', { 'data-deel': naam }, ...kids);
  const raak = (attrs) => s('path', { class: 'kd-raak', ...attrs });
  const kids = (g, cls) => [...g.children].filter((c) => c.classList.contains(cls));

  const ring = deel('gradenring', ...kids(huis, 'kk-ring'), ...kids(huis, 'kk-streep'), ...kids(huis, 'kk-letter'), ...kids(huis, 'kk-getal'));
  const binnen = deel('huis', ...kids(huis, 'kk-binnen'));
  const noord = deel('noordlijnen', ...kids(huis, 'kk-noordlijn').flatMap((l) => [raak({ d: l.getAttribute('d'), 'stroke-width': 9 }), l]));
  const huisje = deel('orientatiepijl', raak({ d: 'M-12 -20L0 -50L12 -20V33H-12Z' }), ...kids(huis, 'kk-huisje'));
  huis.replaceChildren(ring, binnen, noord, huisje);
  huis.setAttribute('transform', 'rotate(-60)');          // the housing turned, so the needle is not in the huisje

  const vlak = deel('plaat', ...kids(plaat, 'kk-plaat-vlak'));
  const pijl = deel('richtingspijl', raak({ d: 'M0 -142l16 34h-8v38h-16v-38h-8z' }), ...kids(plaat, 'kk-richting'), ...kids(plaat, 'kk-index'));
  const liniaal = deel('liniaal', raak({ d: 'M-66 78h26v70h-26z' }), ...kids(plaat, 'kk-liniaal'), ...kids(plaat, 'kk-klein'));
  plaat.replaceChildren(vlak, pijl, liniaal, huis);
  const nld = deel('naald', raak({ d: 'M0 -56L10 0L0 56L-10 0z' }), ...naald.children);
  nld.setAttribute('class', 'kk-naald');
  return s('svg', { viewBox: '-72 -152 144 306', class: 'kd-svg', role: 'group', 'aria-label': 'Een plaatkompas met zijn delen' }, plaat, nld);
}

export default function kompaswijzen() {
  let rij = []; let vraag = null; let goed = 0; let gehad = 0; let wacht = false; let draaien = null;

  const vraagTekst = h('p.kd-vraag', { 'aria-live': 'polite' });   // the next question comes by itself: say it
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.doe-stil');
  const svg = kompasMetDelen();
  const groepen = [...svg.querySelectorAll('[data-deel]')];
  // the keyboard goes from the outside in, as you would point at them
  const volgorde = ['plaat', 'liniaal', 'richtingspijl', 'huis', 'gradenring', 'noordlijnen', 'orientatiepijl', 'naald'];
  for (const gr of groepen) {
    const naam = gr.dataset.deel;
    gr.setAttribute('tabindex', '0');
    gr.setAttribute('role', 'button');
    gr.setAttribute('aria-label', DELEN[naam][0]);
    gr.classList.add('kd-deel');
    gr.addEventListener('click', (e) => { e.stopPropagation(); antwoord(naam, gr); });
    gr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); antwoord(naam, gr); }
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) {
        e.preventDefault();
        const i = (volgorde.indexOf(naam) + d + volgorde.length) % volgorde.length;
        groepen.find((g) => g.dataset.deel === volgorde[i]).focus();
      }
    });
  }

  const oefen = h('div.kd-oefen', h('div.kd-beeld', svg), h('div.kd-tekst', vraagTekst, melding, score));
  const plek = h('div.kd-draai', { hidden: true }, h('p.leeg', 'Even laden…'));
  const chips = keuze([['wijs', 'Wijs de delen aan'], ['draai', 'Draai het kompas']], 'wijs', (w) => {
    oefen.hidden = w !== 'wijs'; plek.hidden = w === 'wijs';
    if (w === 'draai' && !draaien) {
      draaien = import('./kompas.js').then(({ default: kompas }) => plek.replaceChildren(kompas()));
    }
  });

  function volgende() {
    if (!rij.length) rij = schud(Object.keys(DELEN));
    vraag = rij.pop(); wacht = false;
    for (const gr of groepen) gr.classList.remove('goed', 'fout');
    vraagTekst.replaceChildren('Tik op ', h('strong', DELEN[vraag][0]), '.');
  }

  function antwoord(naam, gr) {
    if (wacht) return;                              // right answer given, the next question is coming
    gehad += 1;
    const raak = naam === vraag || IN[naam] === vraag;
    if (raak) {
      goed += 1; wacht = true;
      const juist = groepen.find((g) => g.dataset.deel === vraag);
      juist.classList.add('goed');
      melding.classList.remove('fout');
      melding.textContent = naam === vraag ? `Goed: ${DELEN[vraag][0]}. ${DELEN[vraag][1]}`
        : `Goed: ${DELEN[naam][0]} hoort bij ${DELEN[vraag][0]}. ${DELEN[vraag][1]}`;
      score.textContent = `${goed} van de ${gehad} goed.`;
      setTimeout(() => { if (svg.isConnected) volgende(); }, 2200);
    } else {
      gr.classList.add('fout');
      melding.classList.add('fout');
      melding.textContent = `Nee, dat is ${DELEN[naam][0]}. ${DELEN[naam][1]} Probeer het nog eens.`;
      score.textContent = `${goed} van de ${gehad} goed.`;
    }
  }

  volgende();
  return h('div.doe-kompaswijzen', h('div.chips', chips), oefen, plek);
}
