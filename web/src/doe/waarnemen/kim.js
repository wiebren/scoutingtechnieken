// Kim's spel on the screen, three ways (opties.soort):
// - noemen: twelve things for 30 or 60 seconds, then the cloth goes over; pick the ones you saw out of 24.
// - weg: eight things; cloth over, one is taken away; which?
// - veranderd: eight things; cloth over, one is moved to another place; tap it.
// The things are drawn here, each in a box of 40 by 40.
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s, schud } from './hulp.js';
import './wn.css';
import './kim.css';

const DINGEN = {
  sleutel: () => [s('circle', { cx: 12, cy: 20, r: 7, class: 'km-metaal' }), s('circle', { cx: 12, cy: 20, r: 2.5, class: 'km-gat' }), s('path', { d: 'M19 18 H35 V22 H31 V26 H28 V22 H19Z', class: 'km-metaal' })],
  potlood: () => [s('path', { d: 'M6 30 L30 6 L35 11 L11 35 Z', class: 'km-geel' }), s('path', { d: 'M6 30 L11 35 L3 38 Z', class: 'km-hout' }), s('path', { d: 'M30 6 L35 11 L37 9 L32 4Z', class: 'km-roze' })],
  munt: () => [s('circle', { cx: 20, cy: 20, r: 13, class: 'km-goud' }), s('circle', { cx: 20, cy: 20, r: 9, class: 'km-lijn' }), s('text', { x: 20, y: 24, 'text-anchor': 'middle', class: 'km-tekst' }, '1')],
  knoop: () => [s('circle', { cx: 20, cy: 20, r: 12, class: 'km-rood' }), ...[[16, 16], [24, 16], [16, 24], [24, 24]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 1.8, class: 'km-gat' }))],
  schelp: () => [s('path', { d: 'M20 34 L6 14 Q20 2 34 14 Z', class: 'km-schelp' }), s('path', { d: 'M20 34 L13 9 M20 34 L20 6 M20 34 L27 9', class: 'km-lijn' })],
  dennenappel: () => [s('ellipse', { cx: 20, cy: 21, rx: 9, ry: 14, class: 'km-hout' }), s('path', { d: 'M12 14 L28 22 M12 22 L28 14 M12 28 L28 20 M13 20 L27 28', class: 'km-lijn' })],
  eikel: () => [s('ellipse', { cx: 20, cy: 25, rx: 8, ry: 10, class: 'km-eikel' }), s('path', { d: 'M10 18 Q20 8 30 18 Z', class: 'km-hout' }), s('path', { d: 'M20 12 V7', class: 'km-lijn' })],
  veer: () => [s('path', { d: 'M8 34 Q14 10 33 5 Q30 26 8 34 Z', class: 'km-veer' }), s('path', { d: 'M5 37 L30 9', class: 'km-lijn' })],
  kompas: () => [s('circle', { cx: 20, cy: 20, r: 14, class: 'km-wit' }), s('path', { d: 'M20 8 L23 20 L17 20Z', class: 'km-rood' }), s('path', { d: 'M20 32 L23 20 L17 20Z', class: 'km-donker' })],
  fluitje: () => [s('path', { d: 'M6 16 H26 Q36 16 36 25 Q36 34 26 34 Q17 34 17 26 H6 Z', class: 'km-metaal' }), s('rect', { x: 20, y: 18, width: 4, height: 4, class: 'km-gat' })],
  touw: () => [s('path', { d: 'M4 30 Q12 10 20 20 Q28 30 36 10', class: 'km-touw' }), s('circle', { cx: 20, cy: 20, r: 4, class: 'km-touw-knoop' })],
  lepel: () => [s('ellipse', { cx: 12, cy: 12, rx: 7, ry: 9, transform: 'rotate(-45 12 12)', class: 'km-metaal' }), s('path', { d: 'M16 16 L35 35', class: 'km-steel' })],
  steen: () => [s('path', { d: 'M8 26 Q6 14 18 12 Q32 10 33 22 Q34 32 20 32 Q10 32 8 26Z', class: 'km-steen' })],
  blad: () => [s('path', { d: 'M20 4 Q34 16 20 36 Q6 16 20 4Z', class: 'km-blad' }), s('path', { d: 'M20 8 V38', class: 'km-lijn' })],
  kaars: () => [s('rect', { x: 15, y: 14, width: 10, height: 22, class: 'km-wit' }), s('path', { d: 'M20 4 Q25 10 20 13 Q15 10 20 4Z', class: 'km-vlam' })],
  batterij: () => [s('rect', { x: 6, y: 14, width: 26, height: 12, rx: 2, class: 'km-donker' }), s('rect', { x: 32, y: 17, width: 3, height: 6, class: 'km-metaal' }), s('rect', { x: 6, y: 14, width: 9, height: 12, class: 'km-goud' })],
  paperclip: () => [s('path', { d: 'M14 34 V10 Q14 5 19 5 Q24 5 24 10 V30 Q24 33 21 33 Q18 33 18 30 V12', class: 'km-draad' })],
  dobbelsteen: () => [s('rect', { x: 8, y: 8, width: 24, height: 24, rx: 4, class: 'km-wit' }), ...[[14, 14], [20, 20], [26, 26]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 2.2, class: 'km-donker' }))],
  lucifer: () => [s('path', { d: 'M8 33 L30 11', class: 'km-steel-hout' }), s('circle', { cx: 31, cy: 10, r: 3.5, class: 'km-rood' })],
  pleister: () => [s('rect', { x: 4, y: 15, width: 32, height: 10, rx: 5, transform: 'rotate(-20 20 20)', class: 'km-pleister' }), s('rect', { x: 15, y: 15, width: 10, height: 10, transform: 'rotate(-20 20 20)', class: 'km-wit' })],
  ballon: () => [s('ellipse', { cx: 20, cy: 15, rx: 10, ry: 12, class: 'km-blauw' }), s('path', { d: 'M20 27 Q17 32 21 38', class: 'km-lijn' })],
  ster: () => [s('path', { d: 'M20 4 L24 15 L36 15 L26 22 L30 34 L20 27 L10 34 L14 22 L4 15 L16 15Z', class: 'km-goud' })],
  bril: () => [s('circle', { cx: 11, cy: 22, r: 7, class: 'km-lijn-dik' }), s('circle', { cx: 29, cy: 22, r: 7, class: 'km-lijn-dik' }), s('path', { d: 'M18 21 Q20 18 22 21', class: 'km-lijn-dik' })],
  schaar: () => [s('circle', { cx: 10, cy: 30, r: 5, class: 'km-lijn-dik' }), s('circle', { cx: 22, cy: 32, r: 5, class: 'km-lijn-dik' }), s('path', { d: 'M13 26 L34 6 M19 28 L30 8', class: 'km-steel' })],
};
const NAMEN = { sleutel: 'sleutel', potlood: 'potlood', munt: 'munt', knoop: 'knoop', schelp: 'schelp', dennenappel: 'dennenappel', eikel: 'eikel', veer: 'veer', kompas: 'kompas', fluitje: 'fluitje', touw: 'touwtje', lepel: 'lepel', steen: 'steen', blad: 'blad', kaars: 'kaars', batterij: 'batterij', paperclip: 'paperclip', dobbelsteen: 'dobbelsteen', lucifer: 'lucifer', pleister: 'pleister', ballon: 'ballon', ster: 'ster', bril: 'bril', schaar: 'schaar' };
const VAKKEN = [4, 4];              // the cloth: 4 by 4 places, each 80 by 70

