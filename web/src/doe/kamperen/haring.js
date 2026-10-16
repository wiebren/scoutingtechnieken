// Pegs and guy lines. "Onder welke hoek?": turn a peg with a slider and see how the guy line pulls on it; at about
// 45 degrees, head away from the tent, the line pulls straight across the peg and it holds best. "Welke haring?":
// a kind of ground, and you choose the peg for it. Facts: ScoutWiki Tentharing, Big Agnes, Kampeermeneer, MSR
// (kamperen-uitwerking.md).
import { h } from '../../dom.js';
import { keuze } from '../knoppen.js';
import { s } from '../kompasdelen.js';
import '../vorm.css';
import './kamp.css';

const LIJN = 45;                       // the guy line rises at 45 degrees from the peg to the tent
const GRONDEN = [
  { tekst: 'Een grasveld op een kampeerterrein.', goed: ['hoek', 'y'],
    uitleg: 'Op gras en heide houden hoekharingen en Y-haringen goed: ze hebben meer oppervlak dan een dunne pen.' },
  { tekst: 'Los, droog zand in de duinen.', goed: ['zand'],
    uitleg: 'In zand glijdt een smalle haring er zo uit. Een lange, brede zandharing heeft veel oppervlak. Je kunt hem ook plat ingraven.' },
  { tekst: 'Harde, droge grond vol steentjes.', goed: ['pen', 'y'],
    uitleg: 'Voor harde grond heb je een dunne, sterke pen of rotsharing. Een stevige Y-haring kan ook: die past bijna overal.' },
  { tekst: 'Een stevige weide, en er komt harde wind.', goed: ['y', 'hoek'],
    uitleg: 'Een Y-haring of hoekharing houdt goed in stevige grond. Zet bij harde wind ook alle scheerlijnen vast.' },
];
const HARINGEN = [['pen', 'Pen'], ['hoek', 'Hoekharing'], ['y', 'Y-haring'], ['zand', 'Zandharing']];

