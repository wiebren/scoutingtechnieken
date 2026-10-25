// Afstand schatten op zicht: someone in a field, drawn as small as they would look at that distance, with only the
// details you can still see there (the table Baden-Powell took from the German army in 1908, in metres). Kijk: slide
// the distance and see what goes. Schat: guess how far someone is; within 25 % counts, as for the NPV in 1916.
import { h } from '../../dom.js';
import { actie, acties, keuze } from '../knoppen.js';
import { getal, s, tussen } from './hulp.js';
import '../vorm.css';
import './wn.css';
import './zichtafstand.css';

// what you still see up to that distance (BP 1908: 50, 100, 200, 300, 400, 500 yards, rounded to metres)
const ZICHT = [
  { tot: 45, wat: 'mond en ogen goed te zien' },
  { tot: 90, wat: 'de ogen zijn puntjes' },
  { tot: 180, wat: 'knopen en details van de kleding' },
  { tot: 275, wat: 'het gezicht is nog te zien' },
  { tot: 365, wat: 'je ziet de benen bewegen' },
  { tot: 455, wat: 'je ziet de kleur van de kleding' },
];
const HORIZON = 112;
const hoogte = (d) => 6600 / d;                 // how tall someone looks, in px
const voet = (d) => HORIZON + 4200 / d;          // where the feet are: nearer is lower in the picture