export default function kim({ soort = 'noemen' } = {}) {
  const aantal = soort === 'noemen' ? 12 : 8;
  let tijd = soort === 'noemen' ? 60 : 20;
  let fase = 'klaar';                // klaar, kijken, raden, uitslag
  let ligt = [];                     // [{ ding, plek }]
  let weg = null; let verplaatst = null;
  let gekozen = new Set();
  let klok = 0; let eind = 0;

  const doek = s('rect', { x: 2, y: 2, width: 316, height: 276, rx: 10, class: 'km-doek' });
  const dingen = s('g', {});
  const svg = s('svg', { viewBox: '0 0 320 280', class: 'wn-svg km-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 320, height: 280, rx: 12, class: 'km-tafel' }), dingen, doek);

  const teller = h('p.wn-groot', { 'aria-live': 'off' });
  const melding = h('p', { 'aria-live': 'polite' });
  const keuzes = h('div.km-keuzes', { role: 'group', 'aria-label': 'Wat lag er?' });
  const startKnop = h('button.knop.hoofd', { type: 'button', onclick: start }, 'Haal de doek eraf');
  const klaarKnop = h('button.knop.klein', { type: 'button', hidden: true, onclick: dekToe }, 'Ik heb het onthouden');
  const nakijk = h('button.knop.hoofd.klein', { type: 'button', hidden: true, onclick: kijkNa }, 'Kijk na');
  const tijdChips = soort === 'noemen' && keuze([[30, '30 seconden'], [60, '1 minuut']], tijd, (t) => { tijd = t; });

  const el = h('div.wn.doe-kim',
    h('p', { noemen: `Er liggen ${aantal} dingen onder de doek. Onthoud er zoveel mogelijk.`, weg: 'Onthoud wat er ligt. Daarna haalt iemand er één weg.', veranderd: 'Onthoud waar alles ligt. Daarna legt iemand één ding ergens anders.' }[soort]),
    tijdChips && h('div.chips', { role: 'group', 'aria-label': 'Hoe lang kijken' }, tijdChips),
    svg, h('div.wn-rij', startKnop, klaarKnop, teller), melding, keuzes, h('div.knop-rij', nakijk));

  const plekXY = (p) => [8 + (p % VAKKEN[0]) * 78 + 18, 10 + Math.floor(p / VAKKEN[0]) * 68 + 14];

  function legNeer() {
    dingen.replaceChildren(...ligt.filter((x) => x.ding !== weg).map(({ ding, plek }) => {
      const [x, y] = plekXY(plek);
      const g = s('g', { transform: `translate(${x} ${y})`, class: 'km-ding', 'data-ding': ding },
        s('rect', { x: -4, y: -4, width: 48, height: 48, rx: 8, class: 'km-vak' }), DINGEN[ding]());
      if (fase === 'raden' && soort === 'veranderd') {
        g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', NAMEN[ding]);
        g.addEventListener('click', () => kiesVerplaatst(ding));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kiesVerplaatst(ding); } });
      }
      if (fase === 'uitslag' && ding === verplaatst) g.classList.add('km-juist');
      return g;
    }));
    svg.setAttribute('aria-label', fase === 'kijken' || (fase === 'raden' && soort === 'veranderd') || fase === 'uitslag'
      ? `Op tafel: ${ligt.filter((x) => x.ding !== weg).map((x) => NAMEN[x.ding]).join(', ')}.` : 'Een doek over de tafel.');
  }

  function start() {
    const alle = schud(Object.keys(DINGEN));
    const plekken = schud([...Array(16).keys()]);
    ligt = alle.slice(0, aantal).map((ding, i) => ({ ding, plek: plekken[i] }));
    weg = null; verplaatst = null; gekozen = new Set();
    fase = 'kijken';
    legNeer();
    doek.classList.add('weg');
    startKnop.hidden = true; klaarKnop.hidden = false; nakijk.hidden = true;
    keuzes.replaceChildren(); melding.textContent = 'Kijk goed!';
    eind = performance.now() + tijd * 1000;
    tel();
  }

  function tel() {
    if (fase !== 'kijken' || !el.isConnected) return;
    const rest = Math.ceil((eind - performance.now()) / 1000);
    teller.textContent = `${Math.max(0, rest)} s`;
    if (rest <= 0) { dekToe(); return; }
    klok = setTimeout(tel, 200);
  }

  function dekToe() {
    clearTimeout(klok);
    teller.textContent = '';
    klaarKnop.hidden = true;
    doek.classList.remove('weg');
    if (soort === 'noemen') {
      fase = 'raden';
      const rest = schud(Object.keys(DINGEN).filter((d) => !ligt.some((x) => x.ding === d))).slice(0, 24 - aantal);
      toonKeuzes(schud([...ligt.map((x) => x.ding), ...rest]), true);
      melding.textContent = 'De doek ligt erover. Tik alles aan wat er lag, en kijk dan na.';
      nakijk.hidden = false;
    } else {
      melding.textContent = soort === 'weg' ? 'Iemand haalt er iets weg…' : 'Iemand legt iets op een andere plek…';
      setTimeout(() => {
        if (!el.isConnected) return;
        if (soort === 'weg') weg = ligt[Math.floor(Math.random() * ligt.length)].ding;
        else {
          const vrij = [...Array(16).keys()].filter((p) => !ligt.some((x) => x.plek === p));
          const ding = ligt[Math.floor(Math.random() * ligt.length)];
          ding.plek = vrij[Math.floor(Math.random() * vrij.length)];
          verplaatst = ding.ding;
        }
        fase = 'raden';
        legNeer();
        doek.classList.add('weg');
        if (soort === 'weg') {
          toonKeuzes(schud(ligt.map((x) => x.ding)), false);
          melding.textContent = 'Wat is er weg? Tik het aan.';
        } else {
          melding.textContent = 'Wat ligt er op een andere plek? Tik het aan op de tafel.';
        }
      }, 900);
    }
  }

  function toonKeuzes(lijst, meer) {
    keuzes.replaceChildren(...lijst.map((ding) => {
      const b = h('button.chip.km-chip', { type: 'button', 'aria-pressed': 'false', 'data-ding': ding,
        onclick: () => {
          if (fase !== 'raden') return;
          if (meer) { gekozen.has(ding) ? gekozen.delete(ding) : gekozen.add(ding); b.setAttribute('aria-pressed', String(gekozen.has(ding))); } else kiesWeg(ding);
        } },
      s('svg', { viewBox: '0 0 40 40', class: 'km-mini', 'aria-hidden': 'true' }, DINGEN[ding]()), NAMEN[ding]);
      return b;
    }));
  }

  function kijkNa() {
    fase = 'uitslag';
    nakijk.hidden = true;
    const lag = new Set(ligt.map((x) => x.ding));
    let goed = 0; let fout = 0;
    for (const b of keuzes.children) {
      const d = b.dataset.ding;
      if (lag.has(d)) b.classList.add(gekozen.has(d) ? 'goed' : 'gemist');
      else if (gekozen.has(d)) { b.classList.add('fout'); fout += 1; }
      if (lag.has(d) && gekozen.has(d)) goed += 1;
    }
    doek.classList.add('weg');
    legNeer();
    melding.textContent = `Je had ${goed} van de ${aantal} goed${fout ? `, en ${fout} ${fout === 1 ? 'ding' : 'dingen'} die er niet lagen` : ''}. ${goed >= aantal * 2 / 3 ? 'Twee derde of meer: zoveel vroeg de eis van 1928 ook (16 van de 24, na een minuut kijken).' : 'Groen is goed, gestreept heb je gemist.'}`;
    opnieuw();
  }

  function kiesWeg(ding) {
    fase = 'uitslag';
    for (const b of keuzes.children) {
      if (b.dataset.ding === weg) b.classList.add('goed');
      else if (b.dataset.ding === ding) b.classList.add('fout');
    }
    melding.textContent = ding === weg ? `Goed! De ${NAMEN[weg]} is weg.` : `Nee, de ${NAMEN[weg]} is weg.`;
    opnieuw();
  }

  function kiesVerplaatst(ding) {
    if (fase !== 'raden') return;
    fase = 'uitslag';
    legNeer();
    melding.textContent = ding === verplaatst ? `Goed! De ${NAMEN[verplaatst]} lag eerst ergens anders.` : `Nee, het was de ${NAMEN[verplaatst]} (met de rand).`;
    opnieuw();
  }

  function opnieuw() { startKnop.hidden = false; startKnop.textContent = 'Nog een keer'; }

  legNeer();
  return el;
}