export default function haring() {
  let modus = 'hoek';
  let hoek = -10;                      // the peg's lean: degrees from upright, positive = head away from the tent
  let grond = 0; let gekozen = null; let goed = 0; let gedaan = 0;

  // -- the angle: tent at the left, the peg at the right
  const PX = 230; const PY = 120;      // where the peg enters the ground
  const pen = s('path', { class: 'hr-haring' });
  const lijn = s('path', { class: 'hr-lijn' });
  const pijl = s('path', { class: 'hr-pijl' });
  const boog = s('path', { class: 'hr-boog' });
  const boogTekst = s('text', { class: 'kd-label vet', 'text-anchor': 'middle' });
  const hoekSvg = s('svg', { viewBox: '0 0 320 190', class: 'kd-svg', role: 'img' },
    s('rect', { x: 0, y: PY, width: 320, height: 70, class: 'kd-gras' }), s('path', { d: `M0 ${PY}H320`, class: 'kd-touw' }),
    s('path', { d: `M0 ${PY}V26H146L172 ${PY}Z`, class: 'kd-tent' }),
    s('path', { d: `M${PX} ${PY}V${PY + 60}`, class: 'hr-hulp' }),
    lijn, pen, pijl, boog, boogTekst);
  const schuif = h('input.doe-schuif', { type: 'range', min: -40, max: 80, step: 5, value: hoek, 'aria-label': 'Hoek van de haring',
    oninput: () => { hoek = Number(schuif.value); tekenHoek(); } });
  const hoekWaarde = h('output');
  const hoekMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const hoekVak = h('div.kd-tekst',
    h('label.doe-label', h('span', 'Schuin zetten: ', hoekWaarde), schuif),
    hoekMelding);

  function tekenHoek() {
    const r = (hoek * Math.PI) / 180;
    // the peg: 60 long, a third above the ground; its head leans away from the tent for positive angles
    const kop = [PX + Math.sin(r) * 16, PY - Math.cos(r) * 16];
    const punt = [PX - Math.sin(r) * 44, PY + Math.cos(r) * 44];
    pen.setAttribute('d', `M${kop[0]} ${kop[1]}L${punt[0]} ${punt[1]}`);
    // the line pulls from just below the head towards the tent, rising at 45 degrees
    const vast = [PX + Math.sin(r) * 10, PY - Math.cos(r) * 10];
    lijn.setAttribute('d', `M${vast[0]} ${vast[1]}L${vast[0] - 82} ${vast[1] - 82}`);
    // the angle between line and peg
    const tussen = LIJN + hoek;
    const a0 = (-90 + hoek) * (Math.PI / 180);
    boog.setAttribute('d', `M${PX} ${PY}m${Math.cos(a0) * 22} ${Math.sin(a0) * 22}A22 22 0 0 0 ${PX + Math.cos((-180 + LIJN) * (Math.PI / 180)) * 22} ${PY + Math.sin((-180 + LIJN) * (Math.PI / 180)) * 22}`);
    boogTekst.setAttribute('x', PX - 10); boogTekst.setAttribute('y', PY - 30);
    boogTekst.textContent = `${tussen}°`;
    hoekWaarde.textContent = hoek === 0 ? 'rechtop' : `${Math.abs(hoek)}° ${hoek > 0 ? 'van de tent af' : 'naar de tent toe'}`;
    // which way it gives: towards the tent, the line slides up the peg and lifts it out
    let tekst; let soort;
    if (hoek < 0) {
      soort = 'fout';
      tekst = 'Kop naar de tent: de lijn glijdt langs de haring omhoog en trekt hem eruit.';
      pijl.setAttribute('d', `M${kop[0] + 12} ${kop[1] + 4}l0 -26m-5 7l5 -7l5 7`);
    } else if (hoek < 30) {
      soort = 'matig';
      tekst = 'Bijna rechtop: dat houdt, maar de lijn trekt schuin aan de haring. Zet hem schuiner, met de kop van de tent af.';
      pijl.setAttribute('d', `M${kop[0] + 12} ${kop[1] + 4}l-10 -14m0 8l0 -8l7 2`);
    } else if (hoek <= 60) {
      soort = 'goed';
      tekst = `Goed: schuin, met de kop van de tent af. De lijn trekt dwars op de haring (${tussen}°): zo zit hij het vastst.`;
      pijl.setAttribute('d', '');
    } else {
      soort = 'matig';
      tekst = 'Te plat: de haring zit maar ondiep in de grond, en een harde ruk trekt hem eruit.';
      pijl.setAttribute('d', `M${kop[0] + 12} ${kop[1] + 4}l-14 -10m6 1l-6 -1l3 -6`);
    }
    hoekMelding.classList.toggle('fout', soort === 'fout');
    hoekMelding.textContent = tekst;
    pen.setAttribute('class', `hr-haring ${soort}`);
    hoekSvg.setAttribute('aria-label', `Een haring ${hoekWaarde.textContent}, met een scheerlijn die onder 45 graden naar de tent loopt. ${tekst}`);
  }

  // -- which peg for which ground
  const grondTekst = h('p.kd-vraag', { 'aria-live': 'polite' });
  const keuzes = h('div.knop-rij');
  const grondMelding = h('p.doe-melding', { 'aria-live': 'polite' });
  const volgende = h('button.knop.klein.hoofd', { type: 'button', hidden: true, onclick: () => { grond = (grond + 1) % GRONDEN.length; nieuweGrond(); } }, 'Andere grond');
  const score = h('p.kd-score');
  const grondVak = h('div.kd-tekst', { hidden: true }, grondTekst, keuzes, grondMelding, h('div.knop-rij', volgende), score);

  function nieuweGrond() {
    gekozen = null;
    grondTekst.textContent = `${GRONDEN[grond].tekst} Welke haring kies je?`;
    grondMelding.textContent = ''; grondMelding.classList.remove('fout');
    keuzes.replaceChildren(...HARINGEN.map(([id, naam]) => h('button.knop.klein', { type: 'button', 'data-id': id, onclick: () => kiesHaring(id) }, naam)));
    volgende.hidden = true;
    score.textContent = gedaan ? `Goed: ${goed} van ${gedaan}` : '';
  }
  function kiesHaring(id) {
    if (gekozen) return;
    gekozen = id; gedaan++;
    const g = GRONDEN[grond]; const raak = g.goed.includes(id);
    if (raak) goed++;
    for (const k of keuzes.children) {
      k.disabled = true;
      k.classList.toggle('kd-goed', g.goed.includes(k.dataset.id));
      k.classList.toggle('kd-fout', k.dataset.id === id && !raak);
    }
    grondMelding.classList.toggle('fout', !raak);
    grondMelding.textContent = `${raak ? 'Goed!' : 'Niet de beste keus.'} ${g.uitleg}`;
    volgende.hidden = false;
    volgende.focus({ preventScroll: true });
    score.textContent = `Goed: ${goed} van ${gedaan}`;
  }

  const beeldVak = h('div', hoekSvg);
  const chips = keuze([['hoek', 'Onder welke hoek?'], ['grond', 'Welke haring?']], modus, (m) => {
    modus = m;
    hoekVak.hidden = m !== 'hoek'; beeldVak.hidden = m !== 'hoek'; grondVak.hidden = m !== 'grond';
  });

  tekenHoek();
  grond = Math.floor(Math.random() * GRONDEN.length);
  nieuweGrond();
  return h('div.kd.doe-haring', h('div.chips', { role: 'group', 'aria-label': 'Kies wat je oefent' }, chips),
    h('div.kd.naast', beeldVak, h('div', hoekVak, grondVak)));
}