export default function zichtAfstand() {
  let modus = 'kijk';
  let afstand = 90;
  let opgave = null;
  let goed = 0; let gedaan = 0;

  // -- the figure, drawn 100 units tall around its feet at 0,0; scaled and moved per distance
  const benen = s('g', { class: 'za-benen' },
    s('path', { d: 'M-4 -46 L-7 0', class: 'za-been za-been-l' }), s('path', { d: 'M4 -46 L7 0', class: 'za-been za-been-r' }));
  const lijf = s('path', { d: 'M-12 -82 Q0 -88 12 -82 L11 -44 L-11 -44 Z', class: 'za-lijf' });
  const armen = s('path', { d: 'M-12 -80 L-17 -52 M12 -80 L17 -52', class: 'za-arm' });
  const hoofd = s('circle', { cx: 0, cy: -92, r: 8, class: 'za-hoofd' });
  const haar = s('path', { d: 'M-8 -94 Q0 -104 8 -94 Q4 -99 0 -99 Q-4 -99 -8 -94Z', class: 'za-haar' });
  const ogen = s('g', { class: 'za-ogen' }, s('circle', { cx: -3, cy: -93, r: 1.1 }), s('circle', { cx: 3, cy: -93, r: 1.1 }));
  const mond = s('path', { d: 'M-2.5 -88.5 Q0 -87 2.5 -88.5', class: 'za-mond' });
  const knopen = s('g', { class: 'za-knopen' }, [-76, -68, -60, -52].map((y) => s('circle', { cx: 0, cy: y, r: 1.2 })));
  const persoon = s('g', { class: 'za-persoon' }, benen, armen, lijf, knopen, hoofd, haar, ogen, mond);

  const bomen = [[30, 0.9], [300, 1.1], [338, 0.7]].map(([x, k]) => s('g', { transform: `translate(${x} ${HORIZON}) scale(${k})` },
    s('rect', { x: -1.5, y: -14, width: 3, height: 14, class: 'stam' }), s('circle', { cx: 0, cy: -18, r: 8, class: 'kruin' })));
  const svg = s('svg', { viewBox: '0 0 360 210', class: 'wn-svg wn-rand za-svg', role: 'img' },
    s('rect', { x: 0, y: 0, width: 360, height: HORIZON, class: 'lucht' }),
    s('rect', { x: 0, y: HORIZON, width: 360, height: 210 - HORIZON, class: 'gras' }),
    s('path', { d: `M0 ${HORIZON} Q90 ${HORIZON - 6} 180 ${HORIZON - 2} T360 ${HORIZON - 4} V${HORIZON} Z`, class: 'gras-donker' }),
    bomen, persoon);

  // -- the words
  const schuifTekst = h('strong');
  const schuif = h('input.doe-schuif', { type: 'range', min: 20, max: 600, step: 5, value: afstand, 'aria-label': 'Afstand in meters',
    oninput: () => { afstand = Number(schuif.value); teken(); } });
  const lijst = h('ul.za-lijst');
  const kijkDeel = h('div.wn-tekst', h('label.doe-label', h('span', 'Afstand: ', schuifTekst), schuif), lijst);

  const veld = h('input.doe-veld', { type: 'number', min: 1, max: 2000, inputmode: 'numeric', 'aria-label': 'Jouw schatting in meters',
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); controleer(); } } });
  const melding = h('p.doe-melding', { 'aria-live': 'polite' });
  const score = h('p.wn-score');
  const volgende = actie('Nog een', 'opnieuw', nieuw, { klein: true });
  const schatDeel = h('div.wn-tekst',
    h('p', 'Hoe ver staat deze persoon? Binnen 25 % is goed.'),
    h('div.wn-rij', veld, h('span', 'meter')),
    acties(actie('Kijk na', 'vink', controleer, { hoofd: true, klein: true }), volgende),
    melding, score);

  const omschrijving = h('p.doe-sr', { 'aria-live': 'polite' });
  const chips = keuze([['kijk', 'Kijken'], ['schat', 'Zelf schatten']], modus, (m) => { modus = m; wissel(); });
  const el = h('div.wn.doe-zicht', h('div.chips', { role: 'group', 'aria-label': 'Kies' }, chips), svg, omschrijving, kijkDeel, schatDeel);

  function teken() {
    const d = modus === 'kijk' ? afstand : opgave;
    const k = hoogte(d) / 100;
    const x = modus === 'kijk' ? 180 : 120 + (d % 7) * 18;
    persoon.setAttribute('transform', `translate(${x} ${voet(d).toFixed(1)}) scale(${k.toFixed(3)})`);
    const zichtbaar = (tot) => d <= tot;
    ogen.style.display = zichtbaar(90) ? '' : 'none';
    ogen.classList.toggle('groot', d <= 45);
    mond.style.display = zichtbaar(45) ? '' : 'none';
    knopen.style.display = zichtbaar(180) ? '' : 'none';
    persoon.classList.toggle('geen-gezicht', !zichtbaar(275));
    persoon.classList.toggle('loopt', zichtbaar(365));
    persoon.classList.toggle('grijs', !zichtbaar(455));
    if (modus === 'kijk') {
      schuifTekst.textContent = `${getal(afstand)} m`;
      const wel = ZICHT.filter((z) => d <= z.tot);
      lijst.replaceChildren(...ZICHT.map((z) => h('li', { class: d <= z.tot ? 'wel' : 'niet' }, `tot ±${z.tot} m: ${z.wat}`)));
      omschrijving.textContent = `Iemand op ${getal(afstand)} meter. ${wel.length ? `Je ziet nog: ${wel.map((z) => z.wat).join('; ')}.` : 'Je ziet alleen nog een donker figuurtje.'}`;
      svg.setAttribute('aria-label', omschrijving.textContent);
    } else {
      svg.setAttribute('aria-label', 'Iemand in een weiland, op een onbekende afstand.');
    }
  }

  function nieuw() {
    opgave = tussen(6, 110) * 5;
    veld.value = ''; melding.textContent = ''; melding.classList.remove('fout');
    teken();
    veld.focus({ preventScroll: true });
  }

  function controleer() {
    const g = Number(veld.value);
    if (!veld.value || !(g > 0)) { melding.textContent = 'Vul een afstand in meters in.'; melding.classList.add('fout'); return; }
    const fout = Math.abs(g - opgave) / opgave;
    gedaan += 1;
    if (fout <= 0.25) goed += 1;
    melding.classList.toggle('fout', fout > 0.25);
    const wat = ZICHT.find((z) => opgave <= z.tot);
    melding.textContent = `${fout <= 0.25 ? 'Goed!' : 'Mis.'} Het was ${getal(opgave)} m; jij zei ${getal(g)} m (${getal(Math.round(fout * 100))} % ernaast). ${wat ? `Hint: tot ±${wat.tot} m geldt: ${wat.wat}.` : 'Zo ver gaat de tabel niet: kies een punt halverwege, schat die afstand en verdubbel hem.'}`;
    score.textContent = `${goed} van de ${gedaan} binnen 25 %.`;
  }

  function wissel() {
    kijkDeel.hidden = modus !== 'kijk';
    schatDeel.hidden = modus !== 'schat';
    if (modus === 'schat') nieuw(); else teken();
  }

  wissel();
  return el;
}
